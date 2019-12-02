var mongojs = require('../configDB/db');
var db = mongojs.connect; 
 

var web = require('../minisearch') 
// var dateFormat = require('dateformat');
var convert = require('../lib/convert');



 exports.mainManage = function(callback) {


        try {
            var date_now =  Date.now();//1542084181388
            nextdd = date_now.toString();
            nextdd = nextdd.substr(0, 10);
            var date_now_t = parseInt(nextdd);

            db.collection("master_index_mini_search").find({'status':'Y','readindex':'Y', 'readnexttime': { $lte: date_now_t } }).limit(1).toArray(function(err, result) {
                requestCrawler(result,0);
                if (!result) {
                    throw "NO INDEX RETURN FROM index_repo_campaign"
                }
            });
        } catch (err) {
            console.error("QUERY INDEX REPO CAMPAIGN : "+err.message);
 
        }


    async function updateStatus2(data) { 
            db.collection('master_index_mini_search').update({ "_id": data._id }, {
                $set: { "readindex": 'R' }
            });// หยิบแล้ว stamp ทันที 
       
    }

  
        function requestCrawler(result,rowx) {

        try { 

            var collect_minute = 180;
            collect_minute = (collect_minute != '') ? parseInt(collect_minute) : 60;

            var timetostamp = convert.getNextTimetostampDate(collect_minute, 'm')

             
            for (const row of result) {

                // db.collection('master_index_mini_search').update({ "_id": row._id }, {
                //     $set: { "sratus": 'R'}
                // });// หยิบแล้ว stamp ทันที

                updateStatus2(row)
                
                var data = [];
                data.push(row.url);
                web.getUrlSpider(data,0 ,row.domain,timetostamp)
            }

            var d = "finish scheduling" 
            

            callback(null, d); 

        }
        catch(err) {
            console.error("ARRAY INDEX BEFORE CRAW : "+err.message);
        }
 


        }

        
    



  }


 
