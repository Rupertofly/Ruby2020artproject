import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  DirectionalLight,
  HemisphereLight,
  Vector2,
  SphereBufferGeometry,
  MeshLambertMaterial,
  Mesh,
  PlaneBufferGeometry,
  Vector3,
  Group,
  Shape,
  ExtrudeBufferGeometry,
  MeshPhysicalMaterial,
} from 'three';
import {
  scaleQuantize,
  range,
  contours,
  scaleLinear,
} from 'd3';
import * as NS from '@rupertofly/noise';
import { CaptureClient } from '@rupertofly/capture-client';
// Shitty jQuery
const $ = ( q: string ) => document.querySelector( q )!;
const canvas = $( '#canvas' ) as HTMLCanvasElement;
const cap = new CaptureClient( 4545, canvas );
cap.start( {
  frameRate: 30,
  lengthIsFrames: true,
  maxLength: 180,
  name: '3d',
} );
const skyColor = 'rgb(171, 218, 239)',
  horizonColor = 'rgb(239, 239, 239)',
  sunColor = 'rgb(248, 236, 193)',
  bgColor = 'rgb(171, 218, 239)';
const scene = new Scene();
const { width, height } = canvas;
const aspectRatio = width / height;
const renderer = new WebGLRenderer( {
  antialias: true,
  canvas: canvas,
} );
renderer.shadowMap.enabled = true;

// Contours
const contourGenerator = () => {
  const RADIUS = 200;
  const NS_RAD = 1 / 10;
  const NS_SC = 1 / 60;
  const LEVELS = 7;
  const OUTPUT_SCALE = scaleLinear()
    .domain( [0, RADIUS] )
    .range( [0, 5] );
  const scl = scaleLinear()
    .domain( [-0.9, 0.6] )
    .range( [0, 255] );
  const cScl = scaleQuantize()
    .domain( [0, 255] )
    .range( range( LEVELS ) );
  const contourFunction = contours()
    .size( [RADIUS, RADIUS] )
    .thresholds( range( 0, 256, 256 / 7 ) );
  const noise = new NS.simplex4DNoise( NS_RAD );
  const getContours = ( t: number ) => {
    const pts: number[] = [];
    range( RADIUS ).map( y =>
      range( RADIUS ).map( x => {
        pts.push(
          Math.floor(
            scl( noise.get( t, x * NS_SC, y * NS_SC ) )
          )
        );
      } )
    );
    let contours = contourFunction( pts ).map( v => ( {
      threshold: cScl( v.value ),
      polygons: v.coordinates.map( shape => {
        const lp = shape.shift();
        return {
          outer: lp.map( ( [x, y] ) => [
            OUTPUT_SCALE( x ),
            OUTPUT_SCALE( y ),
          ] ) as [number, number][],
          holes:
            shape.length > 0
              ? ( shape.map( lp =>
                ( lp as [
                  number,
                  number
                ][] ).map( ( [x, y] ) => [
                  OUTPUT_SCALE( x ),
                  OUTPUT_SCALE( y ),
                ] )
              ) as [number, number][][] )
              : undefined,
        };
      } ),
    } ) );
    return contours;
  };
  return getContours;
};

// Camera
const camera = new PerspectiveCamera( 75, aspectRatio );
camera.position.set( 10, 3, 10 );
camera.lookAt( new Vector3( 0, -3, 0 ) );

// Sun light
const sun = new DirectionalLight( sunColor, 1.5 );
sun.castShadow = true;
// sun.shadow.radius = 2048;
sun.shadow.camera.left = 4;
sun.shadow.camera.right = 13;
sun.shadow.camera.top = -2;
sun.shadow.camera.bottom = 2;
sun.shadow.mapSize.set( 8000, 8000 );
sun.shadow.camera.far = 120;
sun.shadow.camera.near = 95;
sun.shadow.bias = -0.0006;
sun.position.set( -60, 50, 60 );
sun.lookAt( scene.position );
const sunGroup = new Group();
sunGroup.add( sun );

// Sky Light
const skyLight = new HemisphereLight(
  skyColor,
  horizonColor,
  0.6
);
// Materials
const floorMaterial = new MeshLambertMaterial( {
  color: 'rgb(240, 232, 222)',
} );
enum Rainbow {
  red,
  orange,
  yellow,
  green,
  blue,
  purple,
  pink,
}
const colours: Map<Rainbow, MeshPhysicalMaterial> = new Map(
  [
    [Rainbow.red, 'rgb(245, 106, 104)'],
    [Rainbow.orange, 'rgb(249, 145, 105)'],
    [Rainbow.yellow, 'rgb(247, 203, 119)'],
    [Rainbow.green, 'rgb(192, 224, 132)'],
    [Rainbow.blue, 'rgb(88, 181, 222)'],
    [Rainbow.purple, 'rgb(180, 116, 238)'],
    [Rainbow.pink, 'rgb(241, 109, 205)'],
  ].map(
    v =>
      [
        v[0],
        new MeshPhysicalMaterial( {
          color: v[1],
          transparent: false,
          opacity: 0.8,
        } ),
      ] as [Rainbow, MeshPhysicalMaterial]
  )
);

// Helpers
const helperSphere = new SphereBufferGeometry( 3, 32, 32 );
const centerSphere = new Mesh( helperSphere, floorMaterial );
centerSphere.castShadow = true;

// Floor
const floorPlane = new PlaneBufferGeometry( 10, 10, 1, 1 );
const floor = new Mesh( floorPlane, floorMaterial );
floor.receiveShadow = true;
floor.rotateX( -Math.PI / 1.99 );
floor.position.set( 0, -5, 0 );

// Setting Up Scene
scene.add( camera, sunGroup, skyLight );
renderer.render( scene, camera );
const getContours = contourGenerator();
let fc = 0;
const renderLoop = () => {
  const t = ( fc % 180 ) / 180;
  const contours = getContours( t );
  const layers: Group[] = [];
  contours.map( ( { threshold, polygons } ) => {
    const mat = colours.get( threshold );
    const grp = new Group();
    layers.push( grp );

    const shapes = polygons.map( pg => {
      let s = new Shape();
      s.moveTo( ...pg.outer.shift() );
      pg.outer.map( vx => s.lineTo( ...vx ) );
      s.closePath();
      if ( pg.holes ) {
        pg.holes.map( hl => {
          s.moveTo( ...hl.shift() );
          hl.map( vx => s.lineTo( ...vx ) );
          s.closePath();
        } );
      }
      return s;
    } );

    const geo = new ExtrudeBufferGeometry( shapes, {
      depth: 0.05,
      bevelEnabled: false,

      steps: 2,
    } );
    const m = new Mesh( geo, mat ).rotateX( -Math.PI / 2 );
    m.castShadow = true;
    m.receiveShadow = true;
    grp.add( m );

    grp.position.set( 3, threshold * 0.085, 8 );
  } );
  scene.add( ...layers );
  // sunGroup.rotateY(0.01);
  renderer.render( scene, camera );
  layers.map( gp => scene.remove( gp ) );
  fc++;
  // window.requestAnimationFrame(renderLoop);
  cap
    .capture()
    .then( () => window.requestAnimationFrame( renderLoop ) );
};
requestAnimationFrame( renderLoop );
