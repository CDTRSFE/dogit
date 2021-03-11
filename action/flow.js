const { echo, readConfig } = require('../lib/helper');
const plugin = require('../plugin');
const prompts = require('prompts');
const ora = require('ora');
const Flows = require('../lib/flows');

module.exports = class Flow {
    constructor(configfile) {
        this.configfile = configfile;
    }

    // 开始
    async start() {
        const config = await readConfig(this.configfile);
        const flows = new Flows(config.flow)
        await flows.start()
        echo('恭喜你成功完成全部流程', 'success')
    }

}
