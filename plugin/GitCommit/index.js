const { exec, execSync } = require('child_process');
const { echo, replaceVar } = require('../../lib/helper');

const I18 = require('../../lib/i18');
const i18 = new I18();

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
        echo(i18.__('tip.commit-success'), 'info');
        return true;
    }
}