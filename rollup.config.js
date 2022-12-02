import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript'

export default {
	input: 'src/index.ts',
	output: [
		{
			format: "amd",
      file: "lib/bundle.amd.js"
		},
		{
      format: "cjs",
      file: "lib/bundle.cjs.js"
    },
    {
      format: "es",
      file: "lib/bundle.esm.js"
    },
		{
			file: 'lib/bundle.umd.js',
			format: 'umd',
			name: 'EmlParseJs',
			globals: {
				'js-base64': 'Base64',
				'@sinonjs/text-encoding': 'self'
			}
		},
		{
			format: "iife",
			file: "lib/bundle.iife.js",
			globals: {
				'js-base64': 'Base64 || (window || this).Base64',
				'@sinonjs/text-encoding': `{
					TextEncoder: (window || this)['TextEncoder'],
					TextDecoder: (window || this)['TextDecoder'],
				}`,
			}
		},
	],
	plugins: [
		typescript(),
		resolve({
			customResolveOptions: {
				moduleDirectory: 'node_modules'
			}
		})
	],
  external: ['js-base64', '@sinonjs/text-encoding']
};
