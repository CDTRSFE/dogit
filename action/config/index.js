
const { echo } = require('../../lib/helper');
const path = require('path');
const I18 = require('../../lib/i18');
const i18 = new I18();

module.exports = class Config{
    constructor(name) {
        this.name = name;
    }
    start() {
        if(!['ls','set'].includes(this.name)) {
            echo(i18.__('tip.enter-illegal'), 'error')
            process.exit();
        } 
        const defaultConfig =  require(`./${this.name}`)
        const config = new defaultConfig(path.resolve(__dirname, '../../config/config.json'))
        config.start()
    }
}
