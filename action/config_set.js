const fs = require('fs');
const path = require('path');
const ora = require('ora');
const prompts = require('prompts');
const { echo } = require('../lib/helper');
const langChoise = [
    { title: '中文', value: 'ZH-CN' },
    { title: '英文', value: 'EN' },
];
const defaultConfig = {"systemConfig":{"lang":"ZH-CN"}};
module.exports = class  Configset {
    async checkConfigFile() {
        fs.exists(path.resolve(__dirname, '../config/config.json'), (exists) => {
            // 如果config文件不存在 先初始化文件，再执行其他操作
            if(!exists) {
                const spinner = ora('正在初始化系统配置文件..').start();
                var fliePath = path.resolve(__dirname, '../config');
                fs.mkdir(fliePath, (err)=> {
                    if(!err) {
                        fs.writeFileSync(path.resolve(process.cwd(), 'config/config.json'),JSON.stringify(defaultConfig));
                        spinner.succeed('初始化配置文件成功')
                        this.totalOperation();
                    }
                });
                return;
            }
            // config文件存在
            this.totalOperation();
        })
    }
    // 先读取配置文件
    // defaultConfigSet 读取的文件字符串转换成json格式
    async readTemplate() {
        this.defaultConfigSet = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config/config.json'), 'utf-8'));
    }
    // 修改语言类型
    async modifyLangSet() {
       this.config = await prompts([
            {
                type: 'select',
                name: 'config',
                message: '请选择配置项',
                choices: Object.keys(this.defaultConfigSet.systemConfig).map(item => {
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
        // 设置语言进行的操作
        if(this.config.config === 'lang') {
            this.langResponse = await prompts([{
                type: 'select',
                name: 'config',
                message: '请选择所需语言',
                choices: langChoise,
                initial: 0
            }],
            {
                onCancel() {
                    process.exit();
                }
            })
        }
    }
    // 更改配置文件中的语言
    async changeConfig() {
        if(this.langResponse) {
            this.defaultConfigSet.systemConfig.lang = this.langResponse.config;
        }
    }

    // 写入配置
    // 写入文件格式为字符串或者buffer
    writeConfig() {
        const data = JSON.stringify(this.defaultConfigSet,null,"\t")
        fs.writeFileSync(path.resolve(__dirname, '../config/config.json'),data);
    }
    // 基本的操作方法
    async totalOperation() {
        await this.readTemplate();
        await this.modifyLangSet();
        await this.changeConfig();
        this.writeConfig();
        echo('写入配置文件成功', 'success');
    }
    //启动
    async start() {
        await this.checkConfigFile();
    }
}