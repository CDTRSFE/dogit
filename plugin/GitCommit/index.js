const { exec, execSync } = require('child_process');
const { echo, replaceVar } = require('../../lib/helper');

module.exports = class AutoCommit {
    constructor({ option,hook }, handler, params) {
        this.option = option;
        this.hook = hook;
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
        await this.handler(this.hook.before, {
            message: message
        });
        execSync(`git add .`);
        execSync(`git commit -m "${message}"`);
        await this.handler(this.hook.after, {
            message: message
        });
        echo('commit 成功，接下来你可以 push 到远端', 'info');
        return true;
    }
}