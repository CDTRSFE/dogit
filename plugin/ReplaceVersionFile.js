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
    replaceContent() {
        const replaceTemplate = this.option.replace.replace(/__TAG__/, this.tag).replace('__ENV__', this.env).replace(/__VERSION__/, this.version);
      if (this.option.mode === 'regex') {
          const reg = new RegExp(this.option.match);
          this.content = this.content.replace(reg, replaceTemplate);
      } else {
          this.content = replaceTemplate;
      }
    }

    // 写入替换文件
    writeFile() {
        this.readSouceFile();
        this.replaceContent();
        fs.writeFileSync(this.sourcePath, this.content);
    }

    start() {
        this.writeFile();
        return true;
    }
}