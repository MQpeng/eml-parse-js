/**
 * Gets the boundary name
 * @param contentType - string
 */
export declare function getBoundary(contentType: string): string | undefined;
export declare function getCharsetName(charset: string): string;
export declare function guid(): string;
export declare function wrap(s: string, i: number): string;
/**
 * Decodes mime encoded string to an unicode string
 *
 * @param {String} str Mime encoded string
 * @param {String} [fromCharset='UTF-8'] Source encoding
 * @return {String} Decoded unicode string
 */
export declare function mimeDecode(str?: string, fromCharset?: string): string;
/**
 * adjust string Or Error
 * @param param
 */
export declare function isStringOrError(param: any): boolean;
/**
 * converting strings from gbk to utf-8
 */
export declare const GB2312UTF8: {
    Dig2Dec: (s: string) => number;
    Hex2Utf8: (s: string) => string;
    Dec2Dig: (n1: number) => string;
    Str2Hex: (s: string) => string;
    GB2312ToUTF8: (s1: string) => string;
    UTF8ToGB2312: (str1: string) => string;
};
