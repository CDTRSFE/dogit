const { exec, execSync } = require('child_process');
const { echo, replaceVar } = require('../../lib/helper');

module.exports = class AutoCommit {
    constructor({ option, before, after }, handler, params) {
        this.option = option;
        this.beforeHook = before;
        this.afterHook = after;
        this.handler = handler;
        this.params = params;
    }

    async formatMessage() {
        if (typeof this.option.message === 'function') {
            return await this.option.message(this.params)
        }

        return replaceVar(this.option.message, this.params)
    }

    async start() {
        const message = await this.formatMessage();
        await this.handler(this.beforeHook, {
            message: message
        });
        execSync(`git add .`);
        execSync(`git commit -m "${message}"`);
        await this.handler(this.afterHook, {
            message: message
        });
        return true;
    }
}