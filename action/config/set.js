const fs = require('fs');
const path = require('path');
const ora = require('ora');
const prompts = require('prompts');
const { echo } = require('../../lib/helper');
// 系统变量配置
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
        message: '请选择所需主题',
        choices: [{
            title: '黑色',
            value: 'black'
        },
        {
            title: '白色',
            value: 'white'
        }],
        initial: 0
    }
}
module.exports = class  ConfigSet {
    constructor(configPath) {
        this.configPath = configPath;
    }
    // 判断配置文件是否合法
    async dealConfigFile() {
        this.data = {};
        // 文件存在
        try {
            this.defaultConfigFile = require(this.configPath);
            Object.keys(configOption).map(key => {
               const valid = configOption[key].choices.find(choice => {
                   // config json里面有当前配置
                   return choice.value === this.defaultConfigFile[key]
               })
               // 如果配置文件中是不合法的设置，更改为合法的设置(默认改为第一个)
               if(!valid) {
                    this.data[key] = configOption[key].choices[0].value
               } else {
                // 是合法的，就直接用config json的值
                    this.data[key] = valid.value
               }
            })
            fs.writeFileSync(this.configPath,JSON.stringify(this.data,null,"\t")); // 以json的格式写进文件内
         }
         // 文件不存在, 将默认的配置文件写入
         catch(err){
             Object.keys(configOption).map(key => {
                 this.data[key] = configOption[key].choices[0].value
             })
             // 创建目录
             var fliePath = path.resolve(__dirname, '../../config');
             fs.mkdirSync(fliePath);// 同步的创建文件夹，避免异步创建文件影响后面对文件的操作
             fs.writeFileSync(`${fliePath}/config.json`,JSON.stringify(this.data,null,"\t"));
         }
    }
    // 先读取配置文件
    // defaultConfigSet 读取的文件字符串转换成json格式
    async readTemplate() {
        this.defaultConfigSet = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
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
        fs.writeFileSync(this.configPath,data);
    }
    //启动
    async start() {
        await this.dealConfigFile();
        await this.readTemplate();
        await this.modifyLangSet();
        await this.changeConfig();
        this.writeConfig();
        echo('写入配置文件成功', 'success');
    }
}