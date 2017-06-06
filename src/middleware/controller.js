/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/6/1
 */

module.exports = function (options) {
    return function (ctx, next) {
        if (!ctx.controller) {
            ctx.throw(404, 'Controller not found.');
        }
        let controller, cls;
        try {
            //multi mod
            if (ctx.group) {
                cls = think._caches.controllers[`${ctx.group}/${ctx.controller}`];
            } else {
                cls = think._caches.controllers[ctx.controller];
            }
            controller = new cls(ctx);
        } catch (e) {
            ctx.throw(404, `Controller ${ctx.group}/${ctx.controller} not found.`);
        }
        //exec action
        const suffix = options.action_suffix || 'Action';
        const empty = options.empty_action || '__empty';
        let act = `${ctx.action}${suffix}`;
        if (!controller[act] && controller[empty]) {
            act = empty;
        }
        if (!controller[act]) {
            ctx.throw(404, `Action ${ctx.action} not found.`);
        }

        const commBefore = options.common_before || '__before';
        const selfBefore = `${options.self_before || '_before_'}${ctx.action}`;

        let promises = Promise.resolve();
        //common befroe
        if (controller[commBefore]) {
            promises = promises.then(() => {
                return controller[commBefore]();
            });
        }
        //self before
        if (controller[selfBefore]) {
            promises = promises.then(() => {
                return controller[selfBefore]();
            });
        }
        //action
        return promises.then(() => {
            return controller[act]();
        });
    };
};