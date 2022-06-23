import pluginTypescript from "@rollup/plugin-typescript"

const plugins = [
    pluginTypescript()
]

export default [{
    input: "./src/background/index.ts",
    output: [{
        name: "background",
        file: "./dist/background.js",
        format: "iife",
    }],
    plugins,
}, {
    input: "./src/options/index.ts",
    output: [{
        name: "options",
        file: "./dist/options.js",
        format: "iife",
    }],
    plugins,
}]