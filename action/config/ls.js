const fs = require('fs');
const path = require('path');
const { echo } = require('../../lib/helper');
const ora = require('ora');
module.exports = class ConfigGet {
    constructor(configPath) {
        this.configPath = configPath
    }
    // 读取配置
    readTemplate() {
        try {
            let data = require(this.configPath);
            echo(JSON.stringify(data,null, '\t'),'success')
        } catch(e) {
            echo('获取文件配置失败,请使用dogit config set 命令先生成配置文件','error');
        }
    }

    start() {
        this.readTemplate();
    }
}