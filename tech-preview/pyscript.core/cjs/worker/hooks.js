'use strict';
// REQUIRES INTEGRATION TEST
/* c8 ignore start */
const workerHooks = [
    ["beforeRun", "codeBeforeRunWorker"],
    ["beforeRunAsync", "codeBeforeRunWorkerAsync"],
    ["afterRun", "codeAfterRunWorker"],
    ["afterRunAsync", "codeAfterRunWorkerAsync"],
];

class Hook {
    constructor(interpreter, options) {
        this.interpreter = interpreter;
        this.onWorkerReady = options.onWorkerReady;
        for (const [key, value] of workerHooks) this[key] = options[value]?.();
    }
    get stringHooks() {
        const hooks = {};
        for (const [key] of workerHooks) {
            if (this[key]) hooks[key] = this[key];
        }
        return hooks;
    }
}
exports.Hook = Hook
/* c8 ignore stop */
