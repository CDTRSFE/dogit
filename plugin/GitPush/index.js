const prompts = require('prompts');
const { isGitRoot, fetchRemote, allRemotes, getCurrentbranch,getBranchDifferent } = require('../../lib/git');
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
                type:  'text' ,
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
        console.log('检测到本地有N个提交未同步到远程：',difference)
        // return new Promise(resolve => {
        //     const command = `git push ${isPush.remote}`
        //     exec(command, (error, stdout, stderr) => {
        //         if (error) {
        //             echo(stderr, 'info')
        //             process.exit();
        //         } else {
        //             resolve();
        //         }
        //     });
        // })
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
        await this.handler(this.hook.after, this.params);
    };

}

