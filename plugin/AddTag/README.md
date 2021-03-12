## 配置

- `envs` 当前项目支持的Tag环境。`prefix` 为Tag前缀 

    ```js
    {
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
        }
    }
    ```


## 支持hook

- `before`
- `after`

## 暴露参数

```js
{
    env: 'test',
    tagPrefix: 'xjzmy-test-v',
    version: '0.3.13',
    message: 'tag描述信息',
    tag: 'xjzmy-test-v0.3.13'
}
```