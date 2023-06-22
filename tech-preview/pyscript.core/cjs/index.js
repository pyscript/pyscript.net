'use strict';
const { $$ } = require("basic-devtools");

const xworker = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require("./worker/class.js"));
const { handle } = require("./script-handler.js");
const { assign } = require("./utils.js");
const { selectors, prefixes } = require("./interpreters.js");
const { CUSTOM_SELECTORS, handleCustomType } = require("./custom.js");
const { listener, addAllListeners } = require("./listeners.js");

(m => {
  exports.define = m.define;
  exports.whenDefined = m.whenDefined;
})(require("./custom.js"));
const XWorker = xworker();
exports.XWorker = XWorker;

const INTERPRETER_SELECTORS = selectors.join(",");

const mo = new MutationObserver((records) => {
    for (const { type, target, attributeName, addedNodes } of records) {
        // attributes are tested via integration / e2e
        /* c8 ignore next 17 */
        if (type === "attributes") {
            const i = attributeName.lastIndexOf("-") + 1;
            if (i) {
                const prefix = attributeName.slice(0, i);
                for (const p of prefixes) {
                    if (prefix === p) {
                        const type = attributeName.slice(i);
                        if (type !== "env") {
                            const method = target.hasAttribute(attributeName)
                                ? "add"
                                : "remove";
                            target[`${method}EventListener`](type, listener);
                        }
                        break;
                    }
                }
            }
            continue;
        }
        for (const node of addedNodes) {
            if (node.nodeType === 1) {
                addAllListeners(node);
                if (node.matches(INTERPRETER_SELECTORS)) handle(node);
                else {
                    $$(INTERPRETER_SELECTORS, node).forEach(handle);
                    if (!CUSTOM_SELECTORS.length) continue;
                    handleCustomType(node);
                    $$(CUSTOM_SELECTORS.join(","), node).forEach(
                        handleCustomType,
                    );
                }
            }
        }
    }
});

const observe = (root) => {
    mo.observe(root, { childList: true, subtree: true, attributes: true });
    return root;
};

const { attachShadow } = Element.prototype;
assign(Element.prototype, {
    attachShadow(init) {
        return observe(attachShadow.call(this, init));
    },
});

addAllListeners(observe(document));
$$(INTERPRETER_SELECTORS, document).forEach(handle);
