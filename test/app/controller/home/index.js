

module.exports = class extends think.controller.base {
    indexAction() {
        return this.echo('hello world');
    }
};