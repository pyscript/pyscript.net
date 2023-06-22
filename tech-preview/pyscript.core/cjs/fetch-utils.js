'use strict';
/** @param {Response} response */
const getBuffer = (response) => response.arrayBuffer();
exports.getBuffer = getBuffer;

/** @param {Response} response */
const getJSON = (response) => response.json();
exports.getJSON = getJSON;

/** @param {Response} response */
const getText = (response) => response.text();
exports.getText = getText;
