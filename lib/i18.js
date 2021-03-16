const { config } = require('./helper');
module.exports = class I18 {
    constructor() {
        this.lang = config('lang') // 'zh-CN';
        this.translate = require(`../locales/${this.lang}.json`);
    }

    __(key) {
        return key.split('.').reduce((result, item) => {
            return result[item];
        }, this.translate)
    }
}