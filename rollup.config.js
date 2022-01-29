import packageJson from './package.json';
import typescriptRollupPlugin from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [{
    file: packageJson.main,
    sourcemap: true,
    // exports: 'default',
    format: 'cjs',
  }, {
    file: packageJson.module,
    sourcemap: true,
    format: 'es',
  }, {
    file: packageJson.browser,
    sourcemap: true,
    name: 'Bmp',
    format: 'iife',
  }],
  plugins:[
    typescriptRollupPlugin(),
  ],
}
