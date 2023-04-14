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
                name: 'oapicodegen',
                formats: ['cjs', 'es'],
                fileName: format => `index.${format}.js`
            },
        },
    };
});
