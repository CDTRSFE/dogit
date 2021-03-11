const fs = require('fs')
const path = require('path')

module.exports = class ReplaceVersionFile {
    constructor(option, tag, version, env) {
        this.option = option;
        this.tag = tag;
        this.version = version;
        this.env = env;
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
            this.content = await replace(this.content, this.tag, this.env, this.version);
        } else {
            const replaceTemplate = replace.replace(/__TAG__/, this.tag).replace('__ENV__', this.env).replace(/__VERSION__/, this.version);
            this.content = replaceTemplate;
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