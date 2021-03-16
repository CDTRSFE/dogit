const fs = require('fs');
const path = require('path');
const ora = require('ora');
const prompts = require('prompts');
const { echo,config } = require('../../lib/helper');
const configOption = require('../../lib/config_option.json')
module.exports = class  ConfigSet {
    constructor(configPath) {
        this.configPath = configPath;
    }
    // 判断配置文件是否合法
    async dealConfigFile() {
        this.configData = config();
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