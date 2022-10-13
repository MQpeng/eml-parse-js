'use strict';
const fs = require("fs");
const path = require("path");
const { expect, assert } = require('chai');

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

function readEmlForTest(filepath, encoding = 'utf-8') {
  const src = path.join(__dirname, filepath);
  const eml =  fs.readFileSync(src, encoding);
  return readEml(eml);
}

describe('readEml should decode', () => {

  it('to and from correctly', () => {
    const readEmlJson = readEmlForTest('./fixtures/smallEmail.eml');
    expect(readEmlJson.from.name).to.equal('Nobody there');
    expect(readEmlJson.from.email).to.equal('dummyEmail@emailClient.com');
    expect(readEmlJson.to.name).to.equal('Nobody here');
    expect(readEmlJson.to.email).to.equal('dummyEmail2@emailClient.com');
  })

  it('cc recepient', () => {
    const readEmlJson = readEmlForTest('./fixtures/multipleRecipientsEmail.eml');
    expect(readEmlJson.cc).to.exist;
    expect(readEmlJson.cc.email).to.equal('dummyOutlookEmail2@outlook.com');
  })

  it('multiple recipients', () => {
    const readEmlJson = readEmlForTest('./fixtures/multipleRecipientsEmail.eml')
    expect(readEmlJson.to.length).to.equal(2);
    expect(readEmlJson.to[0].email).to.equal('dummyOutlookEmail@outlook.com');
    expect(readEmlJson.to[1].email).to.equal('dummyGmailEmail@gmail.com');
  })

  it('subjects with spaces correctly', () => {
    const readEmlJson = readEmlForTest('./fixtures/smallEmail.eml');
    expect(readEmlJson.subject).to.equal('Off-The-Beaten-Path Trails You\'ve Never Heard Of!  🌏');
    expect(readEmlJson.text.trim()).to.equal('A small body with _underscores.');
  })

	it('headers with line breaks correctly', () => {
		const readEmlJson = readEmlForTest('./fixtures/lineBreakInHeader.eml');
    expect(readEmlJson.headers.Date).to.equal('Thu, 29 Sep 2022 12:22:20 +0100');
    expect(readEmlJson.headers['Message-ID']).to.equal('\r\n<CAGFso0R6WbMomMx6mFFJzt_wiL8wRm3sN0YQwXz12Ugbt72XSw@mail.gmail.com>');
    assert.deepEqual(readEmlJson.date, new Date('Thu, 29 Sep 2022 12:22:20 +0100'));
	});

  it('attachments', () => {
		const readEmlJson = readEmlForTest('./fixtures/emailWithAttachments.eml');
    expect(readEmlJson.attachments.length).to.equal(2);
    expect(readEmlJson.attachments[0].name).to.equal('Smalltextfile.txt');
    expect(readEmlJson.attachments[1].name).to.equal('Smalltextfile2.txt');
	});

  it('inline attachments', () => {
		const readEmlJson = readEmlForTest('./fixtures/inlineAttachment.eml');
    expect(readEmlJson.attachments.length).to.equal(1);
    expect(readEmlJson.attachments[0].name).to.equal('image.png');
	});
})