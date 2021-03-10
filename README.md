# About

dogit is a tool to helper us make a git tag.

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
                "mode": "regex",
                "match": "",
                "replace": ""
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
- `option` plugin options


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
- `replace` the replaced data.

if type is `cmd`, you shou fill:

- `value` command script.

the command can include follow two parameters which will be replaced by real data

- `__TAG__`  tagName `xjzmy-test-v1.0.0`
- `__VERSION__`  version number `1.0.0`,
- `__ENV__`  env `prod`


#### AutoCommit

> auto commit the unstash files that before action make.

option contains

- `message` the commit message

# add tag

when you want to add a tag(publish version) you should run

```bash
dogit tag
```
this will lead you complete the info that you want to do this pierod.
