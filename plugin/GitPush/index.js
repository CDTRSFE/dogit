const prompts = require('prompts');
const { isGitRoot, fetchRemote, allRemotes, getCurrentbranch } = require('../../lib/git');
const { exec, execSync } = require('child_process');
const { echo } = require('../../lib/helper');
const ora = require('ora');
const I18 = require('../../lib/i18');
const i18 = new I18();
module.exports = class GitPushOrigin {
    constructor({ option, hook }, handler) {
        this.option = option;
        this.hook = hook;
        this.handler = handler;
    }
    // 询问是否推送到远程分支
    async getPushOrigin() {
        const currentBranch = await getCurrentbranch();
        const isPush = await prompts([
            {
                type: 'toggle',
                name: 'isPush',
                message: i18.__('tip.push-origin'),
                initial: true,
                active: 'yes',
                inactive: 'no'
            },
            {
                type: prev => prev ? 'text' : null,
                name: 'remotebranch',
                message: i18.__("action.enter-remotebranch"),
                initial: currentBranch
            }
        ], {
            onCancel() {
                process.exit();
            }
        });
        if (!isPush.isPush) {
            return;
        }
        const confirm = await prompts([
            {
                type: 'toggle',
                name: 'confirm',
                message: i18.__('tip.push-confirm').replace(/__LOCALBRANCH__/,currentBranch).replace(/__REMOTE__/,isPush.remotebranch),
                initial: true,
                active: 'yes',
                inactive: 'no'
            }
        ], {
            onCancel() {
                process.exit();
            }
        });
        if(!confirm.confirm){
            return;
        }
        return new Promise(resolve => {
            const command = `git push origin ${isPush.remotebranch}`
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    echo(stderr, 'info')
                    process.exit();
                } else {
                    resolve();
                }
            });
        })
    }
    // 验证环境
    async checkEnv() {
        if (!await isGitRoot()) {
            echo(i18.__('tip.not-git-root'), 'error');
            return false;
        }
        return true;
    }
    // 开始运行
    async start() {
        if (!await this.checkEnv()) {
            process.exit();
        }
        await this.getPushOrigin();
        await this.handler(this.hook.after, this.params);
    };

}

