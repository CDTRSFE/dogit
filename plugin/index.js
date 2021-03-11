const ReplaceFile = require('./ReplaceFile');
const GitCommit = require('./GitCommit');
const AddTag = require('./AddTag');

module.exports = {
    async register (flow, handler, params) {
        const PluginClass = {
            ReplaceFile,
            GitCommit,
            AddTag
        }[flow.plugin];
    
        if (!PluginClass) return null;
    
        return new PluginClass(flow, handler, params);
    }
}