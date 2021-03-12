
## 配置

- `message` 提交的信息
  - 字符串类型，可包含变量，比如

    ```js
    {
        "plugin": "GitCommit",
        "option": {
            message: "__$env__环境生成changelog并替换版本号"
        }
    }
    ```
  - 方法类型，接收上个流程传入的参数

    ```js
    {
        "plugin": "GitCommit",
        "option": {
            message: params => {
              return `${params.env}环境生成changelog并替换版本号`
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
    message: '提交信息'
}
```
