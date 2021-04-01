#! /usr/bin/env node
const program = require('commander')
const Init = require('../action/init')
const I18 = require('../lib/i18');
const Flow = require('../action/flow');
const Config = require('../action/config')
const i18 = new I18();
program
  .version(require('../package.json').version, '-v, --version', 'output the current version')
  .usage(`[${i18.__('command')}] [${i18.__('parameter')}]`)

program
  .command('flow')
  .description(i18.__("action.flow"))
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
  .option("-set",i18.__("action.change-config"))
  .option("-ls",i18.__("action.get-config"))
  .action((name) => {
    const config = new Config(name)
    config.start() 
})

program.parse(process.argv)

