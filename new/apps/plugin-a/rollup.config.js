import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.js', // This is where the output will go
    format: 'umd', // Universal Module Definition
    name: 'PluginA', // Name of your plugin
    globals: {
      obsidian: 'Obs',
      common: 'Common', // If 'common' is a global module, map it here
    },
  },
  // Removing the 'external' field to bundle everything into the final build
  plugins: [
    resolve({
      extensions: ['.ts', '.js'],
    }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
  ],
};
