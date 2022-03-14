(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('js-base64'), require('text-encoding')) :
	typeof define === 'function' && define.amd ? define(['exports', 'js-base64', 'text-encoding'], factory) :
	(global = global || self, factory(global.EmlFormatJs = {}, global.Base64, global.self));
}(this, (function (exports, jsBase64, textEncoding) { 'use strict';

	/**
	 * Encodes an unicode string into an Uint8Array object as UTF-8
	 *
	 * @param {String} str String to be encoded
	 * @return {Uint8Array} UTF-8 encoded typed array
	 */
	var encode = function (str, fromCharset) {
	    if (fromCharset === void 0) { fromCharset = 'utf-8'; }
	    return new textEncoding.TextEncoder(fromCharset).encode(str);
	};
	var arr2str = function (arr) {
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
	            return new textEncoding.TextDecoder(charset, { fatal: fatal }).decode(buf);
	            // eslint-disable-next-line no-empty
	        }
	        catch (e) { }
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
	var convert = function (data, fromCharset) {
	    return typeof data === 'string' ? encode(data) : encode(decode(data, fromCharset));
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
	    if ((match = charset.match(/^GB[-_]?(\d+)$/i))) {
	        return 'hz-gb-' + match[1];
	    }
	    return charset;
	}

	//Gets the character encoding name for iconv, e.g. 'iso-8859-2' -> 'iso88592'
	function getCharsetName(charset) {
	    return charset.toLowerCase().replace(/[^0-9a-z]/g, '');
	}
	//Generates a random id
	function guid() {
	    return 'xxxxxxxxxxxx-4xxx-yxxx-xxxxxxxxxxxx'
	        .replace(/[xy]/g, function (c) {
	        var r = (Math.random() * 16) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
	        return v.toString(16);
	    })
	        .replace('-', '');
	}
	//Word-wrap the string 's' to 'i' chars per row
	function wrap(s, i) {
	    var a = [];
	    do {
	        a.push(s.substring(0, i));
	    } while ((s = s.substring(i, s.length)) != '');
	    return a.join('\r\n');
	}
	/**
	 * Decodes mime encoded string to an unicode string
	 *
	 * @param {String} str Mime encoded string
	 * @param {String} [fromCharset='UTF-8'] Source encoding
	 * @return {String} Decoded unicode string
	 */
	function mimeDecode(str, fromCharset) {
	    if (str === void 0) { str = ''; }
	    if (fromCharset === void 0) { fromCharset = 'UTF-8'; }
	    var encodedBytesCount = (str.match(/=[\da-fA-F]{2}/g) || []).length;
	    var buffer = new Uint8Array(str.length - encodedBytesCount * 2);
	    for (var i = 0, len = str.length, bufferPos = 0; i < len; i++) {
	        var hex = str.substr(i + 1, 2);
	        var chr = str.charAt(i);
	        if (chr === '=' && hex && /[\da-fA-F]{2}/.test(hex)) {
	            buffer[bufferPos++] = parseInt(hex, 16);
	            i += 2;
	        }
	        else {
	            buffer[bufferPos++] = chr.charCodeAt(0);
	        }
	    }
	    return decode(buffer, fromCharset);
	}
	/**
	 * converting strings from gbk to utf-8
	 */
	var GB2312UTF8 = {
	    Dig2Dec: function (s) {
	        var retV = 0;
	        if (s.length == 4) {
	            for (var i = 0; i < 4; i++) {
	                retV += eval(s.charAt(i)) * Math.pow(2, 3 - i);
	            }
	            return retV;
	        }
	        return -1;
	    },
	    Hex2Utf8: function (s) {
	        var retS = '';
	        var tempS = '';
	        var ss = '';
	        if (s.length == 16) {
	            tempS = '1110' + s.substring(0, 4);
	            tempS += '10' + s.substring(4, 10);
	            tempS += '10' + s.substring(10, 16);
	            var sss = '0123456789ABCDEF';
	            for (var i = 0; i < 3; i++) {
	                retS += '%';
	                ss = tempS.substring(i * 8, (eval(i.toString()) + 1) * 8);
	                retS += sss.charAt(this.Dig2Dec(ss.substring(0, 4)));
	                retS += sss.charAt(this.Dig2Dec(ss.substring(4, 8)));
	            }
	            return retS;
	        }
	        return '';
	    },
	    Dec2Dig: function (n1) {
	        var s = '';
	        var n2 = 0;
	        for (var i = 0; i < 4; i++) {
	            n2 = Math.pow(2, 3 - i);
	            if (n1 >= n2) {
	                s += '1';
	                n1 = n1 - n2;
	            }
	            else {
	                s += '0';
	            }
	        }
	        return s;
	    },
	    Str2Hex: function (s) {
	        var c = '';
	        var n;
	        var ss = '0123456789ABCDEF';
	        var digS = '';
	        for (var i = 0; i < s.length; i++) {
	            c = s.charAt(i);
	            n = ss.indexOf(c);
	            digS += this.Dec2Dig(eval(n.toString()));
	        }
	        return digS;
	    },
	    GB2312ToUTF8: function (s1) {
	        var s = escape(s1);
	        var sa = s.split('%');
	        var retV = '';
	        if (sa[0] != '') {
	            retV = sa[0];
	        }
	        for (var i = 1; i < sa.length; i++) {
	            if (sa[i].substring(0, 1) == 'u') {
	                retV += this.Hex2Utf8(this.Str2Hex(sa[i].substring(1, 5)));
	                if (sa[i].length) {
	                    retV += sa[i].substring(5);
	                }
	            }
	            else {
	                retV += unescape('%' + sa[i]);
	                if (sa[i].length) {
	                    retV += sa[i].substring(5);
	                }
	            }
	        }
	        return retV;
	    },
	    UTF8ToGB2312: function (str1) {
	        var substr = '';
	        var a = '';
	        var b = '';
	        var c = '';
	        var i = -1;
	        i = str1.indexOf('%');
	        if (i == -1) {
	            return str1;
	        }
	        while (i != -1) {
	            if (i < 3) {
	                substr = substr + str1.substr(0, i - 1);
	                str1 = str1.substr(i + 1, str1.length - i);
	                a = str1.substr(0, 2);
	                str1 = str1.substr(2, str1.length - 2);
	                if ((parseInt('0x' + a) & 0x80) === 0) {
	                    substr = substr + String.fromCharCode(parseInt('0x' + a));
	                }
	                else if ((parseInt('0x' + a) & 0xe0) === 0xc0) {
	                    //two byte
	                    b = str1.substr(1, 2);
	                    str1 = str1.substr(3, str1.length - 3);
	                    var widechar = (parseInt('0x' + a) & 0x1f) << 6;
	                    widechar = widechar | (parseInt('0x' + b) & 0x3f);
	                    substr = substr + String.fromCharCode(widechar);
	                }
	                else {
	                    b = str1.substr(1, 2);
	                    str1 = str1.substr(3, str1.length - 3);
	                    c = str1.substr(1, 2);
	                    str1 = str1.substr(3, str1.length - 3);
	                    var widechar = (parseInt('0x' + a) & 0x0f) << 12;
	                    widechar = widechar | ((parseInt('0x' + b) & 0x3f) << 6);
	                    widechar = widechar | (parseInt('0x' + c) & 0x3f);
	                    substr = substr + String.fromCharCode(widechar);
	                }
	            }
	            else {
	                substr = substr + str1.substring(0, i);
	                str1 = str1.substring(i);
	            }
	            i = str1.indexOf('%');
	        }
	        return substr + str1;
	    },
	};

	/**
	 * @author superchow
	 * @emil superchow@live.cn
	 */
	/**
	 * log for test
	 */
	var verbose = false;
	var defaultCharset = 'utf-8';
	/**
	 * create a boundary
	 */
	function createBoundary() {
	    return '----=' + guid();
	}
	/**
	 * Builds e-mail address string, e.g. { name: 'PayPal', email: 'noreply@paypal.com' } => 'PayPal' <noreply@paypal.com>
	 * @param {String|EmailAddress|EmailAddress[]|null} data
	 */
	function toEmailAddress(data) {
	    var email = '';
	    if (typeof data === 'undefined') ;
	    else if (typeof data === 'string') {
	        email = data;
	    }
	    else if (typeof data === 'object') {
	        if (Array.isArray(data)) {
	            email += data
	                .map(function (item) {
	                var str = '';
	                if (item.name) {
	                    str += '"' + item.name.replace(/^"|"\s*$/g, '') + '" ';
	                }
	                if (item.email) {
	                    str += '<' + item.email + '>';
	                }
	                return str;
	            })
	                .filter(function (a) { return a; })
	                .join(', ');
	        }
	        else {
	            if (data) {
	                if (data.name) {
	                    email += '"' + data.name.replace(/^"|"\s*$/g, '') + '" ';
	                }
	                if (data.email) {
	                    email += '<' + data.email + '>';
	                }
	            }
	        }
	    }
	    return email;
	}
	/**
	 * Gets the boundary name
	 * @param {String} contentType
	 * @returns {String|undefined}
	 */
	function getBoundary(contentType) {
	    var match = /boundary="?(.+?)"?(\s*;[\s\S]*)?$/g.exec(contentType);
	    return match ? match[1] : undefined;
	}
	/**
	 * Gets character set name, e.g. contentType='.....charset='iso-8859-2'....'
	 * @param {String} contentType
	 * @returns {String|undefined}
	 */
	function getCharset(contentType) {
	    var match = /charset\s*=\W*([\w\-]+)/g.exec(contentType);
	    return match ? match[1] : undefined;
	}
	/**
	 * Gets name and e-mail address from a string, e.g. 'PayPal' <noreply@paypal.com> => { name: 'PayPal', email: 'noreply@paypal.com' }
	 * @param {String} raw
	 * @returns { EmailAddress | EmailAddress[] | null}
	 */
	function getEmailAddress(raw) {
	    var list = [];
	    //Split around ',' char
	    //const parts = raw.split(/,/g); //Will also split ',' inside the quotes
	    //const parts = raw.match(/('.*?'|[^',\s]+)(?=\s*,|\s*$)/g); //Ignore ',' within the double quotes
	    var parts = raw.match(/('[^']*')|[^,]+/g); //Ignore ',' within the double quotes
	    // parts === null
	    if (!parts) {
	        return list;
	    }
	    for (var i = 0; i < parts.length; i++) {
	        var address = {
	            name: '',
	            email: '',
	        };
	        var partsStr = unquoteString(parts[i]);
	        //Quoted name but without the e-mail address
	        if (/^'.*'$/g.test(partsStr)) {
	            address.name = partsStr.replace(/'/g, '').trim();
	            i++; //Shift to another part to capture e-mail address
	        }
	        var regex = /^(.*?)(\s*\<(.*?)\>)$/g;
	        var match = regex.exec(partsStr);
	        if (match) {
	            var name = match[1].replace(/'/g, '').trim();
	            if (name && name.length) {
	                address.name = name;
	            }
	            address.email = match[3].trim();
	            list.push(address);
	        }
	        else {
	            //E-mail address only (without the name)
	            address.email = partsStr.trim();
	            list.push(address);
	        }
	    }
	    //Return result
	    if (list.length === 0) {
	        return null; //No e-mail address
	    }
	    if (list.length === 1) {
	        return list[0]; //Only one record, return as object, required to preserve backward compatibility
	    }
	    return list; //Multiple e-mail addresses as array
	}
	/**
	 * decode one joint
	 * @param {String} str
	 * @returns {String}
	 */
	function decodeJoint(str) {
	    var match = /=\?([^?]+)\?(B|Q)\?(.+?)(\?=)/gi.exec(str);
	    if (match) {
	        var charset = getCharsetName(match[1] || defaultCharset); //eq. match[1] = 'iso-8859-2'; charset = 'iso88592'
	        var type = match[2].toUpperCase();
	        var value = match[3];
	        if (type === 'B') {
	            //Base64
	            if (charset === 'utf8') {
	                return decode(encode(jsBase64.Base64.fromBase64(value.replace(/\r?\n/g, ''))), 'utf8');
	            }
	            else {
	                return decode(encode(jsBase64.Base64.fromBase64(value.replace(/\r?\n/g, ''))), charset);
	            }
	        }
	        else if (type === 'Q') {
	            //Quoted printable
	            return unquotePrintable(value, charset);
	        }
	    }
	    return str;
	}
	/**
	 * decode section
	 * @param {String} str
	 * @returns {String}
	 */
	function unquoteString(str) {
	    var regex = /=\?([^?]+)\?(B|Q)\?(.+?)(\?=)/gi;
	    var decodedString = str || '';
	    var spinOffMatch = decodedString.match(regex);
	    if (spinOffMatch) {
	        spinOffMatch.forEach(function (spin) {
	            decodedString = decodedString.replace(spin, decodeJoint(spin));
	        });
	    }
	    return decodedString.replace(/\r?\n/g, '');
	}
	/**
	 * Decodes 'quoted-printable'
	 * @param {String} value
	 * @param {String} charset
	 * @returns {String}
	 */
	function unquotePrintable(value, charset) {
	    //Convert =0D to '\r', =20 to ' ', etc.
	    // if (!charset || charset == "utf8" || charset == "utf-8") {
	    //   return value
	    //     .replace(/=([\w\d]{2})=([\w\d]{2})=([\w\d]{2})/gi, function (matcher, p1, p2, p3, offset, string) {
	    //     })
	    //     .replace(/=([\w\d]{2})=([\w\d]{2})/gi, function (matcher, p1, p2, offset, string) {
	    //     })
	    //     .replace(/=([\w\d]{2})/gi, function (matcher, p1, offset, string) { return String.fromCharCode(parseInt(p1, 16)); })
	    //     .replace(/=\r?\n/gi, ""); //Join line
	    // } else {
	    //   return value
	    //     .replace(/=([\w\d]{2})=([\w\d]{2})/gi, function (matcher, p1, p2, offset, string) {
	    //     })
	    //     .replace(/=([\w\d]{2})/gi, function (matcher, p1, offset, string) {
	    //      })
	    //     .replace(/=\r?\n/gi, ''); //Join line
	    // }
	    var rawString = value
	        .replace(/[\t ]+$/gm, '') // remove invalid whitespace from the end of lines
	        .replace(/=(?:\r?\n|$)/g, ''); // remove soft line breaks
	    return mimeDecode(rawString, charset);
	}
	/**
	 * Parses EML file content and returns object-oriented representation of the content.
	 * @param {String} eml
	 * @param {OptionOrNull | CallbackFn<ParsedEmlJson>} options
	 * @param {CallbackFn<ParsedEmlJson>} callback
	 * @returns {string | Error | ParsedEmlJson}
	 */
	function parse(eml, options, callback) {
	    //Shift arguments
	    if (typeof options === 'function' && typeof callback === 'undefined') {
	        callback = options;
	        options = null;
	    }
	    if (typeof options !== 'object') {
	        options = { headersOnly: false };
	    }
	    var error;
	    var result = {};
	    try {
	        if (typeof eml !== 'string') {
	            throw new Error('Argument "eml" expected to be string!');
	        }
	        var lines = eml.split(/\r?\n/);
	        result = parseRecursive(lines, 0, result, options);
	    }
	    catch (e) {
	        error = e;
	    }
	    callback && callback(error, result);
	    return error || result || new Error('read EML failed!');
	}
	/**
	 * Parses EML file content.
	 * @param {String[]} lines
	 * @param {Number}   start
	 * @param {Options}  options
	 * @returns {ParsedEmlJson}
	 */
	function parseRecursive(lines, start, parent, options) {
	    var _a, _b, _c;
	    var boundary = null;
	    var lastHeaderName = '';
	    var findBoundary = '';
	    var insideBody = false;
	    var insideBoundary = false;
	    var isMultiHeader = false;
	    var isMultipart = false;
	    parent.headers = {};
	    //parent.body = null;
	    function complete(boundary) {
	        //boundary.part = boundary.lines.join("\r\n");
	        boundary.part = {};
	        parseRecursive(boundary.lines, 0, boundary.part, options);
	        delete boundary.lines;
	    }
	    //Read line by line
	    for (var i = start; i < lines.length; i++) {
	        var line = lines[i];
	        //Header
	        if (!insideBody) {
	            //Search for empty line
	            if (line == '') {
	                insideBody = true;
	                if (options && options.headersOnly) {
	                    break;
	                }
	                //Expected boundary
	                var ct = parent.headers['Content-Type'];
	                if (ct && /^multipart\//g.test(ct)) {
	                    var b = getBoundary(ct);
	                    if (b && b.length) {
	                        findBoundary = b;
	                        isMultipart = true;
	                        parent.body = [];
	                    }
	                }
	                continue;
	            }
	            //Header value with new line
	            var match = /^\s+([^\r\n]+)/g.exec(line);
	            if (match) {
	                if (isMultiHeader) {
	                    parent.headers[lastHeaderName][parent.headers[lastHeaderName].length - 1] += '\r\n' + match[1];
	                }
	                else {
	                    parent.headers[lastHeaderName] += '\r\n' + match[1];
	                }
	                continue;
	            }
	            //Header name and value
	            match = /^([\w\d\-]+):\s+([^\r\n]+)/gi.exec(line);
	            if (match) {
	                lastHeaderName = match[1];
	                if (parent.headers[lastHeaderName]) {
	                    //Multiple headers with the same name
	                    isMultiHeader = true;
	                    if (typeof parent.headers[lastHeaderName] == 'string') {
	                        parent.headers[lastHeaderName] = [parent.headers[lastHeaderName]];
	                    }
	                    parent.headers[lastHeaderName].push(match[2]);
	                }
	                else {
	                    //Header first appeared here
	                    isMultiHeader = false;
	                    parent.headers[lastHeaderName] = match[2];
	                }
	                continue;
	            }
	        }
	        //Body
	        else {
	            //Multipart body
	            if (isMultipart) {
	                //Search for boundary start
	                //Updated on 2019-10-12: A line before the boundary marker is not required to be an empty line
	                //if (lines[i - 1] == "" && line.indexOf("--" + findBoundary) == 0 && !/\-\-(\r?\n)?$/g.test(line)) {
	                if (line.indexOf('--' + findBoundary) == 0 && !/\-\-(\r?\n)?$/g.test(line)) {
	                    insideBoundary = true;
	                    //Complete the previous boundary
	                    if (boundary && boundary.lines) {
	                        complete(boundary);
	                    }
	                    //Start a new boundary
	                    var match = /^\-\-([^\r\n]+)(\r?\n)?$/g.exec(line);
	                    boundary = { boundary: match[1], lines: [] };
	                    parent.body.push(boundary);
	                    continue;
	                }
	                if (insideBoundary) {
	                    //Search for boundary end
	                    if (((_a = boundary) === null || _a === void 0 ? void 0 : _a.boundary) && lines[i - 1] == '' && line.indexOf('--' + findBoundary + '--') == 0) {
	                        insideBoundary = false;
	                        complete(boundary);
	                        continue;
	                    }
	                    if (((_b = boundary) === null || _b === void 0 ? void 0 : _b.boundary) && line.indexOf('--' + findBoundary + '--') == 0) {
	                        continue;
	                    }
	                    (_c = boundary) === null || _c === void 0 ? void 0 : _c.lines.push(line);
	                }
	            }
	            else {
	                //Solid string body
	                parent.body = lines.splice(i).join('\r\n');
	                break;
	            }
	        }
	    }
	    //Complete the last boundary
	    if (parent.body && parent.body.length && parent.body[parent.body.length - 1].lines) {
	        complete(parent.body[parent.body.length - 1]);
	    }
	    return parent;
	}
	/**
	 * Convert BoundaryRawData to BoundaryConvertedData
	 * @param {BoundaryRawData} boundary
	 * @returns {BoundaryConvertedData} Obj
	 */
	function completeBoundary(boundary) {
	    if (!boundary || !boundary.boundary) {
	        return null;
	    }
	    var lines = boundary.lines || [];
	    var result = {
	        boundary: boundary.boundary,
	        part: {
	            headers: {},
	        },
	    };
	    var lastHeaderName = '';
	    var insideBody = false;
	    var childBoundary;
	    for (var index = 0; index < lines.length; index++) {
	        var line = lines[index];
	        if (!insideBody) {
	            if (line === '') {
	                insideBody = true;
	                continue;
	            }
	            //Header name and value /^([\w\d\-]+):\s*([^\r\n]+|)/
	            var match = /^([\w\d\-]+):\s*([^\r\n]+|)/gi.exec(line);
	            if (match) {
	                lastHeaderName = match[1];
	                result.part.headers[lastHeaderName] = match[2];
	                continue;
	            }
	            //Header value with new line
	            var lineMatch = /^\s+([^\r\n]+)/g.exec(line);
	            if (lineMatch) {
	                result.part.headers[lastHeaderName] += '\r\n' + lineMatch[1];
	                continue;
	            }
	        }
	        else {
	            // part.body
	            var match = /^\-\-([^\r\n]+)(\r?\n)?$/g.exec(line);
	            var childBoundaryStr = getBoundary(result.part.headers['Content-Type'] || result.part.headers['Content-type']);
	            if (match && line.indexOf('--' + childBoundaryStr) === 0 && !childBoundary) {
	                childBoundary = { boundary: match ? match[1] : '', lines: [] };
	                continue;
	            }
	            else if (!!childBoundary && childBoundary.boundary) {
	                if (lines[index - 1] === '' && line.indexOf('--' + childBoundary.boundary) === 0) {
	                    var child = completeBoundary(childBoundary);
	                    if (child) {
	                        if (Array.isArray(result.part.body)) {
	                            result.part.body.push(child);
	                        }
	                        else {
	                            result.part.body = [child];
	                        }
	                    }
	                    else {
	                        result.part.body = childBoundary.lines.join('\r\n');
	                    }
	                    // next line child
	                    if (!!lines[index + 1]) {
	                        childBoundary.lines = [];
	                        continue;
	                    }
	                    // end line child And this boundary's end
	                    if (line.indexOf('--' + childBoundary.boundary + '--') === 0 && lines[index + 1] === '') {
	                        childBoundary = undefined;
	                        break;
	                    }
	                }
	                childBoundary.lines.push(line);
	            }
	            else {
	                result.part.body = lines.splice(index).join('\r\n');
	                break;
	            }
	        }
	    }
	    return result;
	}
	/**
	 * buid EML file by ReadedEmlJson or EML file content
	 * @param {ReadedEmlJson} data
	 * @param {BuildOptions | CallbackFn<string> | null} options
	 * @param {CallbackFn<string>} callback
	 */
	function build(data, options, callback) {
	    //Shift arguments
	    if (typeof options === 'function' && typeof callback === 'undefined') {
	        callback = options;
	        options = null;
	    }
	    var error;
	    var eml = '';
	    var EOL = '\r\n'; //End-of-line
	    try {
	        if (!data) {
	            throw new Error('Argument "data" expected to be an object! or string');
	        }
	        if (typeof data === 'string') {
	            var readResult = read(data);
	            if (typeof readResult === 'string') {
	                throw new Error(readResult);
	            }
	            else if (readResult instanceof Error) {
	                throw readResult;
	            }
	            else {
	                data = readResult;
	            }
	        }
	        if (!data.headers) {
	            throw new Error('Argument "data" expected to be has headers');
	        }
	        if (typeof data.subject === 'string') {
	            data.headers['Subject'] = data.subject;
	        }
	        if (typeof data.from !== 'undefined') {
	            data.headers['From'] = toEmailAddress(data.from);
	        }
	        if (typeof data.to !== 'undefined') {
	            data.headers['To'] = toEmailAddress(data.to);
	        }
	        if (typeof data.cc !== 'undefined') {
	            data.headers['Cc'] = toEmailAddress(data.cc);
	        }
	        // if (!data.headers['To']) {
	        //   throw new Error('Missing "To" e-mail address!');
	        // }
	        var emlBoundary = getBoundary(data.headers['Content-Type'] || data.headers['Content-type'] || '');
	        var hasBoundary = false;
	        var boundary = createBoundary();
	        var multipartBoundary = '';
	        if (data.multipartAlternative) {
	            multipartBoundary = '' + (getBoundary(data.multipartAlternative['Content-Type']) || '');
	            hasBoundary = true;
	        }
	        if (emlBoundary) {
	            boundary = emlBoundary;
	            hasBoundary = true;
	        }
	        else {
	            data.headers['Content-Type'] = data.headers['Content-type'] || 'multipart/mixed;' + EOL + 'boundary="' + boundary + '"';
	            // Restrained
	            // hasBoundary = true;
	        }
	        //Build headers
	        var keys = Object.keys(data.headers);
	        for (var i = 0; i < keys.length; i++) {
	            var key = keys[i];
	            var value = data.headers[key];
	            if (typeof value === 'undefined') {
	                continue; //Skip missing headers
	            }
	            else if (typeof value === 'string') {
	                eml += key + ': ' + value.replace(/\r?\n/g, EOL + '  ') + EOL;
	            }
	            else {
	                //Array
	                for (var j = 0; j < value.length; j++) {
	                    eml += key + ': ' + value[j].replace(/\r?\n/g, EOL + '  ') + EOL;
	                }
	            }
	        }
	        if (data.multipartAlternative) {
	            eml += EOL;
	            eml += '--' + emlBoundary + EOL;
	            eml += 'Content-Type: ' + data.multipartAlternative['Content-Type'].replace(/\r?\n/g, EOL + '  ') + EOL;
	        }
	        //Start the body
	        eml += EOL;
	        //Plain text content
	        if (data.text) {
	            // Encode opened and self headers keeped
	            if (typeof options === 'object' && !!options && options.encode && data.textheaders) {
	                eml += '--' + boundary + EOL;
	                for (var key in data.textheaders) {
	                    if (data.textheaders.hasOwnProperty(key)) {
	                        eml += key + ": " + data.textheaders[key].replace(/\r?\n/g, EOL + '  ');
	                    }
	                }
	            }
	            else if (hasBoundary) {
	                // else Assembly
	                eml += '--' + (multipartBoundary ? multipartBoundary : boundary) + EOL;
	                eml += 'Content-Type: text/plain; charset="utf-8"' + EOL;
	            }
	            eml += EOL + data.text;
	            eml += EOL;
	        }
	        //HTML content
	        if (data.html) {
	            // Encode opened and self headers keeped
	            if (typeof options === 'object' && !!options && options.encode && data.textheaders) {
	                eml += '--' + boundary + EOL;
	                for (var key in data.textheaders) {
	                    if (data.textheaders.hasOwnProperty(key)) {
	                        eml += key + ": " + data.textheaders[key].replace(/\r?\n/g, EOL + '  ');
	                    }
	                }
	            }
	            else if (hasBoundary) {
	                eml += '--' + (multipartBoundary ? multipartBoundary : boundary) + EOL;
	                eml += 'Content-Type: text/html; charset="utf-8"' + EOL;
	            }
	            if (verbose) {
	                console.info("line 765 " + hasBoundary + ", emlBoundary: " + emlBoundary + ", multipartBoundary: " + multipartBoundary + ", boundary: " + boundary);
	            }
	            eml += EOL + data.html;
	            eml += EOL;
	        }
	        //Append attachments
	        if (data.attachments) {
	            for (var i = 0; i < data.attachments.length; i++) {
	                var attachment = data.attachments[i];
	                eml += '--' + boundary + EOL;
	                eml += 'Content-Type: ' + (attachment.contentType.replace(/\r?\n/g, EOL + '  ') || 'application/octet-stream') + EOL;
	                eml += 'Content-Transfer-Encoding: base64' + EOL;
	                eml +=
	                    'Content-Disposition: ' +
	                        (attachment.inline ? 'inline' : 'attachment') +
	                        '; filename="' +
	                        (attachment.filename || attachment.name || 'attachment_' + (i + 1)) +
	                        '"' +
	                        EOL;
	                if (attachment.cid) {
	                    eml += 'Content-ID: <' + attachment.cid + '>' + EOL;
	                }
	                eml += EOL;
	                if (typeof attachment.data === 'string') {
	                    var content = jsBase64.Base64.toBase64(attachment.data);
	                    eml += wrap(content, 72) + EOL;
	                }
	                else {
	                    //Buffer
	                    // Uint8Array to string by new TextEncoder
	                    var content = decode(attachment.data);
	                    eml += wrap(content, 72) + EOL;
	                }
	                eml += EOL;
	            }
	        }
	        //Finish the boundary
	        if (hasBoundary) {
	            eml += '--' + boundary + '--' + EOL;
	        }
	    }
	    catch (e) {
	        error = e;
	    }
	    callback && callback(error, eml);
	    return error || eml;
	}
	/**
	 * Parses EML file content and return user-friendly object.
	 * @param {String | ParsedEmlJson} eml EML file content or object from 'parse'
	 * @param { OptionOrNull | CallbackFn<ReadedEmlJson>} options EML parse options
	 * @param {CallbackFn<ReadedEmlJson>} callback Callback function(error, data)
	 */
	function read(eml, options, callback) {
	    //Shift arguments
	    if (typeof options === 'function' && typeof callback === 'undefined') {
	        callback = options;
	        options = null;
	    }
	    var error;
	    var result;
	    //Appends the boundary to the result
	    function _append(headers, content, result) {
	        var contentType = headers['Content-Type'] || headers['Content-type'];
	        var charset = getCharsetName(getCharset(contentType) || defaultCharset);
	        var encoding = headers['Content-Transfer-Encoding'] || headers['Content-transfer-encoding'];
	        if (typeof encoding === 'string') {
	            encoding = encoding.toLowerCase();
	        }
	        if (encoding === 'base64') {
	            if (contentType && contentType.indexOf('gbk') >= 0) {
	                // is work?  I'm not sure
	                content = encode(GB2312UTF8.GB2312ToUTF8(content.replace(/\r?\n/g, '')));
	            }
	            else {
	                // string to Uint8Array by TextEncoder
	                content = encode(content.replace(/\r?\n/g, ''));
	            }
	        }
	        else if (encoding === 'quoted-printable') {
	            content = unquotePrintable(content, charset);
	        }
	        else if (encoding && charset !== 'utf8' && encoding.search(/binary|8bit/) === 0) {
	            //'8bit', 'binary', '8bitmime', 'binarymime'
	            content = decode(content, charset);
	        }
	        if (!result.html && contentType && contentType.indexOf('text/html') >= 0) {
	            if (typeof content !== 'string') {
	                content = decode(content, charset);
	            }
	            //Message in HTML format
	            result.html = content.replace(/\r\n|(&quot;)/g, '').replace(/\"/g, "\"");
	            var atob1 = typeof atob === 'undefined' ? null : atob;
	            var btoa1 = typeof btoa === 'undefined' ? null : btoa;
	            if (typeof Buffer != 'undefined') {
	                atob1 = function (str) { return Buffer.from(str, 'base64').toString('utf-8'); };
	                btoa1 = function (str) { return Buffer.from(str).toString('base64'); };
	            }
	            if (atob1 && btoa1 && btoa1(atob1(result.html)) == result.html) {
	                result.html = atob1(result.html);
	            }
	            result.htmlheaders = {
	                'Content-Type': contentType,
	                'Content-Transfer-Encoding': encoding || '',
	            };
	            // self boundary Not used at conversion
	        }
	        else if (!result.text && contentType && contentType.indexOf('text/plain') >= 0) {
	            if (typeof content !== 'string') {
	                content = decode(content, charset);
	            }
	            //Plain text message
	            result.text = content;
	            result.textheaders = {
	                'Content-Type': contentType,
	                'Content-Transfer-Encoding': encoding || '',
	            };
	            // self boundary Not used at conversion
	        }
	        else {
	            //Get the attachment
	            if (!result.attachments) {
	                result.attachments = [];
	            }
	            var attachment = {};
	            var id = headers['Content-ID'] || headers['Content-Id'];
	            if (id) {
	                attachment.id = id;
	            }
	            var NameContainer = ['Content-Disposition', 'Content-Type', 'Content-type'];
	            var result_name = void 0;
	            for (var _i = 0, NameContainer_1 = NameContainer; _i < NameContainer_1.length; _i++) {
	                var key = NameContainer_1[_i];
	                var name = headers[key];
	                if (name) {
	                    result_name = name
	                        .replace(/(\s|'|utf-8|\*[0-9]\*)/g, '')
	                        .split(';')
	                        .map(function (v) { return /name="?(.+?)"?$/gi.exec(v); })
	                        .reduce(function (a, b) {
	                        if (b && b[1]) {
	                            a += b[1];
	                        }
	                        return a;
	                    }, '');
	                    if (result_name) {
	                        break;
	                    }
	                }
	            }
	            if (result_name) {
	                attachment.name = decodeURI(result_name);
	            }
	            var ct = headers['Content-Type'] || headers['Content-type'];
	            if (ct) {
	                attachment.contentType = ct;
	            }
	            var cd = headers['Content-Disposition'];
	            if (cd) {
	                attachment.inline = /^\s*inline/g.test(cd);
	            }
	            attachment.data = content;
	            attachment.data64 = decode(content, charset);
	            result.attachments.push(attachment);
	        }
	    }
	    function _read(data) {
	        if (!data) {
	            return 'no data';
	        }
	        try {
	            var result_1 = {};
	            if (!data.headers) {
	                throw new Error("data does't has headers");
	            }
	            if (data.headers['Date']) {
	                result_1.date = new Date(data.headers['Date']);
	            }
	            if (data.headers['Subject']) {
	                result_1.subject = unquoteString(data.headers['Subject']);
	            }
	            if (data.headers['From']) {
	                result_1.from = getEmailAddress(data.headers['From']);
	            }
	            if (data.headers['To']) {
	                result_1.to = getEmailAddress(data.headers['To']);
	            }
	            if (data.headers['CC']) {
	                result_1.cc = getEmailAddress(data.headers['CC']);
	            }
	            if (data.headers['Cc']) {
	                result_1.cc = getEmailAddress(data.headers['Cc']);
	            }
	            result_1.headers = data.headers;
	            //Content mime type
	            var boundary = null;
	            var ct = data.headers['Content-Type'] || data.headers['Content-type'];
	            if (ct && /^multipart\//g.test(ct)) {
	                var b = getBoundary(ct);
	                if (b && b.length) {
	                    boundary = b;
	                }
	            }
	            if (boundary && Array.isArray(data.body)) {
	                for (var i = 0; i < data.body.length; i++) {
	                    var boundaryBlock = data.body[i];
	                    if (!boundaryBlock) {
	                        continue;
	                    }
	                    //Get the message content
	                    if (typeof boundaryBlock.part === 'undefined') {
	                        verbose && console.warn('Warning: undefined b.part');
	                    }
	                    else if (typeof boundaryBlock.part === 'string') {
	                        result_1.data = boundaryBlock.part;
	                    }
	                    else {
	                        if (typeof boundaryBlock.part.body === 'undefined') {
	                            verbose && console.warn('Warning: undefined b.part.body');
	                        }
	                        else if (typeof boundaryBlock.part.body === 'string') {
	                            _append(boundaryBlock.part.headers, boundaryBlock.part.body, result_1);
	                        }
	                        else {
	                            // keep multipart/alternative
	                            var currentHeaders = boundaryBlock.part.headers;
	                            var currentHeadersContentType = currentHeaders['Content-Type'] || currentHeaders['Content-type'];
	                            if (verbose) {
	                                console.log("line 969 currentHeadersContentType: " + currentHeadersContentType);
	                            }
	                            // Hasmore ?
	                            if (currentHeadersContentType && currentHeadersContentType.indexOf('multipart') >= 0 && !result_1.multipartAlternative) {
	                                result_1.multipartAlternative = {
	                                    'Content-Type': currentHeadersContentType,
	                                };
	                            }
	                            for (var j = 0; j < boundaryBlock.part.body.length; j++) {
	                                var selfBoundary = boundaryBlock.part.body[j];
	                                if (typeof selfBoundary === 'string') {
	                                    result_1.data = selfBoundary;
	                                    continue;
	                                }
	                                var headers = selfBoundary.part.headers;
	                                var content = selfBoundary.part.body;
	                                if (Array.isArray(content)) {
	                                    content.forEach(function (bound) {
	                                        _append(bound.part.headers, bound.part.body, result_1);
	                                    });
	                                }
	                                else {
	                                    _append(headers, content, result_1);
	                                }
	                            }
	                        }
	                    }
	                }
	            }
	            else if (typeof data.body === 'string') {
	                _append(data.headers, data.body, result_1);
	            }
	            return result_1;
	        }
	        catch (e) {
	            return e;
	        }
	    }
	    if (typeof eml === 'string') {
	        var parseResult = parse(eml, options);
	        if (typeof parseResult === 'string' || parseResult instanceof Error) {
	            error = parseResult;
	        }
	        else {
	            var readResult = _read(parseResult);
	            if (typeof readResult === 'string' || readResult instanceof Error) {
	                error = readResult;
	            }
	            else {
	                result = readResult;
	            }
	        }
	    }
	    else if (typeof eml === 'object') {
	        var readResult = _read(eml);
	        if (typeof readResult === 'string' || readResult instanceof Error) {
	            error = readResult;
	        }
	        else {
	            result = readResult;
	        }
	    }
	    else {
	        error = new Error('Missing EML file content!');
	    }
	    callback && callback(error, result);
	    return error || result || new Error('read EML failed!');
	}
	//  const GBKUTF8 = GB2312UTF8;
	//  const parseEml = parse;
	//  const readEml = read;
	//  const buildEml = build;

	Object.defineProperty(exports, 'Base64', {
		enumerable: true,
		get: function () {
			return jsBase64.Base64;
		}
	});
	exports.GBKUTF8 = GB2312UTF8;
	exports.buildEml = build;
	exports.completeBoundary = completeBoundary;
	exports.convert = convert;
	exports.createBoundary = createBoundary;
	exports.decode = decode;
	exports.encode = encode;
	exports.getBoundary = getBoundary;
	exports.getCharset = getCharset;
	exports.getEmailAddress = getEmailAddress;
	exports.mimeDecode = mimeDecode;
	exports.parseEml = parse;
	exports.readEml = read;
	exports.toEmailAddress = toEmailAddress;
	exports.unquotePrintable = unquotePrintable;
	exports.unquoteString = unquoteString;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
