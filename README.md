# eml-parse-js
[RFC 822](https://www.w3.org/Protocols/rfc822/) EML file format parser and builder, Can be used in browser environment

> fork from `eml-format-js`(used in Browser env) & `eml-format` (used in NodeJs env)
1. fix `eml-format-js` for parsing html from the eml with `quoted-printable`
2. add `data` with `base64` in attachment

## start guide

```javascript
import { parseEml, readEml, GBKUTF8, decode } from 'eml-parse-js';

// const eml = await axios(http | ajax).get()
// `.eml` file 
readEml(eml, (err, ReadEmlJson) => {
  
});
```

## @types

```typescript

interface Attachment {
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

interface ReadEmlJson {
  attachments: Attachment
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
	html?: string; // email html data
	htmlheaders?: BoundaryHeaders;
	attachments?: Attachment[];
	data?: string;
}
```
