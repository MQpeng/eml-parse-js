/* eslint-disable no-unused-vars */
/**
* @author superchow
*
*/
interface KeyValue extends Object {
  [k: string]: any;
}
interface EmailAddress {
  name: string;
  email: string;
}
/**
* parse result
*/
interface ParsedEmlJson {
  headers: EmlHeaders;
  body?: string | (BoundaryConvertedData | null)[];
}
/**
* read result
*/
interface ReadedEmlJson {
  date: Date | string;
  subject: string;
  from: EmailAddress | EmailAddress[] | null;
  to: EmailAddress | EmailAddress[] | null;
  cc?: EmailAddress | EmailAddress[] | null;
  headers: EmlHeaders;
  multipartAlternative?: {
      'Content-Type': string;
  };
  text?: string;
  textheaders?: BoundaryHeaders;
  html?: string;
  htmlheaders?: BoundaryHeaders;
  attachments?: Attachment[];
  data?: string;
}
/**
* Attachment file
*/
interface Attachment {
  name: string;
  contentType: string;
  inline: boolean;
  data: string | Uint8Array;
  filename?: string;
  mimeType?: string;
  id?: string;
  cid?: string;
}
/**
* EML headers
* @description `MIME-Version`, `Accept-Language`, `Content-Language` and `Content-Type` shuld Must exist when to build a EML file
*/
interface EmlHeaders extends KeyValue {
  Date?: string;
  Subject?: string;
  From?: string;
  To?: string;
  Cc?: string;
  CC?: string;
  'Content-Disposition'?: string | null;
  'Content-Type'?: string | null;
  'Content-Transfer-Encoding'?: string;
  'MIME-Version'?: string;
  'Content-ID'?: string;
  'Accept-Language'?: string;
  'Content-Language'?: string;
  'Content-type'?: string | null;
  'Content-transfer-encoding'?: string;
}
interface Options {
  headersOnly: boolean;
}
/**
* encode is not realized yet
*/
interface BuildOptions extends Options {
  encode?: boolean;
}
declare type CallbackFn<T> = (error: any, result?: T) => void;
declare type OptionOrNull = Options | null;
/**
* BoundaryRawData
*/
interface BoundaryRawData {
  boundary: string;
  lines: string[];
}
/**
* Convert BoundaryRawData result
*/
interface BoundaryConvertedData {
  boundary: string;
  part: {
      headers: BoundaryHeaders;
      body: string | Array<BoundaryConvertedData | string>;
  };
}
interface BoundaryHeaders extends KeyValue {
  'Content-Type': string;
  'Content-Transfer-Encoding'?: string;
  'Content-Disposition'?: string;
}
/**
* create a boundary
*/
declare function createBoundary(): string;
/**
* Builds e-mail address string, e.g. { name: 'PayPal', email: 'noreply@paypal.com' } => 'PayPal' <noreply@paypal.com>
* @param {String|EmailAddress|EmailAddress[]|null} data
*/
declare function toEmailAddress(data?: string | EmailAddress | EmailAddress[] | null): string;
/**
* Gets the boundary name
* @param {String} contentType
* @returns {String|undefined}
*/
declare function getBoundary(contentType: string): string | undefined;
/**
* Gets character set name, e.g. contentType='.....charset='iso-8859-2'....'
* @param {String} contentType
* @returns {String|undefined}
*/
declare function getCharset(contentType: string): string | undefined;
/**
* Gets name and e-mail address from a string, e.g. 'PayPal' <noreply@paypal.com> => { name: 'PayPal', email: 'noreply@paypal.com' }
* @param {String} raw
* @returns { EmailAddress | EmailAddress[] | null}
*/
declare function getEmailAddress(raw: string): EmailAddress | EmailAddress[] | null;
/**
* decode section
* @param {String} str
* @returns {String}
*/
declare function unquoteString(str: string): string;
/**
* Decodes 'quoted-printable'
* @param {String} value
* @param {String} charset
* @returns {String}
*/
declare function unquotePrintable(value: string, charset?: string): string;
/**
* Parses EML file content and returns object-oriented representation of the content.
* @param {String} eml
* @param {OptionOrNull | CallbackFn<ParsedEmlJson>} options
* @param {CallbackFn<ParsedEmlJson>} callback
* @returns {string | Error | ParsedEmlJson}
*/
declare function parse(eml: string, options?: OptionOrNull | CallbackFn<ParsedEmlJson>, callback?: CallbackFn<ParsedEmlJson>): string | Error | ParsedEmlJson;
/**
* Convert BoundaryRawData to BoundaryConvertedData
* @param {BoundaryRawData} boundary
* @returns {BoundaryConvertedData} Obj
*/
declare function completeBoundary(boundary: BoundaryRawData): BoundaryConvertedData | null;
/**
* buid EML file by ReadedEmlJson or EML file content
* @param {ReadedEmlJson} data
* @param {BuildOptions | CallbackFn<string> | null} options
* @param {CallbackFn<string>} callback
*/
declare function build(data: ReadedEmlJson | string, options?: BuildOptions | CallbackFn<string> | null, callback?: CallbackFn<string>): string | Error;
/**
* Parses EML file content and return user-friendly object.
* @param {String | ParsedEmlJson} eml EML file content or object from 'parse'
* @param { OptionOrNull | CallbackFn<ReadedEmlJson>} options EML parse options
* @param {CallbackFn<ReadedEmlJson>} callback Callback function(error, data)
*/
declare function read(eml: string | ParsedEmlJson, options?: OptionOrNull | CallbackFn<ReadedEmlJson>, callback?: CallbackFn<ReadedEmlJson>): ReadedEmlJson | Error | string;
/**
* if you need
* eml-format all api
*/
export { getEmailAddress, toEmailAddress, createBoundary, getBoundary, getCharset, unquoteString, unquotePrintable, mimeDecode, Base64, convert, encode, decode, completeBoundary, parse as parseEml, read as readEml, build as buildEml, GB2312UTF8 as GBKUTF8, };

