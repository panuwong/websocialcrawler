"use strict";


const express = require('express');
const event = require('events');
const emitter = event.EventEmitter();

// const app = express();

class ExpressService {

    constructor(port) {

        console.log("test port" + port);


        process.on('unhandledRejection', (reason, p) => {
            console.log('SV / unhandledRejection ::', reason);
        });

        process.on('uncaughtException', err => {
            console.log('uncaughtException ::', err)
        });


        const app = express();
        var port = process.env.PORT || port
        // emitter.setMaxListeners(0)
        app.listen(port, function () {
            // process.setMaxListeners(Infinity);
            console.log('listening on port ' + port);
        });

        return app
    }




}


module.exports = ExpressService;