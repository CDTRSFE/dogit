const ReplaceFile = require('./ReplaceFile');
const GitCommit = require('./GitCommit');
const AddTag = require('./AddTag');
const GitPush = require('./GitPush')
module.exports = {
    async register(task, handler, params) {
        const PluginClass = {
            ReplaceFile,
            GitCommit,
            AddTag,
            GitPush
        }[task.plugin];
    
        if (!PluginClass) return null;

        // 处理参数
        task.hook = task.hook || {};
    
        return new PluginClass(task, handler, params);
    }
}
