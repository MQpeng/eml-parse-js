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
 * @author superchow
 * @emil superchow@live.cn
 */
import { Base64 } from 'js-base64';
import { mimeDecode, GB2312UTF8 } from './utils';
import { encode, decode, convert } from './charset';
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
