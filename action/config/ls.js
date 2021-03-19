const fs = require('fs');
const path = require('path');
const { echo,config } = require('../../lib/helper');
const ora = require('ora');
const I18 = require('../../lib/i18');
const i18 = new I18();
module.exports = class ConfigGet {
    constructor(configPath) {
        this.configPath = configPath
    }
    // 读取配置
    readTemplate() {
        try {
            let data = config();
            echo(JSON.stringify(data,null, '\t'),'success')
        } catch(e) {
            echo(i18.__("tip.fail-config"),'error');
        }
    }

    start() {
        this.readTemplate();
    }
}
