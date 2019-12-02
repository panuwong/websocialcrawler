const request = require('request');
const cheerio = require('cheerio');
var convert = require('../lib/convert');
const voiceupdate = require('../lib/voiceupdate');
var mongojs = require('../configDB/db');
db = mongojs.connect;


 

exports.getWebCrawler = async function (data, rowx) {

  (async () => {

    voiceupdate.d("sv start web")
    voiceupdate.d("total : " + data.length);
    // setTimeout(() => {
    getVoiceWeb(data, rowx)
    // }, 1000);
  })();



  function getVoiceWeb(data, rowx, start_point = new Date(), success_pro = 0, err_pro = 0, end_point = new Date()) {
    var start_process = start_point
    var success_process = success_pro;
    var err_process = err_pro;
    var end_point_process = end_point

    if ((data[rowx])) {

      let row = data[rowx];
      let url1 = row[0];
      var domain1 = row[1]
      var index_id = row[2]
      var timetostamp = row[3]

      var indexX = rowx + 1;


      try {
        // var agentR = voiceupdate.getAgent(); 

        // voiceupdate.proxyData("bing", function (proxyData) {
        // for (let index = rowx; index < data.length; index++) {


        var domain = ""
        if ((domain1) && typeof domain1 !== 'undefined' && domain1 !== null) {
          domain = domain1;
        } else {
          domain = extractHostname(url1)
        }

        const urlland = url1;
        var jar = request.jar();

        // let host = proxyData[0];
        // let user = proxyData[1];
        // let password = proxyData[2];
        // var proxyUrl = "http://" + user + ":" + password + "@" + host;
        // var proxiedRequest = request.defaults({ 'proxy': proxyUrl });
        // setTimeout(() => {
        request({
          method: 'GET',
          url: urlland,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
          },
          jar: jar
        }, function (err, response, body) {
          try {
            if (!(err) && response.statusCode == 200) {
              let $ = cheerio.load(body);
              let metakeyword = $('meta[name=keywords]').attr('content');
              if (Array.isArray(metakeyword)) {
                metakeyword = metakeyword[0]
              }

              metakeyword = (metakeyword != null) ? metakeyword : ""; 
              let title = $('title').text().trim();
              if (title === null || title === "" || typeof title === "undefined") {
                title = urlland
              }
              let bodyall = $('body').text().trim();
              if (bodyall !== null && bodyall !== "" && typeof bodyall !== "undefined") {
                bodyall = bodyall.replace(/\n/g, "");
                bodyall = bodyall.replace(/\t/g, "");
                bodyall = bodyall.substr(155, 5000)
              } else {
                bodyall = ""
              }
              let h1 = $('h1').text().trim();
              if (h1 === null || h1 === "" || typeof h1 === "undefined") {
                h1 = urlland
              }

              var campaign_id = [];
              var campaign_set = [];
              var keyword = [];
              db.collection("index_repo_campaign").find({ "url": url1 }).toArray(function (err, result) {
                //
                for (const rs of result) {
                  campaign_id.push(rs.campaign_id);
                  keyword.push(rs.search_keyword[0]); 
                  // campaign_set = rs.campaign_set;
                  
                  db.collection("campaign_setkeyword").find({ 'campaign_id': rs.campaign_id, _id: rs.campaign_set[0] }).toArray(function (err, result1) {
                    for (const rs1 of result1) {
                      var arrPush = rs1.campaign_id + "_" + rs1._id + "_" + rs1.typeof_keyword;

                      campaign_set.push(arrPush);
                    }


                    db.collection("voice_web").find({ "voice_message": title }).toArray(async function (err, resultcheck) {
                      if (resultcheck.length > 0) {
      
                        db.collection("voice_web").update(
                          {
                            "_id": resultcheck._id,
                          },
                          {
                            $set: {
                              "_id": resultcheck._id,
                              // "campaign_id": campaign_id,
                              // "campaign_set":  campaign_set,
                              // "keyword":  keyword,
                              "voice_refid": "",
                              "index_id": index_id,
                              "voice_keyword": metakeyword,
                              "voice_message": title,
                              "voice_body": bodyall,
                              "voice_h1": h1,
                              "domain": domain,
                              "url": urlland,
                              "collectdata": convert.dateFormat(),
                              "source_type": 'website'
                            }
                          },
                          function (err, rs) {
                            if (err) {
                              console.error(err);
                            }
                          });
      
                      } else {
      
      
                        db.collection("zprimarykey_voice_web").findAndModify(
                          {
                            query: { _id: "indexid" },
                            update: { $inc: { seq: 1 } },
                            new: true
                          },
                          async function (err, result) {
                            var id = result.seq;
                            var content = [];
                            content.push({
                              _id: id,
                              campaign_id: campaign_id,
                              campaign_set:  campaign_set,
                              keyword:  keyword,
                              voice_refid: "",
                              index_id: index_id,
                              voice_keyword: metakeyword,
                              voice_message: title,
                              voice_body: bodyall,
                              voice_h1: h1,
                              domain: domain,
                              url: urlland,
                              postdate: convert.dateFormat(),
                              postymd: convert.dateFormat(convert.dateFormat(), "POSTYMD"),
                              collectdata: convert.dateFormat(),
                              source_type: 'website'
                            });
      
      
                            db.collection("voice_web").insert(content, function (err, res) {
                              if (err) {
                                console.log('insert voice_web :' + err);
                              }
      
                            });
      
      
                          });//ปิด run number mongo
      
      
                      }
                    });
      
                    // console.log('index_repo_campaign findAndModify '+indexX)
                    db.collection("index_repo_campaign").findAndModify(
                      {
                        query: { "_id": index_id },
                        update: { $set: { "readindex": 'Y', "readnexttime": timetostamp, "readindexdate": new Date() } },
                        new: true
                      },
                      function (err, result) {
                        if (err) {
      
                        } else {
      
                          // console.log('getVoiceWeb '+indexX)
                          // setTimeout(() => { 
                            var d = data.pop()
                            getVoiceWeb(d, 0, start_process, success_process, err_process, end_point_process)
                          // }, 500);
                          // console.dir(object);
                        }
                      });//ปิด run number mongo



                  });
                }
              });
 
            } else {

              // voiceupdate.d("error")
              voiceupdate.readIndexChangeR(index_id, "NS : Web ERR From Request Http  index_id: " + index_id, 200);
              err_process++;
              setTimeout(() => {
                var d = data.pop()
                getVoiceWeb(d, 0, start_process, success_process, err_process, end_point_process)
              }, 500);
            }

          } catch (err) {
            // voiceupdate.readIndexChangeR(index_id, "NS : Err in Evaluate  index_id: " + index_id, 200);
            throw err.message
          }


        });//ปิด request
        // }, 500);
        // }



        function extractHostname(url) {
          var hostname;
          //find & remove protocol (http, ftp, etc.) and get hostname

          if (url.indexOf("//") > -1) {
            hostname = url.split('/')[2];
          }
          else {
            hostname = url.split('/')[0];
          }

          //find & remove port number
          hostname = hostname.split(':')[0];
          //find & remove "?"
          hostname = hostname.split('?')[0];

          return hostname;
        }


        // });//ปิด proxy
      } catch (err) {
        // console.error(err)
        voiceupdate.readIndexChangeR(index_id, "MAIN CATCH NS : WEB ERR " + err.message + " index_id: " + index_id, 200);
        err_process++;
        setTimeout(() => {
          var d = data.pop()
          getVoiceWeb(d, 0, start_process, success_process, err_process, end_point_process)
        }, 500);
      }
    } else {
      voiceupdate.d("----- end loop ")
      end_point_process = new Date()
      voiceupdate.dSum(success_process, err_process, start_process, end_point_process, data.length);

      voiceupdate.d("----- end web close browser")
    }
  }

}//ปิด export function


