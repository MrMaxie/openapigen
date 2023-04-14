import { defineConfig } from 'vite';
import { resolve } from 'path';
import DtsPlugin from 'vite-plugin-dts';

export default defineConfig(() => {
    return {
        plugins: [
            DtsPlugin(),
        ],
        build: {
            lib: {
                entry: resolve(__dirname, './src/index.ts'),
                name: 'openapi-ts-codegen',
                formats: ['cjs', 'es'],
                fileName: format => `main.${format}.js`
            },
        },
    };
});
