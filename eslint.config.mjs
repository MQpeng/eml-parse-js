import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(eslint.configs.recommended, tseslint.configs.recommended, {
	ignores: ["dist/*","lib/*"],
	languageOptions: {
		globals: {
			Atomics: 'readonly',
			SharedArrayBuffer: 'readonly',
		},
		ecmaVersion: 2018,
		sourceType: 'module',
	},

	rules: {
		'no-console': 0,
		'no-var': 'warn',
		indent: [0, 'tab'],
		quotes: [0, 'single'],
		semi: [0, 'always'],
		'no-useless-escape': 'off',
		'no-extra-boolean-cast': 'off',
		'no-prototype-builtins': 'off',
		'no-unused-vars': 'off',
		"prefer-const": 'off',
		"@typescript-eslint/no-explicit-any": 'off',
		"@typescript-eslint/no-unused-expressions": 'off',
		"@typescript-eslint/no-unused-vars": 'off',
		"@typescript-eslint/no-wrapper-object-types": 'off'
	},
});
