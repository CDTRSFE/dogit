const Flow = require('./flow');

module.exports = class Flows {
    constructor(flows, params) {
        this.flows = Array.isArray(flows) ? flows : [flows];
        this.params = params;
    }

    // 执行一组流程
    async start() {
        for (let item of this.flows) {
            const flow = new Flow(item, this.params);
            await flow.start();
        }
    }
}

