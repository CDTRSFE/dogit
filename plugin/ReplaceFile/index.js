const fs = require('fs')
const path = require('path')
const { echo, replaceVar } = require('../../lib/helper');

module.exports = class ReplaceVersionFile {
    constructor({ option }, handler, params) {
        this.option = option;
        this.params = params;
        this.handler = handler;
        this.sourcePath = path.resolve(process.cwd(), this.option.path)
    }

    // 读取要被替换的文件
    readSouceFile() {
        this.content = fs.readFileSync(this.sourcePath, 'utf-8');
    }

    // 替换内容
    async replaceContent() {
        const replace = this.option.replace;
        if (typeof replace === 'function') {
            this.content = await replace(this.content, this.params);
        }
        else {
            this.content = replaceVar(replace, this.params);
        }
    }

    // 写入替换文件
    async writeFile() {
        this.readSouceFile();
        await this.replaceContent();
        fs.writeFileSync(this.sourcePath, this.content);
    }

    async start() {
        await this.writeFile();
        return true;
    }
}