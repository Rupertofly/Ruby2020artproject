const { FuseBox, WebIndexPlugin, RawPlugin } = require('fuse-box');
const path = require('path');
const fuse = FuseBox.init({
  homeDir: 'src',
  target: 'browser@es6',
  output: 'dist/$name.js',
  plugins: [
    WebIndexPlugin({
      author: 'Ruby Quail',
      title: path.basename(process.cwd()),
      path: '.',
      template: './src/index.html',
    }),
  ],
});
fuse.dev({
  port: 8080,
});
fuse
  .bundle('app')
  .instructions(' > index.ts')
  .hmr()
  .watch();
fuse.run();
