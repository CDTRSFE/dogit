const fs = require('fs');
const { exec, execSync } = require('child_process');
const prompts = require('prompts');
const ora = require('ora');
const { echo } = require('../../lib/helper');
const { isGitRoot, fetchRemote, guessNextTag, allTags, allRemotes } = require('../../lib/git');
const I18 = require('../../lib/i18');
const i18 = new I18();

module.exports = class AddTag {
    constructor({ option, hook }, handler) {
        this.option = option;
        this.hook = hook;
        this.handler = handler;
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

    // 获取交互参数
    async getParams() {
        this.params = await prompts([
            {
                type: 'select',
                name: 'env',
                message: i18.__("action.select-env"),
                choices: Object.keys(this.option.envs).map(key => {
                    return {
                        title: `${key}${this.option.envs[key].name ? `（${this.option.envs[key].name}）` : ''}`,
                        value: key
                    }
                }),
                initial: 0
            }
        ], {
            onCancel() {
                process.exit();
            }
        });

        this.params.tagPrefix = this.option.envs[this.params.env].prefix
        this.envTags = await allTags(this.params.tagPrefix);
        this.showLatestEnvTag()

        const moreParams = await prompts([
            {
                type: 'text',
                name: 'version',
                message: `${i18.__('action.enter-version')}(${i18.__('tip.recommend')} ${guessNextTag(this.prevVersion)}）`,
                validate: value => !value ? `${i18.__("tip.msg-cannot-empty")}` : (this.envTags.includes(`${this.params.tagPrefix}${value}`) ? i18.__("tip.version-existed") : true)
            },
            {
                type: 'text',
                name: 'message',
                message: i18.__("action.enter-tagMsg"),
                validate: value => !value ? i18.__("tip.msg-cannot-empty") : true
            }
        ], {
            onCancel() {
                process.exit();
            }
        });

        this.params = {
            ...this.params,
            ...moreParams,
            tag: `${this.params.tagPrefix}${moreParams.version}`
        }

        const isStart = await prompts([
            {
                type: 'toggle',
                name: 'value',
                message: `${i18.__("tip.enter-tag-is")} ${this.params.tag} ${i18.__("tip.confirm-exec")}`,
                initial: true,
                active: 'yes',
                inactive: 'no'
            }
        ], {
            onCancel() {
                process.exit();
            }
        });
        if (!isStart.value) {
            process.exit();
        }
    }

    // 展示最新的环境tag
    showLatestEnvTag() {
        this.prevTag = this.envTags[0] || '';
        this.prevVersion = this.prevTag.split(this.params.tagPrefix)[1];
        if (this.prevTag) {
            echo(`${i18.__('tip.last-tag').replace(/__ENV__/, this.params.env)} ${this.prevTag}`);
        } else {
            echo(i18.__('tip.no-tag').replace(/__ENV__/, this.params.env));
        }
        
    }

    // 打Tag
    async addTag() {
        return new Promise(resolve => {
            const command = `git tag -a ${this.params.tag} -m "${this.params.message}"`
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
    // 询问是否推送到远程分支
    async getPushParams(origins) {
        const isPushParams = await prompts([
            {
                type: 'toggle',
                name: 'isPush',
                message: i18.__('tip.push-tag'),
                initial: true,
                active: 'yes',
                inactive: 'no'
            },
            {
                type: prev => prev ? 'text': null,
                name: 'remote',
                message:i18.__("action.enter-repository"),
                initial: origins[0],
                validate: text => !origins.includes(text) ? i18.__("tip.invalid-remote") : true
            }
        ], {
            onCancel() {
                process.exit();
            }
        });
        if(!isPushParams.isPush) {
            return;
        }
        return new Promise(resolve => {
            const command = `git push ${isPushParams.remote} ${this.params.tag}`
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
    
    // 开始运行
    async start() {
        if (!await this.checkEnv()) {
            process.exit();
        }
        await this.getParams();
        await this.handler(this.hook.before, this.params);
        await this.addTag();
        const origins = await allRemotes();
        await this.getPushParams(origins);
        await this.handler(this.hook.after, this.params);
    };
}
