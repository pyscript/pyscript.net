'use strict';
const { isArray } = Array;

const { assign, create, defineProperties, defineProperty } = Object;

const { all, resolve } = new Proxy(Promise, {
    get: ($, name) => $[name].bind($),
});

const absoluteURL = (path, base = location.href) => new URL(path, base).href;

exports.isArray = isArray;
exports.assign = assign;
exports.create = create;
exports.defineProperties = defineProperties;
exports.defineProperty = defineProperty;
exports.all = all;
exports.resolve = resolve;
exports.absoluteURL = absoluteURL;
