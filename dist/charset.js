"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var text_encoding_1 = require("text-encoding");
/**
 * Encodes an unicode string into an Uint8Array object as UTF-8
 *
 * @param {String} str String to be encoded
 * @return {Uint8Array} UTF-8 encoded typed array
 */
exports.encode = function (str, fromCharset) {
    if (fromCharset === void 0) { fromCharset = 'utf-8'; }
    return new text_encoding_1.TextEncoder(fromCharset).encode(str);
};
exports.arr2str = function (arr) {
    var CHUNK_SZ = 0x8000;
    var strs = [];
    for (var i = 0; i < arr.length; i += CHUNK_SZ) {
        strs.push(String.fromCharCode.apply(null, arr.subarray(i, i + CHUNK_SZ)));
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
function decode(buf, fromCharset) {
    if (fromCharset === void 0) { fromCharset = 'utf-8'; }
    var charsets = [
        { charset: normalizeCharset(fromCharset), fatal: false },
        { charset: 'utf-8', fatal: true },
        { charset: 'iso-8859-15', fatal: false },
    ];
    for (var _i = 0, charsets_1 = charsets; _i < charsets_1.length; _i++) {
        var _a = charsets_1[_i], charset = _a.charset, fatal = _a.fatal;
        try {
            return new text_encoding_1.TextDecoder(charset, { fatal: fatal }).decode(buf);
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
    }
    return exports.arr2str(buf); // all else fails, treat it as binary
}
exports.decode = decode;
/**
 * Convert a string from specific encoding to UTF-8 Uint8Array
 *
 * @param {String|Uint8Array} data Data to be encoded
 * @param {String} Source encoding for the string (optional for data of type String)
 * @return {Uint8Array} UTF-8 encoded typed array
 */
exports.convert = function (data, fromCharset) {
    return typeof data === 'string' ? exports.encode(data) : exports.encode(decode(data, fromCharset));
};
function normalizeCharset(charset) {
    if (charset === void 0) { charset = 'utf-8'; }
    var match;
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
