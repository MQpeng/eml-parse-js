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
			name: 'EmlFormatJs',
			globals: {
				'js-base64': 'Base64',
				'text-encoding': 'self'
			}
		},
		{
			format: "iife",
			file: "lib/bundle.iife.js",
			globals: {
				'js-base64': 'Base64 || (window || this).Base64',
				'text-encoding': `{
					TextEncoder: (window || this)['TextEncoder'],
					TextDecoder: (window || this)['TextDecoder'],
				}`,
			}
		},
	],
	plugins: [
		typescript(),
		resolve({
			// 将自定义选项传递给解析插件
			customResolveOptions: {
				moduleDirectory: 'node_modules'
			}
		})
	],
  // 指出应将哪些模块视为外部模块
  external: ['js-base64', 'text-encoding']
};
