const Task = require('./task');

module.exports = class Flow {
    constructor(flow, params) {
        this.flow = Array.isArray(flow) ? flow : [flow];
        this.params = params;
    }

    // 执行一组流程
    async start() {
        for (let item of this.flow) {
            const task = new Task(item, this.params);
            await task.start();
        }
    }
}

