'use strict';

exports.__esModule = true;



exports.default = class extends think._caches.controller {
    testAction () {
        echo(this.http)
        this.http.body = 'hahahahahahahahahhha';
    }
}; /**
                                                    *
                                                    * @author     richen
                                                    * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
                                                    * @license    MIT
                                                    * @version    12/5/27
                                                    */