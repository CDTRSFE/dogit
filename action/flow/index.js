const { echo, readConfig } = require('../../lib/helper');
const plugin = require('../../plugin');
const prompts = require('prompts');
const ora = require('ora');
const FlowLib = require('./flow');
const I18 = require('../../lib/i18');
const i18 = new I18();

module.exports = class Flow {
    constructor(configfile) {
        this.configfile = configfile;
    }

    // 开始
    async start() {
        const config = await readConfig(this.configfile);
        const flow = new FlowLib(config.flow)
        await flow.start()
        echo(i18.__("tip.success-process"),'success')
    }

}
