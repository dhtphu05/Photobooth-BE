import { defineConfig } from 'orval';

export default defineConfig({
    photobooth: {
        output: {
            mode: 'tags-split',
            target: './src/api/endpoints',
            schemas: './src/api/model',
            client: 'react-query',
            parserOptions: {
                mergeSchema: true
            }
        },
        input: {
            target: 'https://api-photobooth.lcdkhoacntt-dut.live/api/docs-json',
        },
    },
});
