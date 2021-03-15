#! /usr/bin/env node
const program = require('commander')
const Init = require('../action/init')
const I18 = require('../lib/i18');
const Flow = require('../action/flow');
const ConfigSet = require('../action/config_set')
const ConfigGet = require('../action/config_get')
const i18 = new I18();

program
  .version(require('../package.json').version, '-v, --version', i18.__('action.version'))
  .usage(`[${i18.__('command')}] [${i18.__('parameter')}]`)

program
  .command('flow')
  .description(i18.__('action.flow'))
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
program
  .command('set')
  .description(i18.__('action.set-config'))
  .action(() => {
      const configset = new ConfigSet()
      configset.start()
})
program
  .command('get')
  .description(i18.__('action.get-config'))
  .action(() => {
      const configset = new ConfigGet()
      configset.start()
})

program.parse(process.argv)
