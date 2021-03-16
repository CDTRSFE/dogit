const fs = require('fs');
const path = require('path');
const ora = require('ora');
const prompts = require('prompts');
const { echo } = require('../lib/helper');
const configOption = {
    lang: {
        name: 'config',
        type: 'select',
        message: '请选择所需语言',
        choices: [{
            title: '中文',
            value: 'zh-CN'
        },
        {
            title: '英文',
            value: 'en'
        }],
        initial: 0
    },
    theme: {
        name: 'config',
        type: 'select',
        message: '请选择所需颜色',
        choices: [{
            title: '黑色',
            value: 'black'
        },
        {
            title: '白色',
            value: 'white'
        }],
        initial: 0
    },
}
const defaultConfig = {"systemConfig":{"lang":"ZH-CN"}};
module.exports = class  ConfigSet {
    // 先读取配置文件
    // defaultConfigSet 读取的文件字符串转换成json格式
    async readTemplate() {
        this.defaultConfigSet = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config/config.json'), 'utf-8'));
    }
    // 配置修改
    async modifyLangSet() {
       this.config = await prompts([
            {
                type: 'select',
                name: 'config',
                message: '请选择配置项',
                choices: Object.keys(this.defaultConfigSet).map(item => {
                    return { title: item, value: item }
                }),
                initial: 0
            }],
            {
                onCancel() {
                    process.exit();
                }
            }
        )
        // configResponse 选择对应的配置的返回值,写文件的时候需要用到，所以挂在this上
        this.configResponse = await prompts([
            configOption[this.config.config]
        ],
        {
            onCancel() {
                process.exit();
            }
        })
    }
    // 更改配置文件中对应的配置项
    async changeConfig() {
        if(this.configResponse) {
            this.defaultConfigSet[this.config.config] = this.configResponse.config;
        }
    }

    // 写入配置
    // 写入文件格式为字符串或者buffer
    writeConfig() {
        const data = JSON.stringify(this.defaultConfigSet,null,"\t")
        fs.writeFileSync(path.resolve(__dirname, '../config/config.json'),data);
    }
    //启动
    async start() {
        await this.readTemplate();
        await this.modifyLangSet();
        await this.changeConfig();
        this.writeConfig();
        echo('写入配置文件成功', 'success');
    }
}