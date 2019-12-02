var express = require('express');
var app = express(); 
var web = require('./minisearch') 
// var instagram = require('./voice/instagram') 
var scheduling = require('./main/scheduling')
// var mongojs = require('./configDB/db');
// var db = mongojs.connect;
var request = require('request');



app.get('/geturlspider', function (req, res) {
    // getUrlSpider
    var getmodel= req.query.model;
    var data = [];
    data.push(getmodel);
    if (getmodel){
        web.getUrlSpider(data,0 ,function(err, result) {
            res.send(result); 
            res.end();
        })
    } else {
        res.json("No Data",400)
    }
});
 

app.get('/scheduling-search', function (req, res) {

    
        scheduling.mainManage(function(err, result) {
            res.send(result); 
            res.end();
        })
   
});
  
app.get('/igcommentinmediapup', function (req, res) {
    var data = new Array();

    var arr1 = [ 'https://www.instagram.com/p/BqRcuulBTPL/','1','15142352353' ];
    var arr2 = [ 'https://www.instagram.com/p/BraNKqxhle2/','2','15142352353'  ];
    var arr3 = [  'https://www.instagram.com/p/BrZVn04nX6o/','3','15142352353'  ];
    var arr4 = [  'https://www.instagram.com/p/BrRcxH2Htu7/','4','15142352353'  ];
    var arr5 = [  'https://www.instagram.com/p/BrSi9flnLSG/','5','15142352353'  ];
    var arr6 = [  'https://www.instagram.com/p/BrWg1oihFpU/','6','15142352353'  ];
    var arr7 = [  'https://www.instagram.com/p/BrMmJwAHuWo/','7','15142352353'  ];
    var arr8 = [  'https://www.instagram.com/p/BrK9D34hz7Q/','8','15142352353'  ];
    var arr9 = [  'https://www.instagram.com/p/BrJwwsyBDOr/','9','15142352353'  ];
    var arr10 = [  'https://www.instagram.com/p/BrIXRbRhZS6/','10','15142352353'  ];
    
    data.push(arr1);
    data.push(arr2);
    data.push(arr3);
    data.push(arr4);
    data.push(arr5);
    data.push(arr6);
    data.push(arr7);
    data.push(arr8);
    data.push(arr9);
    data.push(arr10);

    //for(var i = 0; i <2 ;i++){
     instagram.getCommentInMediaPup(data);
    //}
});
  

var port = process.env.PORT || 8888;
app.listen(port, function () {
  console.log('listening on port ' + port);
});
