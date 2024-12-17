import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.ts',              // Entry point for your plugin
  output: {
    file: 'dist/main.js',            // Output bundled file
    format: 'cjs',                   // Use CommonJS format
    sourcemap: true,                 // Include source maps (optional but useful)
  },
  plugins: [
    nodeResolve({
      extensions: ['.ts', '.js'],    // Resolve .ts and .js files
    }),
    commonjs(),                      // Handle CommonJS modules
    typescript(),                    // Compile TypeScript
  ],
  external: ['obsidian'],            // Mark Obsidian as external, since it’s already available in the environment
};
