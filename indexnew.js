"use strict";


const ExpressService = require('./lib/ExpressService.class');

const app = new ExpressService(8084) 
const Scheduling = require('./main/scheduling.class')

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


app.get('/scheduling-search', function (req, res) {

    let getmodel = req.query.model;
    new Scheduling().searchKeyword(getmodel,function (err, result) {
        res.send(result);
        res.end();
    })

});
