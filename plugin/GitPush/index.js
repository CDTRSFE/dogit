const prompts = require('prompts');
const { isGitRoot, fetchRemote, allRemotes, getCurrentbranch, getBranchDifferent } = require('../../lib/git');
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
    async getPushOrigin(origins) {
        const currentBranch = await getCurrentbranch();
        const isPush = await prompts([
            {
                type: 'text',
                name: 'remote',
                message: `${i18.__("tip.branch")}${currentBranch},${i18.__("action.enter-repository")}`,
                initial: origins[0],
                validate: text => !origins.includes(text) ? i18.__("tip.invalid-remote") : true
            }
        ], {
            onCancel() {
                process.exit();
            }
        })
        const difference = await getBranchDifferent(currentBranch);
        if (difference.num > 0) {
            echo(`检测到本地有${difference.num}个提交未同步到远程：\n${difference.diff}`,'tip')
            const confirm = await prompts([
                {
                    type: 'toggle',
                    name: 'value',
                    message: '确定推送到远端？',
                    initial: true,
                    active: 'yes',
                    inactive: 'no'
                }
            ], {
                onCancel() {
                    process.exit();
                }
            })
            if (!confirm.value) {
                process.exit();
            }
            const command = `git push ${isPush.remote} ${currentBranch}`
            return execSync(command);
        } else {
            echo('检测到本地没有提交未同步到远程','tip')
            return
        }

    }
    // 验证环境
    async checkEnv() {
        if (!await isGitRoot()) {
            echo(i18.__('tip.not-git-root'), 'error');
            return false;
        }

        const spinner = ora(i18.__("tip.fetch-origin")).start();
        await fetchRemote()
        spinner.succeed(i18.__("tip.fetch-success"));

        return true;
    }
    // 开始运行
    async start() {
        if (!await this.checkEnv()) {
            process.exit();
        }
        const origins = await allRemotes();
        await this.getPushOrigin(origins);
        echo(i18.__("tip.push-success"), 'info');
        return true;

    };

}

