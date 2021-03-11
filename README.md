# About

dogit is a tool to helpe us make a git tag with hook.

# install

```bash
npm install -g dogit
```

# init

if you fist use dogit, you should run follow commad to get a cofiguation file

```bash
dogit init
```
this file is like 

```json
{
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
    },
    "beforeTag": [],
    "afterTag": []
}
```
### envs

this option is a key-value map to show the envs for your project.

- `prefix` is the tag prefix. can format at `<project name>-<env>-v`.

### hooks

`beforeTag` and `afterTag` is two hooks actions that run before and after add tag. for example

```json
{
  "beforeTag": [
      {
            "type": "plugin",
            "value": "ReplaceVersionFile",
            "option": {
                "path": "./build/version.js",
                "replace": "xx"
            }
        },
        {
            "type": "cmd",
            "value": "npm run changelog"
        },
        {
            "type": "plugin",
            "value": "AutoCommit",
            "option": {
                "message": "docs: generate changelog and change version file"
            }
        }
  ]
}
```

`type` indicate what the hook is, now support:

- `plugin` gogit own plugin
- `cmd` your custom shell command

if type is `plugin`, you shou fill:

- `value` plugin name
- `option` plugin options, can be a JSON obejct or Array, Array is a short form

```js
{
    "type": "plugin",
    "value": "ReplaceVersionFile",
    "option": [
        {
            "path": "./build/version.js",
            "replace": "xx"
        },
        {
            "path": "./public/app.config.js",
            "replace": "yy"
        }
    ]
}
```
is equal 

```js
[
    {
        "type": "plugin",
        "value": "ReplaceVersionFile",
        "option": {
            "path": "./build/version.js",
            "replace": "xx"
        }
    },
    {
        "type": "plugin",
        "value": "ReplaceVersionFile",
        "option": {
            "path": "./public/app.config.js",
            "replace": "yy"
        }
    }
]
```
### plugin

we support two plugins now:

#### ReplaceVersionFile

> replace(or overwrite) the version or tag name in your given files.

option contains

- `path` dist file path.
- `mode` how we replace the file, include.
  - `regex` use regex to find the place that should be replace.
  - `overwrite` directly replace whole file.
- `match` needed if mode is regex, tell dogit where should replace.
- `replace` the replaced data or funciton.

if `repalce` is a string, this will directly replace whole file with this data.

if `repalce` is a function, we will use the returned data as repalced data. this function can be sync or async

```js
replace(content, tag, env, version) {
    //...
}
```
- `content` is the origin content from the file should be replaced.
- `tag` is the tag name `xjzmy-test-v1.0.0`
- `version` is the version `1.0.0`
- `env` is env `test`

for example we want to replace `./build/version.js` and `./public/app.config.js` with different replace format:


```js
{
    "type": "plugin",
    "value": "ReplaceVersionFile",
    "option": [
        {
            "path": "./build/version.js",
            "replace": "module.exports = { version: '__TAG__' }"
        },
        {
            "path": "./public/app.config.js",
            "replace": (content, tag) => {
                return content.replace(/(version:\s+)'[\w\.\d-]+'/g, `$1'${tag}'`);
            }
        }
    ]
}
```


#### AutoCommit

> auto commit the unstash files that before action make.

option contains

- `message` the commit message


if type is `cmd`, you shou fill:

- `value` command script.

the command can include follow parameters which will be replaced by real data

- `__TAG__`  tagName `xjzmy-test-v1.0.0`
- `__VERSION__`  version number `1.0.0`,
- `__ENV__`  env `prod`

# add tag

when you want to add a tag(publish version) you should run

```bash
dogit tag
```
this will lead you complete the info that you want to do this pierod.
