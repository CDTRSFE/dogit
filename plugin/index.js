const ReplaceVersionFile = require('./ReplaceVersionFile');
const AutoCommit = require('./AutoCommit');

module.exports = async (name, option, tag, version, env) => {
    const PluginClass = {
        ReplaceVersionFile,
        AutoCommit
    }[name];

    if (!PluginClass) return null;

    const pluginstance = new PluginClass(option, tag, version, env);
    return await pluginstance.start();
}