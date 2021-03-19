const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const { echo } = require('../lib/helper');
const I18 = require('../lib/i18');
const i18 = new I18();
module.exports = class Init {
    constructor() {
        this.configFilePath = path.resolve(process.cwd(), 'dogit.config.js');
    }

    // 读取配置
    readTemplate() {
        this.template = fs.readFileSync(path.resolve(__dirname, '../template/dogit.config.js'), 'utf-8');
    }

    async writeConfig() {
        // 判断当前配置文件存不存在
        const isExist = fs.existsSync(this.configFilePath);
        // 如果不存在，直接生成配置文件
        if(isExist) {
            // 配置文件已经存在，判断是否要覆盖
            const response = await prompts ([
                {
                    type: 'toggle',
                    name: 'isWrite',
                    message: i18.__('tip.config-existed'),
                    initial: false,
                    active: 'yes',
                    inactive: 'no'
                },
            ],
            {
                onCancel() {
                    process.exit();
                }
            }) 
            if (!response.isWrite) return
        }
        fs.writeFileSync(this.configFilePath, this.template);
        echo(i18.__("tip.success-config"), 'success');
    }
    start() {
        this.readTemplate();
        this.writeConfig();
    }
}
