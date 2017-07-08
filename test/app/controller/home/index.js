

module.exports = class extends think.controller.base {
    indexAction() {
        return this.write('hello world');
    }
};