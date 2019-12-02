"use strict";


const ExpressService = require('./lib/ExpressService.class');
 
const app = new ExpressService(8081) 
const Scheduling = require('./main/scheduling.class')
const Facebook = require('./voice/facebookpost.class');


app.get('/scheduling-voice', function (req, res) {

    let getmodel = req.query.model;
    var getlimitData = req.query.limitD;
    var getloopB = req.query.loopB;

    if (!getlimitData) {
        getlimitData = 50

    } 

    if (getmodel) { 
        new Scheduling().mainManage(getmodel, getlimitData, getloopB,function (err, result) {
            res.send(result);
            res.end();
        }) 
    } else {
        res.json("No Data", 400)
    }
});

app.get('/fbno-p', function (req, res) {
    var fbPostUrl = [];

    var a = ['https://www.facebook.com/1823212057808053_1397293317066598', 123123123, 15234234234]
    // var b = ['https://www.facebook.com/talkSPORT/posts/10157181711569101', 12312314423, 152342342323234]


        fbPostUrl.push(a)
        // fbPostUrl.push(b)

    new Facebook().getSinglePostOnlyNotispage(fbPostUrl, 0, true);
});


app.get('/scheduling-search', function (req, res) {

    let getmodel = req.query.model;
    new Scheduling().searchKeyword(getmodel,function (err, result) {
        res.send(result);
        res.end();
    })

});
