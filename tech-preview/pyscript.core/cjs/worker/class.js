'use strict';
const JSON = require("@ungap/structured-clone/json");
const coincident = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require("coincident/window"));
const xworker = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require("./xworker.js"));
const { assign, defineProperties, absoluteURL } = require("../utils.js");
const { getText } = require("../fetch-utils.js");
const { Hook } = require("./hooks.js");

/**
 * @typedef {Object} WorkerOptions custom configuration
 * @prop {string} type the interpreter type to use
 * @prop {string} [version] the optional interpreter version to use
 * @prop {string} [config] the optional config to use within such interpreter
 */

module.exports = (...args) =>
    /**
     * A XWorker is a Worker facade able to bootstrap a channel with any desired interpreter.
     * @param {string} url the remote file to evaluate on bootstrap
     * @param {WorkerOptions} [options] optional arguments to define the interpreter to use
     * @returns {Worker}
     */
    function XWorker(url, options) {
        const worker = xworker();
        const { postMessage } = worker;
        if (args.length) {
            const [type, version] = args;
            options = assign({}, options || { type, version });
            if (!options.type) options.type = type;
        }
        if (options?.config) options.config = absoluteURL(options.config);
        const bootstrap = fetch(url)
            .then(getText)
            .then((code) => {
                const hooks = this instanceof Hook ? this : void 0;
                postMessage.call(worker, { options, code, hooks });
            });
        return defineProperties(worker, {
            postMessage: {
                value: (data, ...rest) =>
                    bootstrap.then(() =>
                        postMessage.call(worker, data, ...rest),
                    ),
            },
            sync: {
                value: coincident(worker, JSON).proxy,
            },
        });
    };
