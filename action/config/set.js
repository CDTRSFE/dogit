const fs = require('fs');
const path = require('path');
const ora = require('ora');
const prompts = require('prompts');
const { echo } = require('../../lib/helper');
// 系统变量配置
// default: 该配置项默认值，
// scope：该配置项可选值 必须的。通过这个参数来判断json文件里面的配置是不是合法
// prompts: 该配置项的类型等设置 

const configOption = {
    lang: {
        default: 'zh-CN', 
        scope:['zh-CN', 'en'], 
        prompts: {
            name: 'lang',
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
        }
    }
}
module.exports = class  ConfigSet {
    constructor(configPath) {
        this.configPath = configPath;
    }
    // 判断配置文件是否合法
    async dealConfigFile() {
        this.configData = {};
        // 文件存在
        try {
            const defaultConfigFile = require(this.configPath);
            Object.keys(configOption).forEach(key => {
                // scope 为function
                const scope = configOption[key].scope;
                const valid = typeof(scope) === 'function' ? scope(defaultConfigFile[key]) : scope.includes(defaultConfigFile[key]);
                this.configData[key] = valid ? defaultConfigFile[key] : configOption[key].default;
            })
         }
         // 文件不存在, 将默认的配置文件写入
         catch(err){
             Object.keys(configOption).map(key => {
                 this.configData[key] = configOption[key].default
             })
         }
    }
    // 配置修改
    async modifyLangSet() {
       this.config = await prompts([
            {
                type: 'select',
                name: 'config',
                message: '请选择配置项',
                choices: Object.keys(this.configData).map(item => {
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
            configOption[this.config.config].prompts
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
            this.configData[this.config.config] = this.configResponse[this.config.config];
        }
    }

    // 写入配置
    // 写入文件格式为字符串或者buffer
    writeConfig() {
        const data = JSON.stringify(this.configData,null,"\t")
        fs.writeFileSync(this.configPath,data);
        echo('写入配置文件成功', 'success');
    }
    //启动
    async start() {
        await this.dealConfigFile();
        await this.modifyLangSet();
        await this.changeConfig();
        this.writeConfig();
    }
}