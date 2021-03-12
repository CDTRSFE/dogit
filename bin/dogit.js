#! /usr/bin/env node
const program = require('commander')
const Init = require('../action/init')
const I18 = require('../lib/i18');
const Flow = require('../action/flow');
const ConfigSet = require('../action/config_set')
const ConfigGet = require('../action/config_get');
const { echo } = require('../lib/helper');
const { addCommand, description } = require('commander');
const i18 = new I18();
// 系统配置项映射表
// key 表示所输入的命令 value表示需要执行的js文件
const configTypes = {
  set: ConfigSet,
  get: ConfigGet
}
program
  .version(require('../package.json').version, '-v, --version', 'output the current version')
  .usage(`[${i18.__('command')}] [${i18.__('parameter')}]`)

program
  .command('flow')
  .description('流程')
  .option(`-n, --config <${i18.__('filepath')}>, ${i18.__('action.specify-config')}`)
  .action(({ config }) => {
      const flow = new Flow(config)
      flow.start()
  })

program
  .command('init')
  .description(i18.__('action.init-config'))
  .action(() => {
      const init = new Init()
      init.start()
  })

// 操作系统配置
program
  .command('config [option]')
  .option("-set", '更改系统配置')
  .option("-get", '获取系统配置')
  .action((name, option) => {
    if(!option.args.length) {
      program.help()
    }
    const valid = Object.keys(configTypes).find(key => {
       return key === name
    })
    if(valid) {
      this.config = new configTypes[name]()
      this.config.start()
    } else {
      echo('输入的命令不合法, 请通过 config --help来查看可用命令', 'error')
    }  
})

program.parse(process.argv)

