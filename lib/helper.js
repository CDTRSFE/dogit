
const colors = require('colors');
const path = require('path');

module.exports = {
    // 打印信息
    echo(message, type) {
        const colorval = {
            success: 'green',
            error: 'red',
            info: 'gray'
        }[type]
        console.log(`\r\n  ${colorval ? message[colorval] : message}\r\n`)
    },

    // 读取配置
    async readConfig(configfile) {
        const filepath = configfile || './dogit.config.js';
        let result = null;
        try {
            result = require(path.resolve(process.cwd(), filepath));
        } catch (e) {}
        return result;
    }
}