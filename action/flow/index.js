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
        if (!config || !config.flow) {
            echo('配置文件不存在或格式错误，尝试执行 dogit init 初始化配置文件', 'error');
            return;
        }
        const flow = new FlowLib(config.flow)
        await flow.start()
        echo('恭喜你成功完成全部流程', 'success')
    }

}
