'use strict';
require("@ungap/with-resolvers");

const { getBuffer } = require("../fetch-utils.js");
const { absoluteURL } = require("../utils.js");

/**
 * Trim code only if it's a single line that prettier or other tools might have modified.
 * @param {string} code code that might be a single line
 * @returns {string}
 */
const clean = (code) =>
    code.replace(/^[^\r\n]+$/, (line) => line.trim());
exports.clean = clean;

// REQUIRES INTEGRATION TEST
/* c8 ignore start */
const io = new WeakMap();
exports.io = io;
const stdio = (init) => {
    const context = init || console;
    const localIO = {
        stderr: (context.stderr || console.error).bind(context),
        stdout: (context.stdout || console.log).bind(context),
    };
    return {
        stderr: (...args) => localIO.stderr(...args),
        stdout: (...args) => localIO.stdout(...args),
        async get(engine) {
            const interpreter = await engine;
            io.set(interpreter, localIO);
            return interpreter;
        },
    };
};
exports.stdio = stdio;
/* c8 ignore stop */

// This should be the only helper needed for all Emscripten based FS exports
const writeFile = (FS, path, buffer) => {
    const { parentPath, name } = FS.analyzePath(path, true);
    FS.mkdirTree(parentPath);
    return FS.writeFile([parentPath, name].join("/"), new Uint8Array(buffer), {
        canOwn: true,
    });
};
exports.writeFile = writeFile;

// This is instead a fallback for Lua or others
const writeFileShim = (FS, path, buffer) => {
    path = resolve(FS, path);
    mkdirTree(FS, dirname(path));
    return FS.writeFile(path, new Uint8Array(buffer), { canOwn: true });
};
exports.writeFileShim = writeFileShim;

const dirname = (path) => {
    const tree = path.split("/");
    tree.pop();
    return tree.join("/");
};

const mkdirTree = (FS, path) => {
    const current = [];
    for (const branch of path.split("/")) {
        current.push(branch);
        if (branch) FS.mkdir(current.join("/"));
    }
};

const resolve = (FS, path) => {
    const tree = [];
    for (const branch of path.split("/")) {
        switch (branch) {
            case "":
                break;
            case ".":
                break;
            case "..":
                tree.pop();
                break;
            default:
                tree.push(branch);
        }
    }
    return [FS.cwd()].concat(tree).join("/").replace(/^\/+/, "/");
};

const { all, isArray } = require("../utils.js");

const calculateFetchPaths = (config_fetch) => {
    // REQUIRES INTEGRATION TEST
    /* c8 ignore start */
    for (const { files, to_file, from = "" } of config_fetch) {
        if (files !== undefined && to_file !== undefined)
            throw new Error(
                `Cannot use 'to_file' and 'files' parameters together!`,
            );
        if (files === undefined && to_file === undefined && from.endsWith("/"))
            throw new Error(
                `Couldn't determine the filename from the path ${from}, please supply 'to_file' parameter.`,
            );
    }
    /* c8 ignore stop */
    return config_fetch.flatMap(
        ({ from = "", to_folder = ".", to_file, files }) => {
            if (isArray(files))
                return files.map((file) => ({
                    url: joinPaths([from, file]),
                    path: joinPaths([to_folder, file]),
                }));
            const filename = to_file || from.slice(1 + from.lastIndexOf("/"));
            return [{ url: from, path: joinPaths([to_folder, filename]) }];
        },
    );
};

const joinPaths = (parts) => {
    const res = parts
        .map((part) => part.trim().replace(/(^[/]*|[/]*$)/g, ""))
        .filter((p) => p !== "" && p !== ".")
        .join("/");

    return parts[0].startsWith("/") ? `/${res}` : res;
};

const fetchResolved = (config_fetch, url) =>
    fetch(absoluteURL(url, base.get(config_fetch)));

const base = new WeakMap();
exports.base = base;

const fetchPaths = (module, interpreter, config_fetch) =>
    all(
        calculateFetchPaths(config_fetch).map(({ url, path }) =>
            fetchResolved(config_fetch, url)
                .then(getBuffer)
                .then((buffer) => module.writeFile(interpreter, path, buffer)),
        ),
    );
exports.fetchPaths = fetchPaths;
