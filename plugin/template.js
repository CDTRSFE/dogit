module.exports = class AddTag {
    constructor({ option, before, after }, handler, params) {
        // option 本身插件的配置
        // before after 为插件配置的两个hook
        // params 为上级插件传入给它的参数
        // handler 处理 before after 子流程用的处理方法
        this.option = option;
    }

    async start() {
        return true;
    }
}