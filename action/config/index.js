
const { echo } = require('../../lib/helper');
const path = require('path')
module.exports = class Config{
    constructor(name) {
        this.name = name;
    }
    start() {
        if(!['ls','set'].includes(this.name)) {
            echo('输入的命令不合法, 请通过 dogit config --help 来查看可用命令', 'error')
            process.exit();
        } 
        const defaultConfig =  require(`./${this.name}`)
        const config = new defaultConfig(path.resolve(__dirname, '../../config/config.json'))
        config.start()
    }
}