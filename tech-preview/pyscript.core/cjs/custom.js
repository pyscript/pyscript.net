'use strict';
require("@ungap/with-resolvers");
const { $$ } = require("basic-devtools");

const { assign, create } = require("./utils.js");
const { getDetails } = require("./script-handler.js");
const {
    registry: defaultRegistry,
    prefixes,
    configs
} = require("./interpreters.js");
const { getRuntimeID } = require("./loader.js");
const { io } = require("./interpreter/_utils.js");
const { addAllListeners } = require("./listeners.js");
const { Hook } = require("./worker/hooks.js");

const CUSTOM_SELECTORS = [];
exports.CUSTOM_SELECTORS = CUSTOM_SELECTORS;

/**
 * @typedef {Object} Runtime custom configuration
 * @prop {object} interpreter the bootstrapped interpreter
 * @prop {(url:string, options?: object) => Worker} XWorker an XWorker constructor that defaults to same interpreter on the Worker.
 * @prop {object} config a cloned config used to bootstrap the interpreter
 * @prop {(code:string) => any} run an utility to run code within the interpreter
 * @prop {(code:string) => Promise<any>} runAsync an utility to run code asynchronously within the interpreter
 * @prop {(path:string, data:ArrayBuffer) => void} writeFile an utility to write a file in the virtual FS, if available
 */

const types = new Map();
const waitList = new Map();

// REQUIRES INTEGRATION TEST
/* c8 ignore start */
/**
 * @param {Element} node any DOM element registered via define.
 */
const handleCustomType = (node) => {
    for (const selector of CUSTOM_SELECTORS) {
        if (node.matches(selector)) {
            const type = types.get(selector);
            const { resolve } = waitList.get(type);
            const { options, known } = registry.get(type);
            if (!known.has(node)) {
                known.add(node);
                const {
                    interpreter: runtime,
                    version,
                    config,
                    env,
                    onInterpreterReady,
                } = options;
                const name = getRuntimeID(runtime, version);
                const id = env || `${name}${config ? `|${config}` : ""}`;
                const { interpreter: engine, XWorker: Worker } = getDetails(
                    runtime,
                    id,
                    name,
                    version,
                    config,
                );
                engine.then((interpreter) => {
                    const module = create(defaultRegistry.get(runtime));

                    const {
                        onBeforeRun,
                        onBeforeRunAsync,
                        onAfterRun,
                        onAfterRunAsync,
                    } = options;

                    const hooks = new Hook(interpreter, options);

                    const XWorker = function XWorker(...args) {
                        return Worker.apply(hooks, args);
                    };

                    // These two loops mimic a `new Map(arrayContent)` without needing
                    // the new Map overhead so that [name, [before, after]] can be easily destructured
                    // and new sync or async patches become easy to add (when the logic is the same).

                    // patch sync
                    for (const [name, [before, after]] of [
                        ["run", [onBeforeRun, onAfterRun]],
                    ]) {
                        const method = module[name];
                        module[name] = function (interpreter, code) {
                            if (before) before.call(this, resolved, node);
                            const result = method.call(this, interpreter, code);
                            if (after) after.call(this, resolved, node);
                            return result;
                        };
                    }

                    // patch async
                    for (const [name, [before, after]] of [
                        ["runAsync", [onBeforeRunAsync, onAfterRunAsync]],
                    ]) {
                        const method = module[name];
                        module[name] = async function (interpreter, code) {
                            if (before) await before.call(this, resolved, node);
                            const result = await method.call(
                                this,
                                interpreter,
                                code,
                            );
                            if (after) await after.call(this, resolved, node);
                            return result;
                        };
                    }

                    module.setGlobal(interpreter, "XWorker", XWorker);

                    const resolved = {
                        type,
                        interpreter,
                        XWorker,
                        io: io.get(interpreter),
                        config: structuredClone(configs.get(name)),
                        run: module.run.bind(module, interpreter),
                        runAsync: module.runAsync.bind(module, interpreter),
                    };

                    resolve(resolved);

                    onInterpreterReady?.(resolved, node);
                });
            }
        }
    }
};
exports.handleCustomType = handleCustomType;

/**
 * @type {Map<string, {options:object, known:WeakSet<Element>}>}
 */
const registry = new Map();

/**
 * @typedef {Object} CustomOptions custom configuration
 * @prop {'pyodide' | 'micropython' | 'wasmoon' | 'ruby-wasm-wasi'} interpreter the interpreter to use
 * @prop {string} [version] the optional interpreter version to use
 * @prop {string} [config] the optional config to use within such interpreter
 * @prop {(environment: object, node: Element) => void} [onInterpreterReady] the callback that will be invoked once
 */

/**
 * Allows custom types and components on the page to receive interpreters to execute any code
 * @param {string} type the unique `<script type="...">` identifier
 * @param {CustomOptions} options the custom type configuration
 */
const define = (type, options) => {
    if (defaultRegistry.has(type) || registry.has(type))
        throw new Error(`<script type="${type}"> already registered`);

    if (!defaultRegistry.has(options?.interpreter))
        throw new Error(`Unspecified interpreter`);

    // allows reaching out the interpreter helpers on events
    defaultRegistry.set(type, defaultRegistry.get(options?.interpreter));

    // ensure a Promise can resolve once a custom type has been bootstrapped
    whenDefined(type);

    // allows selector -> registry by type
    const selectors = [`script[type="${type}"]`, `${type}-script`];
    for (const selector of selectors) types.set(selector, type);

    CUSTOM_SELECTORS.push(...selectors);
    prefixes.push(`${type}-`);

    // ensure always same env for this custom type
    registry.set(type, {
        options: assign({ env: type }, options),
        known: new WeakSet(),
    });

    addAllListeners(document);
    $$(selectors.join(",")).forEach(handleCustomType);
};
exports.define = define;

/**
 * Resolves whenever a defined custom type is bootstrapped on the page
 * @param {string} type the unique `<script type="...">` identifier
 * @returns {Promise<object>}
 */
const whenDefined = (type) => {
    if (!waitList.has(type)) waitList.set(type, Promise.withResolvers());
    return waitList.get(type).promise;
};
exports.whenDefined = whenDefined;
/* c8 ignore stop */
