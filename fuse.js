const { FuseBox, WebIndexPlugin, RawPlugin } = require('fuse-box');
const path = require('path');
const fuse = FuseBox.init({
  homeDir: 'src',
  target: 'browser@esnest',
  output: 'dist/$name.js',
  sourceMaps: true,
  plugins: [
    WebIndexPlugin({
      author: 'Ruby Quail',
      title: path.basename(process.cwd()),
      path: '.',
      template: './src/index.html',
    }),
    RawPlugin(['*.frag', '*.vert']),
  ],
});
fuse.dev({
  port: 8080,
});
fuse
  .bundle('app')
  .instructions(' > index.ts')
  .watch();
fuse.run();
