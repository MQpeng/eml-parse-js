export interface KeyValue extends Object {
	[k: string]: any;
}

export interface EmailAddress {
	name: string;
	email: string;
}

/**
 * parse result
 */
export interface ParsedEmlJson {
	headers: EmlHeaders;
	body?: string | (BoundaryConvertedData | null)[];
}

/**
 * read result
 */
export interface ReadedEmlJson {
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
	// data not be build
	// if have EMl can find `data`, maybe I will know how to do
	data?: string;
}

/**
 * Attachment file
 */
export interface Attachment {
	name: string;
	contentType: string;
	inline: boolean;
	data: string | Uint8Array;
	data64: string;
	filename?: string;
	mimeType?: string;
	id?: string;
	cid?: string;
}

/**
 * EML headers
 * @description `MIME-Version`, `Accept-Language`, `Content-Language` and `Content-Type` shuld Must exist when to build a EML file
 */
export interface EmlHeaders extends KeyValue {
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
	//  zh-CN, en-US
	'Accept-Language'?: string;
	// zh-CN
	'Content-Language'?: string;
	// Why not all ?
	// OutLook is follows
	'Content-type'?: string | null;
	'Content-transfer-encoding'?: string;
}

export interface Options {
	headersOnly: boolean;
}
/**
 * encode is not realized yet
 */
export interface BuildOptions extends Options {
	encode?: boolean; // Not realized yet
}

export type CallbackFn<T> = (error: any, result?: T) => void;

export type OptionOrNull = Options | null;

/**
 * BoundaryRawData
 */
export interface BoundaryRawData {
	boundary: string;
	lines: string[];
}
/**
 * Convert BoundaryRawData result
 */
export interface BoundaryConvertedData {
	boundary: string;
	part: {
		headers: BoundaryHeaders;
		body: string | Array<BoundaryConvertedData | string>;
	};
}
export interface BoundaryHeaders extends KeyValue {
	'Content-Type': string;
	'Content-Transfer-Encoding'?: string;
	'Content-Disposition'?: string;
}