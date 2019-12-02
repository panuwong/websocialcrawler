

var os = require('os');

// var osCPU = require('os-utils');



exports.checkPerformance = function () {

    // console.log(os.cpus());
    var ramTotal = os.totalmem();
    var ramFree = os.freemem(); 

    // osCPU.cpuUsage(function(v){
    //     console.log( 'CPU Usage (%): ' + v );
    // });

    var ramPre  = ramTotal*0.8
    var ramUser = ramTotal-ramFree

    var x  = (ramUser/ramTotal)*100
    // console.log(ramPre);
    // console.log(ramUser);
    
    console.log(x);
    if(ramUser>=ramPre){
       
        return false
    } else{ 
       return x
    }



}

    