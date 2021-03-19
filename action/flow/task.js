const { echo, replaceVar } = require('../../lib/helper');
const plugin = require('../../plugin');
const ora = require('ora');
const { exec } = require('child_process');
const I18 = require('../../lib/i18');
const i18 = new I18();
module.exports = class Task {
    constructor(task, params) {
        this.task = task;
        this.params = params;
    }

    // 执行shell命令
    async excuteShell() {
        const command = replaceVar(this.task.command, this.params);
        const spinner = ora(i18.__("tip.start-script").replace(/ __CMD__/, command)).start();
        return new Promise(resolve => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    spinner.fail(i18.__("tip.erro-script").replace(/ __CMD__/, command));
                    echo(stderr, 'info')
                    process.exit();
                }
                spinner.succeed(i18.__("tip.success-script").replace(/ __CMD__/, command));
                resolve();
            });
        })
    }

    // 执行插件
    async excutePlugin() {
        echo(i18.__("tip.start-plugin").replace(/__PLUGIN__/,this.task.plugin), 'info')
        try {
            const instance = await plugin.register(this.task, this.handler, this.params);
            // const spinner = ora(`开始执行插件 ${this.task.plugin}`).start();
            await instance.start();
            // spinner.succeed(`执行插件 ${this.task.plugin} 成功`);
            echo(i18.__('tip.success-plugin').replace(/__PLUGIN__/, this.task.plugin), 'success')
        } catch (e) {
            // spinner.fail(`执行插件 ${this.task.plugin} 出错，请检查配置`);
            echo(i18.__("tip.error-plugin").replace(/__PLUGIN__/, this.task.plugin), 'error')
            echo(e.message, 'info')
            process.exit();
        }
    }

    // 传递给插件的处理方法
    async handler(hook, params) {
        if (!hook) return;
        const Flow = require('./flow');
        const flow = new Flow(hook, params);
        await flow.start();
    }

    // 执行一段流程
    async start() {
      if (typeof this.task.when === 'function') {
          const isShould = await this.task.when(this.params);
          if (!isShould) return;
      }

      if (this.task.command) {
          await this.excuteShell();
      }

      if (this.task.plugin) {
          await this.excutePlugin()
      }
  }

}

