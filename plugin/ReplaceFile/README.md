## 配置

- `path` 要替换内容的目标文件

  ```js
    {
        "plugin": "ReplaceFile",
        "option": {
            "path": "./public/app.config.js"
        }
    }
    ```
    > 注意这里的路径是基于执行当前命令的路径计算的。

- `replace` 要替换成的数据
  - 字符串类型，可包含变量，比如

    ```js
    {
        "plugin": "ReplaceFile",
        "option": {
            replace: "module.exports = { version: '__$tag__' }"
        }
    }
    ```
  - 方法类型

    ```js
    {
        "plugin": "GitCommit",
        "option": {
            message: (content, params) => {
                return content.replace(/(version:\s+)'[\w\.\d-]+'/g, `$1'${params.tag}'`);
            }
        }
    }
    ```

    - `content` 表示从待替换文件读出的字符内容
    - `params` 表示上个流程传入的参数

## 支持hook

无

## 暴露参数

无