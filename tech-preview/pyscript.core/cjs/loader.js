'use strict';
const { interpreter } = require("./interpreters.js");
const { absoluteURL, resolve } = require("./utils.js");
const { parse } = require("./toml.js");
const { getJSON, getText } = require("./fetch-utils.js");

/**
 * @param {string} id the interpreter name @ version identifier
 * @param {string} [config] optional config file to parse
 * @returns
 */
const getRuntime = (id, config) => {
    let options = {};
    if (config) {
        // REQUIRES INTEGRATION TEST
        /* c8 ignore start */
        if (config.endsWith(".json")) {
            options = fetch(config).then(getJSON);
        } else if (config.endsWith(".toml")) {
            options = fetch(config).then(getText).then(parse);
        } else {
            try {
                options = JSON.parse(config);
            } catch (_) {
                options = parse(config);
            }
            // make the config a URL to be able to retrieve relative paths from it
            config = absoluteURL("./config.txt");
        }
        /* c8 ignore stop */
    }
    return resolve(options).then((options) => interpreter[id](options, config));
};
exports.getRuntime = getRuntime;

/**
 * @param {string} type the interpreter type
 * @param {string} [version] the optional interpreter version
 * @returns
 */
const getRuntimeID = (type, version = "") =>
    `${type}@${version}`.replace(/@$/, "");
exports.getRuntimeID = getRuntimeID;
