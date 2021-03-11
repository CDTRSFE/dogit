#! /usr/bin/env node
const program = require('commander')
const Tag = require('../action/tag')
const Init = require('../action/init')
const I18 = require('../lib/i18');

const i18 = new I18();

program
  .version(require('../package.json').version, '-v, --version', 'output the current version')
  .usage(`[${i18.__('command')}] [${i18.__('parameter')}]`)

program
  .command('tag')
  .description(i18.__('action.add-tag'))
  .option(`-n, --config <${i18.__('filepath')}>, ${i18.__('action.specify-config')}`)
  .action(({ config }) => {
      const tag = new Tag(config)
      tag.start()
  })

program
  .command('init')
  .description(i18.__('action.init-config'))
  .action(() => {
      const init = new Init()
      init.start()
  })

program.parse(process.argv)