exports.getWebCrawlerMiniSearch = async function (data, rowx) {

  (async () => {

    voiceupdate.d("sv start web")
    voiceupdate.d("total : " + data.length);
    // setTimeout(() => {
    getVoiceWeb(data, rowx)
    // }, 1000);
  })();



  function getVoiceWeb(data, rowx, start_point = new Date(), success_pro = 0, err_pro = 0, end_point = new Date()) {
    var start_process = start_point
    var success_process = success_pro;
    var err_process = err_pro;
    var end_point_process = end_point

    if ((data[rowx])) {

      let row = data[rowx];
      let url1 = row[0];
      var domain1 = row[1]
      var index_id = row[2]
      var timetostamp = row[3]

      var indexX = rowx + 1;


      try {
        // var agentR = voiceupdate.getAgent(); 

        // voiceupdate.proxyData("bing", function (proxyData) {
        // for (let index = rowx; index < data.length; index++) {


        var domain = ""
        if ((domain1) && typeof domain1 !== 'undefined' && domain1 !== null) {
          domain = domain1;
        } else {
          domain = extractHostname(url1)
        }

        const urlland = url1;
        var jar = request.jar();

        // let host = proxyData[0];
        // let user = proxyData[1];
        // let password = proxyData[2];
        // var proxyUrl = "http://" + user + ":" + password + "@" + host;
        // var proxiedRequest = request.defaults({ 'proxy': proxyUrl });
        // setTimeout(() => {
        request({
          method: 'GET',
          url: urlland,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
          },
          jar: jar
        }, function (err, response, body) {
          try {
            if (!(err) && response.statusCode == 200) {
              let $ = cheerio.load(body);
              let metakeyword = $('meta[name=keywords]').attr('content');
              if (Array.isArray(metakeyword)) {
                metakeyword = metakeyword[0]

              }
 
              metakeyword = (metakeyword != null) ? metakeyword : ""; 

 

              let title = $('title').text().trim();
              if (title === null || title === "" || typeof title === "undefined") {
                title = urlland
              }
              let bodyall = $('body').text().trim();
              if (bodyall !== null && bodyall !== "" && typeof bodyall !== "undefined") {
                bodyall = bodyall.replace(/\n/g, "");
                bodyall = bodyall.replace(/\t/g, "");
                bodyall = bodyall.substr(155, 5000)
              } else {
                bodyall = ""
              }
              let h1 = $('h1').text().trim();
              if (h1 === null || h1 === "" || typeof h1 === "undefined") {
                h1 = urlland
              }


              db.collection("voice_web_mini_search").find({ "voice_message": title }).toArray(async function (err, resultcheck) {
                if (resultcheck.length > 0) {

                  db.collection("voice_web_mini_search").update(
                    {
                      "_id": resultcheck._id,
                    },
                    {
                      $set: {
                        "_id": resultcheck._id,
                        "voice_refid": "",
                        "index_id": index_id,
                        "voice_keyword": metakeyword,
                        "voice_message": title,
                        "voice_body": bodyall,
                        "voice_h1": h1,
                        "domain": domain,
                        "url": urlland,
                        "collectdata": convert.dateFormat(),
                        "source_type": 'website'
                      }
                    },
                    function (err, rs) {
                      if (err) {
                        console.error(err);
                      }
                    });

                } else {


                  db.collection("zprimarykey_voice_web_mini_search").findAndModify(
                    {
                      query: { _id: "indexid" },
                      update: { $inc: { seq: 1 } },
                      new: true
                    },
                    async function (err, result) {
                      var id = result.seq;
                      var content = [];
                      content.push({
                        _id: id,
                        voice_refid: "",
                        index_id: index_id,
                        voice_keyword: metakeyword,
                        voice_message: title,
                        voice_body: bodyall,
                        voice_h1: h1,
                        domain: domain,
                        url: urlland,
                        postdate: convert.dateFormat(),
                        postymd: convert.dateFormat(convert.dateFormat(), "POSTYMD"),
                        collectdata: convert.dateFormat(),
                        source_type: 'website'
                      });


                      db.collection("voice_web_mini_search").insert(content, function (err, res) {
                        if (err) {
                          console.log('insert voice_web_mini_search :' + err);
                        }

                      });


                    });//ปิด run number mongo


                }
              });

              // console.log('index_repo_campaign findAndModify '+indexX)
              db.collection("index_mini_search").findAndModify(
                {
                  query: { "_id": index_id },
                  update: { $set: { "readindex": 'Y', "readnexttime": timetostamp, "readindexdate": new Date() } },
                  new: true
                },
                function (err, result) {
                  if (err) {

                  } else {

                    // console.log('getVoiceWeb '+indexX)
                    // setTimeout(() => { 
                    success_process++;
                    getVoiceWeb(data, indexX, start_process, success_process, err_process, end_point_process)
                    // }, 500);
                    // console.dir(object);
                  }
                });//ปิด run number mongo





              //  db.collection("index_repo_campaign").update({ "_id": index_id }, {
              //   $set: {}
              // });// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง

              // callback(null,"success") 
            } else {

              // voiceupdate.d("error")
              voiceupdate.readIndexChangeR(index_id, "NS : Web ERR From Request Http  index_id: " + index_id, 200, "index_mini_search");
              err_process++;
              setTimeout(() => {

                getVoiceWeb(data, indexX, start_process, success_process, err_process, end_point_process)
              }, 500);
            }

          } catch (err) {
            // voiceupdate.readIndexChangeR(index_id, "NS : Err in Evaluate  index_id: " + index_id, 200);
            throw err.message
          }


        });//ปิด request
        // }, 500);
        // }



        function extractHostname(url) {
          var hostname;
          //find & remove protocol (http, ftp, etc.) and get hostname

          if (url.indexOf("//") > -1) {
            hostname = url.split('/')[2];
          }
          else {
            hostname = url.split('/')[0];
          }

          //find & remove port number
          hostname = hostname.split(':')[0];
          //find & remove "?"
          hostname = hostname.split('?')[0];

          return hostname;
        }


        // });//ปิด proxy
      } catch (err) {
        // console.error(err)
        voiceupdate.readIndexChangeR(index_id, "MAIN CATCH NS : WEB ERR " + err.message + " index_id: " + index_id, 200, "index_mini_search");
        err_process++;
        setTimeout(() => {

          getVoiceWeb(data, indexX, start_process, success_process, err_process, end_point_process)
        }, 500);
      }
    } else {
      voiceupdate.d("----- end loop ")
      end_point_process = new Date()
      voiceupdate.dSum(success_process, err_process, start_process, end_point_process, data.length);

      voiceupdate.d("----- end web close browser")
    }
  }

}//ปิด export function