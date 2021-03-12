const { echo, readConfig } = require('../../lib/helper');
const plugin = require('../../plugin');
const prompts = require('prompts');
const ora = require('ora');
const FlowLib = require('./flow');

module.exports = class Flow {
    constructor(configfile) {
        this.configfile = configfile;
    }

    // 开始
    async start() {
        const config = await readConfig(this.configfile);
        const flow = new FlowLib(config.flow)
        await flow.start()
        echo('恭喜你成功完成全部流程', 'success')
    }

}
