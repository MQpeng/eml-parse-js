'use strict';
const expect = require('chai').expect;
const fs = require("fs");
const path = require("path");

// const {EmlFormat, GBKUTF8} = require('../dist/index.js');
// import {
//   Base64,
//   encode,
//   decode,
//   getEmailAddress,
//   unquoteString,
//   getBoundary,
//   getCharset,
//   toEmailAddress
// } from "../lib/bundle.umd";
const {
  Base64,
  encode,
  decode,
  getEmailAddress,
  unquoteString,
  GBKUTF8,
  getBoundary,
  getCharset,
  toEmailAddress
} = require('../lib/bundle.umd');
// const EmlFormat =  require('../src/index.ts').default;
// const {getEmailAddress, unquoteString} = EmlFormat;

describe('ts-hi function test', () => {
  it('encodeToUint8Array should work', () => {
    const utf8Str = "text/plain; 我 charset=utf-8; format=flowed";
    const gbkStr = 'text/plain; %E6%88%91 charset=utf-8; format=flowed';
    console.log(GBKUTF8.UTF8ToGB2312(utf8Str));
    console.log(GBKUTF8.GB2312ToUTF8(gbkStr));
    // const src = path.join(__dirname, "./fixtures/gbk.txt");
    // const buff = fs.readFileSync(src);

    // console.info(decode(encodeToUint8Array(decode(buff, 'gbk'))));
    // const str = buff.toString();
    // console.log(GBKUTF8.GB2312ToUTF8(str));
    // const newbf = encodeToUint8Array(str, 'gb2312');
    // console.log(decode(newbf, 'gbk'));
    // const newBuff1 = encodeToUint8Array(str);
    // console.info(decode(encodeToUint8Array(decode(newBuff1, 'gbk'))));
    // const newBuff2 = encodeToUint8Array(str, 'gbk');
    // console.info(decode(encodeToUint8Array(decode(newBuff2, 'gbk'))));
    // console.log(GBKUTF8.UTF8ToGB2312(GBKUTF8.GB2312ToUTF8(str)));
    // expect(GBKUTF8.GB2312ToUTF8(gbkStr)).eq(utf8Str);
  });
  it('getCharset should work', () => {
    const boundary = "text/plain; charset=utf-8; format=flowed";
    const res = getCharset(boundary);
    console.info(res);
    expect(res).eq("utf-8");
  });

  it('getBoundary should work', () => {
    const boundary = "multipart/alternative;\r\nboundary=\"B_3658292830_1398168712\"";
    const res = getBoundary(boundary);
    console.info(res);
    expect(res).eq("B_3658292830_1398168712");
  });


  it('toEmailAddress should work', () => {
    const emailAddress = { name: 'PayPal', email: 'noreply@paypal.com' };
    const res = toEmailAddress(emailAddress);
    expect(res).eq("\"PayPal\" <noreply@paypal.com>");

    const emailAddressS = [{ name: 'PayPal', email: 'noreply@paypal.com' }, { name: 'PayPal', email: 'noreply@paypal.com' }];
    const resS = toEmailAddress(emailAddressS);
    expect(resS).eq("\"PayPal\" <noreply@paypal.com>, \"PayPal\" <noreply@paypal.com>");
  });

});