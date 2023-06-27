'use strict';
const { clean, writeFile: writeFileUtil } = require("./_utils.js");

// REQUIRES INTEGRATION TEST
/* c8 ignore start */
const run = (interpreter, code) => interpreter.runPython(clean(code));
exports.run = run;

const runAsync = (interpreter, code) =>
    interpreter.runPythonAsync(clean(code));
exports.runAsync = runAsync;

const setGlobal = (interpreter, name, value) => {
    interpreter.globals.set(name, value);
};
exports.setGlobal = setGlobal;

const deleteGlobal = (interpreter, name) => {
    interpreter.globals.delete(name);
};
exports.deleteGlobal = deleteGlobal;

const writeFile = ({ FS }, path, buffer) =>
    writeFileUtil(FS, path, buffer);
exports.writeFile = writeFile;
/* c8 ignore stop */
