const request = require('request');
const cheerio = require('cheerio');
var mongojs = require('../configDB/db');
db = mongojs.connect;




exports.getWebCrawler = function(url1,domain1,index_id,timetostamp){

  try {

    const domain = domain1;
    const urlland = url1;
    var jar = request.jar();

  request({
    method: 'GET',
    url: urlland,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':'*',
        'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
    },
    jar:jar
    },async function(err, response, body) {
      if (!err && response.statusCode === 200) {
      let $ = cheerio.load(body);
      var passed = [];
      let title = $('title').text().trim();
      let h1 = $('h1').text().trim();
      let p = $('p').text().trim();
        
        
      db.collection("voice_web").find({"voice_message" : h1}).toArray(function(err, resultcheck) {
        if(resultcheck.length > 0){
                        
          db.collection("voice_web").update(
            {
              "_id" : resultcheck._id,
            },
            {
              $set:{
                "_id" : resultcheck._id,
                "voice_refid" : "",
                "index_id" : index_id,
                "voice_message" : h1,
                "voice_body" : p,
                "domain" : domain,
                "url" : urlland,          
                "postdate" : "",
                "collectdata" : new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                "source_type" : 'website'
              }
            },
            function (err, rs) {
              if (err) {
                console.error(err);
              }
            });

        }else{


          db.collection("zprimarykey_voice_web").findAndModify(
            {
              query: { _id: "indexid" },
              update: { $inc: { seq: 1 } },
              new: true
            },
            function (err, result) {
             var id = result.seq;
              var content = [];
               content.push({
                _id : id,
                voice_refid : "",
                index_id : index_id,
                voice_title : title,
                voice_message : h1,
                voice_body : p,
                domain : domain,
                url : urlland,          
                postdate : "",
                collectdata : new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                source_type : 'website'
              });
                        
              
              db.collection("voice_web").insert(content, function(err, res) {
                if (err){
                        console.log('insert voice_web :'+err);
                }
                
                });
        
    
            });//ปิด run number mongo
          
            
        }
    });

    db.collection("index_repo_campaign").update({"_id":index_id},{
      $set:{"readindex" : 'Y',"readnexttime" : timetostamp,"readindexdate" : new Date()}});// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง
    
  // callback(null,"success")

      }else{
        db.collection("index_repo_campaign").update({"_id":index_id},{
          $set:{"readindex" : 'F',"readnexttime" : timetostamp,"readindexdate" : new Date()}});// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง
        
      }

    });//ปิด request


      
      } catch (err) {
        //console.error(err)
        db.collection("index_repo_campaign").update({"_id":index_id},{
          $set:{"readindex" : 'F',"readnexttime" : timetostamp,"readindexdate" : new Date()}});// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง
      }
    
}//ปิด export function