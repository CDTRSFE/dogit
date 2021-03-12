<h1 align="center">dogit</h1>

<p align="center">A tool used to implement the development and release process, with freely configurable commands and plugins.</p>

<p align="center">
    <a href="https://www.npmjs.com/package/dogit">
        <img src="https://img.shields.io/npm/v/dogit.svg" />
    </a>
    <a href="https://www.npmjs.com/package/dogit">
        <img src="https://img.shields.io/npm/dt/dogit.svg" >
    </a>
    <a href="https://www.npmjs.com/package/dogit">
        <img src="https://img.shields.io/npm/dm/dogit.svg" alt="Downloads">
    </a>
    <a href="https://github.com/CDTRSFE/dogit/blob/master/LICENSE.md">
        <img src="https://img.shields.io/npm/l/dogit.svg" alt="License">
    </a>
</p>


#   Install

```bash
npm install -g dogit
```

# Init

If you are using DOGIT for the first time in a project, run the following command to initialize.

```bash
dogit init
```
Then you get a configuration file called`dogit.config.js`. It looks something like this:

```js
module.exports = {
    "flow": {
        "plugin": "AddTag",
        "option": {
            "envs" : {
                "dev": {
                    "prefix": "xjzmy-dev-v"
                },
                "test": {
                    "prefix": "xjzmy-test-v"
                },
                "prod": {
                    "prefix": "xjzmy-prod-v"
                }
            }
        },
        "hook": {
            "before": [
                {
                    "plugin": "ReplaceFile",
                    "option": {
                    "path": "./build/version.js",
                    "replace": "module.exports = { version: '__$tag__' }"
                    }
                }
            ],
            "after": [
                {
                "command": "npm run changelog:__$env__"
                }
            ]
        }
    }
}
```


# Process
Then you can  begin to execute your own process with:
```bash
dogit flow
```
This command will read the configuration file  and starts the task. As you can see from the configuration file, `flow` represents the tasks what we need to execute, and contains two types of flows

- Shell scripts
- Plugin

> Plugin processes can contain their own hook subprocesses, so they end up in a tree structure.

## Shell scripts

I believe everyone is familiar with shell scripts, like this:
```js
{
  "command": "命令"
}
```

## Plugin

> A plugin is essentially a built-in script that has the following features over a shell
- Afferent configuration
- Can execute own hook
- Accepts the parameters of the upper flow
- Parameters can be exposed to the subordinate flow


And in a different format than the shell

```js
{
  "plugin": "AddTag", // 插件名 必填
  "option": {}, // 插件参数 可选
  "hook": {}, // 插件支持的hook（子flow） 可选
  "when": params => {} // 执行该插件的前提条件 可选
}
```
The currently supported built-in plugins are

- [AddTag](./plugin/AddTag)  Git Tag
- [ReplaceFile](./plugin/ReplaceFile) Replace file contents (such as writing a new Tag version number to some files)
- [GitCommit](./plugin/GitCommit) Git Commit 


> For specific hooks and options supported by the plugin, step into the plugin directory to view the documentation

`when` parameter indicates the conditions under which the current flow executes

```js
{
    "command": "npm run changelog:__$env__",
    "when": params => {
        return params.env !== 'dev'
    }
}
```

This means that the Changelog generation task should only be performed without the tag in dev .

# 国际化


The language of the tool itself can be switched with the following interactive command

```bash
dogit set
```
