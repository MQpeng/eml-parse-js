"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author superchow
 * @emil superchow@live.cn
 */
var js_base64_1 = require("js-base64");
exports.Base64 = js_base64_1.Base64;
var charset_1 = require("./charset");
exports.convert = charset_1.convert;
exports.decode = charset_1.decode;
exports.encode = charset_1.encode;
var utils_1 = require("./utils");
exports.GBKUTF8 = utils_1.GB2312UTF8;
exports.mimeDecode = utils_1.mimeDecode;
/**
 * log for test
 */
var verbose = false;
var defaultCharset = 'utf-8';
var fileExtensions = {
    'text/plain': '.txt',
    'text/html': '.html',
    'image/png': '.png',
    'image/jpg': '.jpg',
    'image/jpeg': '.jpg',
};
/**
 * Gets file extension by mime type
 * @param {String} mimeType
 * @returns {String}
 */
// eslint-disable-next-line no-unused-vars
function getFileExtension(mimeType) {
    return fileExtensions[mimeType] || '';
}
/**
 * create a boundary
 */
function createBoundary() {
    return '----=' + utils_1.guid();
}
exports.createBoundary = createBoundary;
/**
 * Builds e-mail address string, e.g. { name: 'PayPal', email: 'noreply@paypal.com' } => 'PayPal' <noreply@paypal.com>
 * @param {String|EmailAddress|EmailAddress[]|null} data
 */
function toEmailAddress(data) {
    var email = '';
    if (typeof data === 'undefined') {
        //No e-mail address
    }
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
exports.toEmailAddress = toEmailAddress;
/**
 * Gets the boundary name
 * @param {String} contentType
 * @returns {String|undefined}
 */
function getBoundary(contentType) {
    var match = /boundary="?(.+?)"?(\s*;[\s\S]*)?$/g.exec(contentType);
    return match ? match[1] : undefined;
}
exports.getBoundary = getBoundary;
/**
 * Gets character set name, e.g. contentType='.....charset='iso-8859-2'....'
 * @param {String} contentType
 * @returns {String|undefined}
 */
function getCharset(contentType) {
    var match = /charset\s*=\W*([\w\-]+)/g.exec(contentType);
    return match ? match[1] : undefined;
}
exports.getCharset = getCharset;
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
            var name_1 = match[1].replace(/'/g, '').trim();
            if (name_1 && name_1.length) {
                address.name = name_1;
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
exports.getEmailAddress = getEmailAddress;
/**
 * decode one joint
 * @param {String} str
 * @returns {String}
 */
function decodeJoint(str) {
    var match = /=\?([^?]+)\?(B|Q)\?(.+?)(\?=)/gi.exec(str);
    if (match) {
        var charset = utils_1.getCharsetName(match[1] || defaultCharset); //eq. match[1] = 'iso-8859-2'; charset = 'iso88592'
        var type = match[2].toUpperCase();
        var value = match[3];
        if (type === 'B') {
            //Base64
            if (charset === 'utf8') {
                return charset_1.decode(charset_1.encode(js_base64_1.Base64.fromBase64(value.replace(/\r?\n/g, ''))), 'utf8');
            }
            else {
                return charset_1.decode(charset_1.encode(js_base64_1.Base64.fromBase64(value.replace(/\r?\n/g, ''))), charset);
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
exports.unquoteString = unquoteString;
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
    return utils_1.mimeDecode(rawString, charset);
}
exports.unquotePrintable = unquotePrintable;
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
exports.parseEml = parse;
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
                    else {
                        if (verbose) {
                            console.warn('Multipart without boundary! ' + ct.replace(/\r?\n/g, ' '));
                        }
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
                    if (verbose) {
                        console.log('Found boundary: ' + boundary.boundary);
                    }
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
            if (verbose) {
                if (match) {
                    console.log("line 568: line is " + line + ", " + ('--' + childBoundaryStr), "" + line.indexOf('--' + childBoundaryStr));
                }
            }
            if (match && line.indexOf('--' + childBoundaryStr) === 0 && !childBoundary) {
                childBoundary = { boundary: match ? match[1] : '', lines: [] };
                continue;
            }
            else if (!!childBoundary && childBoundary.boundary) {
                if (lines[index - 1] === '' && line.indexOf('--' + childBoundary.boundary) === 0) {
                    var child = completeBoundary(childBoundary);
                    if (verbose) {
                        console.info("578: " + JSON.stringify(child));
                    }
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
                        if (verbose) {
                            console.info('line 601 childBoundary is over line is 534');
                        }
                        childBoundary = undefined;
                        break;
                    }
                }
                childBoundary.lines.push(line);
            }
            else {
                if (verbose) {
                    console.warn('body is string');
                }
                result.part.body = lines.splice(index).join('\r\n');
                break;
            }
        }
    }
    return result;
}
exports.completeBoundary = completeBoundary;
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
                    var content = js_base64_1.Base64.toBase64(attachment.data);
                    eml += utils_1.wrap(content, 72) + EOL;
                }
                else {
                    //Buffer
                    // Uint8Array to string by new TextEncoder
                    var content = charset_1.decode(attachment.data);
                    eml += utils_1.wrap(content, 72) + EOL;
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
exports.buildEml = build;
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
        var charset = utils_1.getCharsetName(getCharset(contentType) || defaultCharset);
        var encoding = headers['Content-Transfer-Encoding'] || headers['Content-transfer-encoding'];
        if (typeof encoding === 'string') {
            encoding = encoding.toLowerCase();
        }
        if (encoding === 'base64') {
            if (contentType && contentType.indexOf('gbk') >= 0) {
                // is work?  I'm not sure
                content = charset_1.encode(utils_1.GB2312UTF8.GB2312ToUTF8(content.replace(/\r?\n/g, '')));
            }
            else {
                // string to Uint8Array by TextEncoder
                content = charset_1.encode(content.replace(/\r?\n/g, ''));
            }
        }
        else if (encoding === 'quoted-printable') {
            content = unquotePrintable(content, charset);
        }
        else if (encoding && charset !== 'utf8' && encoding.search(/binary|8bit/) === 0) {
            //'8bit', 'binary', '8bitmime', 'binarymime'
            content = charset_1.decode(content, charset);
        }
        if (!result.html && contentType && contentType.indexOf('text/html') >= 0) {
            if (typeof content !== 'string') {
                content = charset_1.decode(content, charset);
            }
            //Message in HTML format
            result.html = content.replace(/\r\n|(&quot;)/g, '').replace(/\"/g, "\"");
            result.htmlheaders = {
                'Content-Type': contentType,
                'Content-Transfer-Encoding': encoding || '',
            };
            // self boundary Not used at conversion
        }
        else if (!result.text && contentType && contentType.indexOf('text/plain') >= 0) {
            if (typeof content !== 'string') {
                content = charset_1.decode(content, charset);
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
            var id = headers['Content-ID'];
            if (id) {
                attachment.id = id;
            }
            var name_2 = headers['Content-Disposition'] || headers['Content-Type'] || headers['Content-type'];
            if (name_2) {
                name_2 = name_2.replace(/(\s|'|utf-8|\*[0-9]\*)/g, '').split(';').map(function (v) { return /name="?(.+?)"?$/gi.exec(v); }).reduce(function (a, b) {
                    if (b && b[1]) {
                        a += b[1];
                    }
                    return a;
                }, "");
            }
            if (name_2) {
                attachment.name = name_2;
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
            attachment.data64 = charset_1.decode(content, charset);
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
exports.readEml = read;
//  const GBKUTF8 = GB2312UTF8;
//  const parseEml = parse;
//  const readEml = read;
//  const buildEml = build;
