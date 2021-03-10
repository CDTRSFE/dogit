const fs = require('fs');
const { exec, execSync } = require('child_process');
const prompts = require('prompts');
const ora = require('ora');
const { echo, readConfig } = require('../lib/helper');
const { isGitRoot, fetchRemote, guessNextTag, allTags } = require('../lib/git');
const plugin = require('../plugin')


module.exports = class Tag {
    constructor(configfile) {
        this.configfile = configfile;
    }

    // 验证环境
    async checkEnv() {
        if (!await isGitRoot()) {
            echo('当前目录不是Git目录，请切到Git根目录之后再操作', 'error');
            return false;
        }

        this.config = await readConfig(this.configfile);

        if (!this.config) {
            echo('配置文件未找到，请使用 dogit init 初始化一个配置文件或者用 -n 参数手动指定一个配置文件', 'error');
            return false;
        }

        const spinner = ora('正在fetch远程仓库..').start();
        await fetchRemote()
        spinner.succeed('同步远程仓库成功');

        return true;
    }

    // 获取交互参数
    async getParams() {
        this.params = await prompts([
            {
                type: 'select',
                name: 'env',
                message: '请选择要打Tag的环境',
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
                message: `请输入版本号（推荐 ${guessNextTag(this.prevVersion)}）`,
                validate: value => !value ? `描述信息不能为空` : (this.envTags.includes(`${this.params.tagPrefix}${value}`) ? '该版本号已存在' : true)
            },
            {
                type: 'text',
                name: 'message',
                message: '请输入Tag描述信息',
                validate: value => !value ? `描述信息不能为空` : true
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
                message: `你即将打的Tag号为 ${this.params.tag} 确定无误开始执行？`,
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
        echo(`${this.params.env} 环境的最近一次Tag为 ${this.prevTag}`);
    }

    // 构造钩子脚本
    formatHookCommand(command) {
        return command.replace(/__VERSION__/,`'${this.params.version}'`).replace(/__TAG__/,`'${this.params.tag}'`).replace('__ENV__', this.params.env);
    }

    // 执行钩子
    async excuteHook(command) {
        const spinner = ora(`开始执行钩子脚本 ${command}`).start();
        return new Promise(resolve => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    spinner.fail(`执行钩子脚本 ${command} 出错`);
                    echo(stderr, 'info')
                    process.exit();
                }
                spinner.succeed(`执行钩子脚本 ${command} 成功`);
                resolve();
            });
        })
    }

    // 执行插件
    async excutePlugin(name, option) {
        const spinner = ora(`开始执行钩子插件 ${name}`).start();
        try {
            await plugin(name, option, this.params.tag, this.params.version, this.params.env);
            spinner.succeed(`执行钩子插件 ${name} 成功`);
        } catch (e) {
            spinner.fail(`执行钩子插件 ${name} 出错，请检查配置`);
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
        echo('恭喜你成功打好Tag', 'success')
    }
}
