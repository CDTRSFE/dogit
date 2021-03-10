const { exec, execSync } = require('child_process');

module.exports = class AutoCommit {
    constructor(option, tag, version, env) {
        this.option = option;
    }

    start() {
        execSync(`git add .`);
        execSync(`git commit -m "${this.option.message}"`);
        return true;
    }
}