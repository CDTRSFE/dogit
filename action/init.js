const fs = require('fs');
const path = require('path');
const { echo } = require('../lib/helper');
const prompts = require('prompts');
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
                    message: '配置文件已存在，是否要覆盖？',
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
        echo('配置文件写入成功','success');
    }
    start() {
        this.readTemplate();
        this.writeConfig();
    }
}