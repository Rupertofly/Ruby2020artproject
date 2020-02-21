
const { fusebox } = require('fuse-box'); // eslint-disable-line

const fuse = fusebox({
  entry: 'src/index.ts',
  target: 'browser',
  sourceMap:true,
  hmr: {
    hardReloadScripts: true,
  },
  devServer: {
    enabled: true,
    httpServer: {
      enabled: true,
      port: 8080,
    },
  },
  output: 'dist/app.js',
  useSingleBundle: 'true',
  webIndex: {
    template: 'src/index.html',
  },
  dependencies:{include:['tslib']}
});
fuse.runDev();
