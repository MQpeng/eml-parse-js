'use strict';
const fs = require("fs");
const path = require("path");
const expect = require('chai').expect;

// import { getBoundary } from '../dist/index';

const {
  readEml,
  parseEml,
  buildEml
} = require('../dist/index.js')

function _read(strOrObj, fileName) {
  readEml(strOrObj, function (error, data) {
    console.error(error);
    const writeSrc = path.join(__dirname, `./readed/${fileName}-${typeof strOrObj === 'string' ? 'string' : 'emlJson'}.json`);
    fs.writeFileSync(writeSrc, JSON.stringify(data, " ", 2))
    expect(data).haveOwnProperty('headers');
  });
}
function _build(emlJson, fileName) {
  buildEml(emlJson, function (error, data) {
    console.error(error);
    const writeSrc = path.join(__dirname, `./builded/${fileName}.eml`);
    fs.writeFileSync(writeSrc, data);
  });
}
function _parse(eml, fileName) {
  parseEml(eml, function (error, data) {
    const writeSrc = path.join(__dirname, `./parsed/${fileName}.json`);
    fs.writeFileSync(writeSrc, JSON.stringify(data, " ", 2));
    expect(data).haveOwnProperty('headers');
  });
}


describe('buildEml should Ok', () => {
  // it('xiajie should Ok', () => {
  //   const src = path.join(__dirname, "./fixtures/xiajie.eml");
  //   const eml = fs.readFileSync(src, "utf-8");
  //   _build(eml, 'xiajie');
  // });
  // it('InfoQ should Ok', () => {
  //   const src = path.join(__dirname, "./fixtures/InfoQ.eml");
  //   const eml = fs.readFileSync(src, "utf-8");
  //   _build(eml, 'InfoQ');
  // });
  // it('npm should Ok', () => {
  //   const src = path.join(__dirname, "./fixtures/npm.eml");
  //   const eml = fs.readFileSync(src, "utf-8");
  //   _build(eml, 'npm');
  // });
  // it('convertAD should Ok', () => {
  //   const src = path.join(__dirname, "./fixtures/windowsAD.eml");
  //   const eml = fs.readFileSync(src, "utf-8");
  //   const result = buildEml(eml);
  //   if (result instanceof Error) {
  //     console.error(result);
  //   }else {
  //     const writeSrc = path.join(__dirname, `./builded/windowsAD.eml`);
  //     fs.writeFileSync(writeSrc, result);
  //   }
  // });
  // it('sample should Ok', () => {
  //   const src = path.join(__dirname, "./fixtures/sample.eml");
  //   const eml = fs.readFileSync(src, "utf-8");
  //   _build(eml, 'sample');
  // });
  // it('multipart should Ok', () => {
  //   const src = path.join(__dirname, "./fixtures/multipart.eml");
  //   const eml = fs.readFileSync(src, "utf-8");
  //   _build(eml, 'multipart');
  // });
  
});