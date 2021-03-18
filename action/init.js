const fs = require('fs');
const path = require('path');
const { echo } = require('../lib/helper');
const prompts = require('prompts');
module.exports = class Init {
    // 读取配置
    readTemplate() {
        this.template = fs.readFileSync(path.resolve(__dirname, '../template/dogit.config.js'), 'utf-8');
    }
    // 询问用户是否需要执行配置文件的覆盖
    async checkIsWrite() {
        // 判断当前配置文件存不存在
        const isExist = fs.existsSync(path.resolve(process.cwd(), 'dogit.config.js'));
        // 如果不存在，直接生成配置文件
        if(!isExist) {
            fs.writeFileSync(path.resolve(process.cwd(), 'dogit.config.js'), this.template);
            echo('配置文件生成成功', 'success');
            return;
        } 
        // 配置文件已经存在，判断是否要覆盖
        const response = await prompts ([
            {
                type: 'toggle',
                name: 'isWrite',
                message: '是否要覆盖修改的配置文件？',
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
        if(response.isWrite) {
            fs.writeFileSync(path.resolve(process.cwd(), 'dogit.config.js'), this.template);
        } 
        echo('配置文件写入成功','success');
        
    }
    start() {
        this.readTemplate();
        this.checkIsWrite();

    }
}