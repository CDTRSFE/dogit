const fs = require('fs');
const path = require('path');
const { echo } = require('../lib/helper');
const ora = require('ora');
const I18 = require('../lib/i18');
const i18 = new I18();

module.exports = class ConfigGet {
    // 读取配置
    readTemplate() {
        const spinner = ora(i18.__('tip.get-config')).start();
        this.configList = fs.readFileSync(path.resolve(__dirname, '../config/config.json'), 'utf-8');
        const type = JSON.parse(this.configList).systemConfig;
        spinner.succeed(i18.__('tip.get-config-success'))
        echo(JSON.stringify(type),'success')
       
    }

    start() {
        this.readTemplate();
    }
}