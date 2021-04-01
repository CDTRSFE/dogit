
const colors = require('colors');
const path = require('path');
const { config } = require('process');

module.exports = {
    // 打印信息
    echo(message, type) {
        const colorval = {
            success: 'green',
            error: 'red',
            info: 'gray',
            tip:'yellow'
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
    },

    // 替换变量
    replaceVar(string, params) {
        return string.replace(/__\$([\w\d]+)__/g, (match, key ) => {
            return params[key] === undefined ? match : params[key];
        })
      },
    // 默认的系统配置
    config(key) {
        const configOption = require('../config/template.json');
        const configData = {};
        // 文件存在
        try {
            const defaultConfigFile = require('../config/config.json');
            Object.keys(configOption).forEach(key => {
                // scope 为function
                const scope = configOption[key].scope;
                const valid = typeof(scope) === 'function' ? scope(defaultConfigFile[key]) : scope.includes(defaultConfigFile[key]);
                configData[key] = valid ? defaultConfigFile[key] : configOption[key].default;
            })
         }
         // 文件不存在, 将默认的配置文件写入
         catch(err){
             Object.keys(configOption).map(key => {
                 configData[key] = configOption[key].default
             })
         }
         return key ? configData[key] : configData;
    }
}
