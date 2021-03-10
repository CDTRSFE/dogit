const colors = require('colors');

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
        const explorer = require('cosmiconfig').cosmiconfig('dogit');
        const result = configfile ? await explorer.load(configfile) : await explorer.search();
        if (!result) return false;
        return result.config;
    }
}