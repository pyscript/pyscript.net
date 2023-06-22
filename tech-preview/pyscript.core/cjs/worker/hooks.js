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
    constructor(fields) {
        for (const [key, value] of workerHooks) this[key] = fields[value]?.();
    }
}
exports.Hook = Hook
/* c8 ignore stop */
