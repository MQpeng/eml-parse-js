import { TextDecoder, TextEncoder } from 'text-encoding';

/**
 * Encodes an unicode string into an Uint8Array object as UTF-8
 *
 * @param {String} str String to be encoded
 * @return {Uint8Array} UTF-8 encoded typed array
 */
export const encode = (str: string, fromCharset = 'utf-8'): Uint8Array => new TextEncoder(fromCharset).encode(str);

export const arr2str = (arr: Uint8Array) => {
	const CHUNK_SZ = 0x8000;
	const strs = [];

	for (let i = 0; i < arr.length; i += CHUNK_SZ) {
		strs.push(String.fromCharCode.apply(null, arr.subarray(i, i + CHUNK_SZ) as any));
	}

	return strs.join('');
};

/**
 * Decodes a string from Uint8Array to an unicode string using specified encoding
 *
 * @param {Uint8Array} buf Binary data to be decoded
 * @param {String} Binary data is decoded into string using this charset
 * @return {String} Decoded string
 */
export function decode(buf: Uint8Array, fromCharset = 'utf-8'): string {
	const charsets = [
		{ charset: normalizeCharset(fromCharset), fatal: false },
		{ charset: 'utf-8', fatal: true },
		{ charset: 'iso-8859-15', fatal: false },
	];

	for (const { charset, fatal } of charsets) {
		try {
			return new TextDecoder(charset, { fatal }).decode(buf);
			// eslint-disable-next-line no-empty
		} catch (e) {}
	}

	return arr2str(buf); // all else fails, treat it as binary
}

/**
 * Convert a string from specific encoding to UTF-8 Uint8Array
 *
 * @param {String|Uint8Array} data Data to be encoded
 * @param {String} Source encoding for the string (optional for data of type String)
 * @return {Uint8Array} UTF-8 encoded typed array
 */
export const convert = (data: string | Uint8Array, fromCharset?: string | undefined): Uint8Array =>
	typeof data === 'string' ? encode(data) : encode(decode(data, fromCharset));

function normalizeCharset(charset = 'utf-8') {
	let match;

	if ((match = charset.match(/^utf[-_]?(\d+)$/i))) {
		return 'UTF-' + match[1];
	}

	if ((match = charset.match(/^win[-_]?(\d+)$/i))) {
		return 'WINDOWS-' + match[1];
	}

	if ((match = charset.match(/^latin[-_]?(\d+)$/i))) {
		return 'ISO-8859-' + match[1];
	}

	return charset;
}
