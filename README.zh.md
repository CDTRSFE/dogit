<p align="center">
    <img width="100" src="./logo.svg">
</p>

<h1 align="center">dogit</h1>

<p align="center">一个用来实现开发和发布流程的工具，可自由配置命令和插件。</p>

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
    <a href="https://github.com/CDTRSFE/dogit/blob/master/LICENSE">
        <img src="https://img.shields.io/npm/l/dogit.svg" alt="License">
    </a>
</p>

# 场景

通常我们会以Tag来部署项目，而在打Tag之前我们需要做一些事，比如自动生成changelog、替换版本号（前端项目可在部署后打印到控制台）

**`我们需要前置任务生成的changelog是在打Tag之前完成并提交的，这样每个Tag指向的代码才能包含正确的changelog文件`**


所以我们不得不执行一系列命令

```
npm run changelog
node version.js --verion "xjzmy-test-v1.0.0"
git commit -m '生成changelog和修改版本号'
git tag -a 'xjzmy-test-v1.0.0' -m 'tag信息'
```

如此很繁琐且容易出错，如果可以通过配置的方式自动完成打Tag之前的所有操作那岂不是很方便吗？dogit 就是做这个事的。

> 所以本质上我们需要的是一个流程控制，但注意这里并非简单地从上到下执行，重点在于我们需要提前拿到Tag去执行之前的操作，因此dogit采用了hook的形式，可传递参数到子流程中

因此使用 dogit 之后就变成了

```
- 开始执行打Tag任务
- 交互式接收用户输入的Tag号等信息
- 调用 before hook 并传入Tag号等参数到替换版本号的插件中
- 调用 before hook 并传入Tag号等参数到自动生成changelog的插件中
- git commit 上述被修改的文件
- 正式打Tag
- 完成任务
```

# 安装

```bash
npm install -g dogit
```

# 初始化

如果是初次在某个项目中使用 dogit，请运行下面的命令进行初始化

```bash
dogit init
```
然后你就得到了一个配置文件 `dogit.config.js` 大致长这个样子


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


# 流程
接下来可以开始执行自己的流程

```bash
dogit flow
```

该命令会读取上面的配置文件开始执行里面的任务。从配置文件可以看到，`flow` 就代表了我们需要执行的任务流，包含两种类型的flow

- shell脚本
- 插件plugin

> 插件流程可以包含自己的 hook 子流程，所以最终会呈树状结构。


## shell脚本

相信大家都不陌生，这就是一段能在终端中执行的脚本，格式为

```js
{
  "command": "命令"
}
```

## 插件

> 插件本质上就是一段**内置**的脚本，相比shell有着如下特点

- 可传入配置
- 可执行自己的hook
- 可接收上级flow的参数
- 可暴露参数给下级flow


格式也和shell不一样

```js
{
  "plugin": "AddTag", // 插件名 必填
  "option": {}, // 插件参数 可选
  "hook": {}, // 插件支持的hook（子flow） 可选
  "when": params => {} // 执行该插件的前提条件 可选
}
```

目前支持的内置插件有

- [AddTag](./plugin/AddTag)  打Git Tag
- [ReplaceFile](./plugin/ReplaceFile) 替换文件内容（比如将新打的Tag版本号写入到某些文件中）
- [GitCommit](./plugin/GitCommit) Git Commit 提交


> 具体某个插件支持的hook和option请移步到插件目录中查看文档


`when` 参数表示当前flow在满足哪些条件下才执行

```js
{
    "command": "npm run changelog:__$env__",
    "when": params => {
        return params.env !== 'dev'
    }
}
```

上面就表示只要在非dev的Tag下才执行生成changelog的任务。


# i18n

可通过下面的交互式命令切换工具本身的语言

```bash
dogit set
```
