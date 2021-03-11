#! /usr/bin/env node
const program = require('commander')
const Tag = require('../action/tag')
const Init = require('../action/init')
const I18 = require('../lib/i18');
const Flow = require('../action/flow');

const i18 = new I18();

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

program.parse(process.argv)
