#!/usr/bin/env node

const { join } = require('path');
const { readFileSync, writeFileSync } = require('fs');

const version = JSON.parse(readFileSync(join(__dirname, 'version.json')).toString());
const indexPath = join(__dirname, 'index.html');
const calVer = /([/>])\d{4}\.\d{1,2}\.\d{1,2}([</])/g;

writeFileSync(
  indexPath,
  readFileSync(indexPath).toString().replace(
    calVer,
    `$1${version}$2`
  )
);
