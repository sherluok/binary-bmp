import terserPlugin from '@rollup/plugin-terser';
import typescriptPlugin from '@rollup/plugin-typescript';
import packageJson from './package.json' with { type: 'json' };

export default {
  input: 'src/index.ts',
  output: [{
    file: 'dist/index.cjs',
    sourcemap: true,
    format: 'cjs',
  }, {
    file: 'dist/index.mjs',
    sourcemap: true,
    format: 'es',
  }, {
    file: 'dist/index.iife.js',
    sourcemap: true,
    name: 'Bmp',
    format: 'iife',
    plugins: [terserPlugin()],
  }],
  plugins: [
    typescriptPlugin(),
    {
      name: 'publish-config-plugin',
      async buildEnd() {
        const { ...pkg } = packageJson;
        delete pkg.scripts;
        delete pkg.devDependencies;
        delete pkg.publishConfig.directory;
        pkg.main = 'index.cjs';
        pkg.module = 'index.mjs';
        pkg.browser = 'index.iife.js';
        pkg.types = 'index.d.ts';
        this.emitFile({
          type: 'asset',
          fileName: 'package.json',
          source: JSON.stringify(pkg, null, 2),
        });
      },
    }
  ],
}
