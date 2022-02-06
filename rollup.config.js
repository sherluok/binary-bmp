import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import packageJson from './package.json';

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
    plugins: [terser()],
  }],
  plugins:[
    typescript(),
  ],
}
