import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],
  build: {
    minify: false,
    lib: {
      entry: 'src/index.ts',
      name: 'EmlParseJs',
      formats: ['cjs', 'es', 'iife', 'umd'],
      fileName: (format, entryName) => {
        return `${entryName}.${format}.js`
      }
    },
    rollupOptions: {
      output: {
        globals: {
          'js-base64': 'Base64',
        }
      },
      external: ['js-base64'],
    }
  }
})