// utils.d.ts
/**
 * Gets the boundary name
 * @param contentType - string
 */
declare function getBoundary(contentType: string): string | undefined;
declare function getCharsetName(charset: string): string;
declare function guid(): string;
declare function wrap(s: string, i: number): string;
/**
 * Decodes mime encoded string to an unicode string
 *
 * @param {String} str Mime encoded string
 * @param {String} [fromCharset='UTF-8'] Source encoding
 * @return {String} Decoded unicode string
 */
declare function mimeDecode(str?: string, fromCharset?: string): string;
/**
 * adjust string Or Error
 * @param param
 */
declare function isStringOrError(param: any): boolean;
/**
 * converting strings from gbk to utf-8
 */
declare const GB2312UTF8: {
    Dig2Dec: (s: string) => number;
    Hex2Utf8: (s: string) => string;
    Dec2Dig: (n1: number) => string;
    Str2Hex: (s: string) => string;
    GB2312ToUTF8: (s1: string) => string;
    UTF8ToGB2312: (str1: string) => string;
};

// charset.d.ts
/**
 * Encodes an unicode string into an Uint8Array object as UTF-8
 *
 * @param {String} str String to be encoded
 * @return {Uint8Array} UTF-8 encoded typed array
 */
declare const encode: (str: string, fromCharset?: string) => Uint8Array;
declare const arr2str: (arr: Uint8Array) => string;
/**
 * Decodes a string from Uint8Array to an unicode string using specified encoding
 *
 * @param {Uint8Array} buf Binary data to be decoded
 * @param {String} Binary data is decoded into string using this charset
 * @return {String} Decoded string
 */
declare function decode(buf: Uint8Array, fromCharset?: string): string;
/**
 * Convert a string from specific encoding to UTF-8 Uint8Array
 *
 * @param {String|Uint8Array} data Data to be encoded
 * @param {String} Source encoding for the string (optional for data of type String)
 * @return {Uint8Array} UTF-8 encoded typed array
 */
declare const convert: (data: string | Uint8Array, fromCharset?: string | undefined) => Uint8Array;
