const fs = require('fs');
const { exec, execSync } = require('child_process');
const prompts = require('prompts');
const ora = require('ora');
const { echo, readConfig } = require('../lib/helper');
const { isGitRoot, fetchRemote, guessNextTag, allTags } = require('../lib/git');
const plugin = require('../plugin')

const I18 = require('../lib/i18');
const i18 = new I18();
module.exports = class Tag {
    constructor(configfile) {
        this.configfile = configfile;
    }

    // 验证环境
    async checkEnv() {
        if (!await isGitRoot()) {
            echo(i18.__('tip.not-git-root'), 'error');
            return false;
        }

        this.config = await readConfig(this.configfile);

        if (!this.config) {
            echo(i18.__('tip.lost-config'), 'error');
            return false;
        }

        const spinner = ora(i18.__('tip.fetch-origin')).start();
        await fetchRemote()
        spinner.succeed(i18.__('tip.fetch-success'));

        return true;
    }

    // 获取交互参数
    async getParams() {
        this.params = await prompts([
            {
                type: 'select',
                name: 'env',
                message: i18.__('tip.select-env'),
                choices: Object.keys(this.config.envs).map(item => {
                    return { title: item, value: item }
                }),
                initial: 0
            }
        ], {
            onCancel() {
                process.exit();
            }
        });

        this.params.tagPrefix = this.config.envs[this.params.env].prefix
        this.envTags = await allTags(this.params.tagPrefix);
        this.showLatestEnvTag()

        const moreParams = await prompts([
            {
                type: 'text',
                name: 'version',
                message: `${i18.__('tip.enter-version')}(${i18.__('tip.recommend')} ${guessNextTag(this.prevVersion)})`,
                validate: value => !value ? i18.__('tip.version-cannot-empty') : (this.envTags.includes(`${this.params.tagPrefix}${value}`) ? i18.__('tip.version-already-exist') : true)
            },
            {
                type: 'text',
                name: 'message',
                message: i18.__('tip.enter-tag-msg'),
                validate: value => !value ? i18.__('tip.msg-cannot-empty') : true
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
                message: `${i18.__('tip.enter-tag-is')} ${this.params.tag}${i18.__('tip.confirm-exec')}`,
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
        this.prevTag = this.envTags[0];
        this.prevVersion = this.prevTag.split(this.params.tagPrefix)[1]
        echo(`${i18.__('tip.last-tag').replace(/__ENV__/, this.params.env)} ${this.prevTag}`);
    }

    // 构造钩子脚本
    formatHookCommand(command) {
        return command.replace(/__VERSION__/,`'${this.params.version}'`).replace(/__TAG__/,`'${this.params.tag}'`).replace('__ENV__', this.params.env);
    }

    // 执行钩子
    async excuteHook(command) {
        const spinner = ora(i18.__('tip.excute-hook-start').replace(/__CMD__/, command)).start();
        return new Promise(resolve => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    spinner.fail(i18.__('tip.excute-hook-error').replace(/__CMD__/, command));
                    echo(stderr, 'info')
                    process.exit();
                }
                spinner.succeed(i18.__('tip.excute-hook-success').replace(/__CMD__/, command));
                resolve();
            });
        })
    }

    // 执行插件
    async excutePlugin(name, option) {
        const spinner = ora(i18.__('tip.excute-plugin-start').replace(/__PLUGIN__/, name)).start();
        try {
            await plugin(name, option, this.params.tag, this.params.version, this.params.env);
            spinner.succeed(i18.__('tip.excute-plugin-success').replace(/__PLUGIN__/, name));
        } catch (e) {
            spinner.fail(i18.__('tip.excute-plugin-error').replace(/__PLUGIN__/, name));
            echo(e.message, 'info')
            process.exit();
        }
    }

    async excuteHooks(type) {
        const commands = this.config[`${type}Tag`] || [];
        for (let item of commands) {
            if (item.type === 'cmd') {
                const command = this.formatHookCommand(item.value);
                await this.excuteHook(command);
            }

            if (item.type === 'plugin') {
                await this.excutePlugin(item.value, item.option);
            }
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

    // 开始运行
    async start() {
        if (!await this.checkEnv()) {
            process.exit();
        }
        await this.getParams();
        await this.excuteHooks('before');
        await this.addTag();
        await this.excuteHooks('after');
        echo(i18.__('tip.the-end'), 'success')
    }
}
