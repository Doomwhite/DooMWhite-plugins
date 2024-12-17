import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [
    nodeResolve({
      extensions: [".ts", ".js"],
    }),
    commonjs(),
    typescript(),
  ],
  external: ["obsidian"],
};
