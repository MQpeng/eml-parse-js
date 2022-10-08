'use strict';
const fs = require("fs");
const path = require("path");
const expect = require('chai').expect;

const {
  readEml,
  parseEml,
  buildEml,
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


describe('parseEml should Ok', () => {
  // it('123 should Ok', () => {
  //   const src = path.join(__dirname, "./fixtures/123.eml");
  //   const eml = fs.readFileSync(src, "utf-8");
  //   _read(eml, '123');
  // }).timeout(10000);
  // it('InfoQ should Ok', () => {
  //   const src = path.join(__dirname, "./fixtures/InfoQ.eml");
  //   const eml = fs.readFileSync(src, "utf-8");
  //   _parse(eml, 'InfoQ');
  // });
  // it('npm should Ok', () => {
  //   const src = path.join(__dirname, "./fixtures/npm.eml");
  //   const eml = fs.readFileSync(src, "utf-8");
  //   _parse(eml, 'npm');
  // });
  // it('multipart should Ok', () => {
  //   const src = path.join(__dirname, "./fixtures/multipart.eml");
  //   const eml = fs.readFileSync(src, "utf-8");
  //   readEml(eml, function(error, data) {
  //     if(error) {
  //       console.error(error);
  //     }
  //     const writeSrc = path.join(__dirname, "./readed/multipart.json");
  //     fs.writeFileSync(writeSrc, JSON.stringify(data, " ", 2));
  //     _build(data, 'multipart');
  //   });
  // });
  // it('cc should Ok', () => {
  //   const src = path.join(__dirname, "./fixtures/cc.eml");
  //   const eml = fs.readFileSync(src, "utf-8");
  //   readEml(eml, function(error, data) {
  //     if(error) {
  //       console.error(error);
  //     }
  //     const writeSrc = path.join(__dirname, "./readed/cc.json");
  //     fs.writeFileSync(writeSrc, JSON.stringify(data, " ", 2));
  //     _build(data, 'cc');
  //   });
  // });
});