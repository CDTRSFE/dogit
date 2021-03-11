const fs = require('fs');
const path = require('path');
const { echo,readConfig } = require('../lib/helper');
const prompts = require('prompts');
const langChoise = [
        { title: '中文', value: 'ZH' },
        { title: '英文', value: 'EN' },
]
module.exports = class Set {
    // 先读取dogit init 默认生成的配置
    // defaultConfigSet 读取的文件字符串转换成json格式
    readTemplate() {
        this.defaultConfigSet = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../template/.dogitrc.json'), 'utf-8'));
    }
    // 检测配置里是否有systemConfig 这个字段
    async checkSystemConfig() {
        if(!this.defaultConfigSet.systemConfig) {
            echo('配置文件未找到，请使用 dogit init 初始化一个配置文件', 'error');
            return false;
        }
    }
    // 修改语言类型
    async modifyLangSet() {
       this.config = await prompts(
            {
                type: 'select',
                name: 'config',
                message: '请选择配置项',
                choices: Object.keys(this.defaultConfigSet.systemConfig).map(item => {
                    return { title: item, value: item }
                }),
                initial: 0
            }
        )
        if(this.config.config === 'lang') {
            this.langResponse = await prompts({
                type: 'select',
                name: 'config',
                message: '请选择所需语言',
                choices: langChoise,
                initial: 0
            })
        }
    }
    // 更改配置文件中的语言
    async changeConfig() {
        this.defaultConfigSet.systemConfig.lang = this.langResponse.config;
    }

    // 写入配置
    // 写入文件格式为字符串或者buffer
    writeConfig() {
        fs.writeFileSync(path.resolve(process.cwd(), '.dogitrc.json'),JSON.stringify(this.defaultConfigSet));
    }
    //启动
    async start() {
        this.readTemplate();
        if (await this.checkSystemConfig()) {
            process.exit();
        }
        await this.modifyLangSet();
        await this.changeConfig();
        this.writeConfig();
        echo('写入配置文件成功', 'success');
    }
}