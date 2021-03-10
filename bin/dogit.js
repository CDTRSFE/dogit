#! /usr/bin/env node
const program = require('commander')
const Tag = require('../action/tag')
const Init = require('../action/init')

program
  .version(require('../package.json').version, '-v, --version', 'output the current version')
  .usage('[命令] [参数]')

program
  .command('tag')
  .description('打Tag')
  .option('-n, --config <文件路径>', '手动指定配置路径')
  .action(({ config }) => {
      const tag = new Tag(config)
      tag.start()
  })

program
  .command('init')
  .description('初始化生成配置文件')
  .action(() => {
      const init = new Init()
      init.start()
  })

program.parse(process.argv)
