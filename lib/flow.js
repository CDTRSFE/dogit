const { echo, replaceVar } = require('./helper');
const plugin = require('../plugin');
const ora = require('ora');
const { exec } = require('child_process');

module.exports = class Flow {
    constructor(flow, params) {
        this.flow = flow;
        this.params = params;
    }

    // 执行shell命令
    async excuteShell() {
        const command = replaceVar(this.flow.command, this.params);
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
    // flow 表示该流程本身的对象
    // params 表示调用方（上级插件传入的参数）
    async excutePlugin() {
        echo(`开始执行插件 ${this.flow.plugin}`, 'info')
        try {
            const instance = await plugin.register(this.flow, this.handler, this.params);
            // const spinner = ora(`开始执行插件 ${this.flow.plugin}`).start();
            await instance.start();
            // spinner.succeed(`执行插件 ${this.flow.plugin} 成功`);
            echo(`执行插件 ${this.flow.plugin} 成功`, 'success')
        } catch (e) {
            // spinner.fail(`执行插件 ${this.flow.plugin} 出错，请检查配置`);
            echo(`执行插件 ${this.flow.plugin} 出错，请检查配置`, 'error')
            echo(e.message, 'info')
            process.exit();
        }
    }

    // 传递给插件的处理方法
    async handler(hook, params) {
        if (!hook) return;
        const Flows = require('./flows');
        const flows = new Flows(hook, params);
        await flows.start();
    }

    // 执行一段流程
    async start() {
      if (typeof this.flow.when === 'function') {
          const isShould = await this.flow.when(this.params);
          if (!isShould) return;
      }

      if (this.flow.command) {
          await this.excuteShell();
      }

      if (this.flow.plugin) {
          await this.excutePlugin()
      }
  }

}

