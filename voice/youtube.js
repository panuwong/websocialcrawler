const request = require('request');
const mongojs = require('../configDB/db');
const db = mongojs.connect;
const convert = require('../lib/convert');
const voiceupdate = require('../lib/voiceupdate');


// getCommentThread by videoid
exports.getCommentThread = async function (data, rows) {
  try {
    var idposttocomment = 786

    var start_process = new Date()
    var success_process = 0;
    var err_process = 0;
    var end_point_process = new Date()

    voiceupdate.d("sv start youtube")
    voiceupdate.d("total : " + data.length);
   
    try {
      const rowxx = rows;
      const result =  await voiceupdate.updateStatus(data, rows)
      if (result) {
        run(data, rows)
        runcom(data, rowxx)
      } else {
       await voiceupdate.d("----- skip " + (rows + 1) + " readrindex R")
       rows++;
       run(data, rows)
       runcom(data, rowxx)
      }
      
     } catch (err) {
       console.error("STAMP R AND RUN:" + err);
       throw "STAMP R AND RUN" + err;
     }
  } catch (err) {
    console.error("MAIN YB : " + err);
  }


  async function run(data, rows) {
    var index = rows;

    if (data[index]) {
      var row = data[index];


      var fullurl = row[0]
      const index_id = row[1]
      var videoid = row[2]
      var timetostamp = row[3]

      //post

      try {
        await voiceupdate.d("----- No" + (index + 1) + " : get start url :" + fullurl)
        await voiceupdate.d("      START REQUEST MAIN POST " + fullurl)
        await voiceupdate.d("      PROGRESSING");

        var URL = "https://www.googleapis.com/youtube/v3/videos?id=" + videoid + "&maxResults=1&part=snippet,contentDetails,statistics&key=AIzaSyAUg-HrJST7PlCjnS0Na9ZzJMouvfMF4F4"
        var jar = request.jar();

        await request({
          method: 'GET',
          url: URL,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
          },
          jar: jar
        }, async function (err, response, body) {
          // จัดอาเรย์ลงมองโก

          try {

            if (typeof body !== "undefined") {
              var data = JSON.parse(body)
              var mains = data.items;
            }




            //SELECT CAMPAIGN
            await db.collection("index_repo_campaign").find({ 'url': fullurl }).toArray(async function (err, result) {
              if (err) {
                console.error("select cam :" + err);
              }
              var campaign_id = [];
              var campaign_set = result[0].campaign_set
              var keyword;
              campaign_id.push(result[0].campaign_id)
              keyword = result[0].search_keyword;
              // console.log("jer1 : " + campaign_set);
              await setCam(result[0].campaign_id, campaign_set, async function (camset1) {
                // console.log("jer : " + camset1);
                setTimeout(async () => {
                  await manageCampaign(campaign_id, mains, camset1, keyword, index_id, timetostamp)
                }, 1000);
                // await manageCampaign(campaign_id, mains, camset1,keyword, index_id, timetostamp)
              });


            });
            //CLOSE SELECT CAMPAIGN

          } catch (err) {
            db.collection("index_repo_campaign").update({ "_id": index_id }, {
              $set: { "error_status": "NS", "readindex": 'Y', "readnexttime": timetostamp, "readindexdate": new Date() }
            });// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง
          }

          async function setCam(camid, campaign_setArr, callback) {

            try {

              var campaign_set = [];
              let camidcheck = camid

              for (const camsetcheck of campaign_setArr) {
                await db.collection("campaign_setkeyword").find({ 'campaign_id': camidcheck, _id: camsetcheck }).toArray(async function (err, result1) {
                  for (const rs1 of result1) {
                    var arrPush = rs1.campaign_id + "_" + camsetcheck + "_" + rs1.typeof_keyword;
                    campaign_set.push(arrPush);
                  }
                });
                callback(campaign_set)
              }


            } catch (err) {
              console.error(err);
            }

          }



          async function manageCampaign(rscampaign, mains, campaign_set, keyword, index_id, timetostamp) {

            try {

              var title_voice = ""
              if ((mains[0].snippet.title)) {
                title_voice = mains[0].snippet.title
              }

              await db.collection("voice_youtube").find({ "voice_message": mains[0].snippet.title }).toArray(async function (err, resultcheck) {
                if (resultcheck.length > 0) {
                  idposttocomment = resultcheck._id
                  await db.collection("voice_youtube").update(
                    {
                      "_id": resultcheck._id,
                    },
                    {
                      $set: {
                        "_id": resultcheck._id,
                        "voice_refid": 0,
                        "index_id": index_id,
                        "channel": "https://www.youtube.com/channel/" + mains[0].snippet.channelId,
                        // "campaign_id": rscampaign,
                        // "campaign_set": campaign_set,
                        // "keyword": keyword,
                        "voice_message": mains[0].snippet.title,
                        "directurl": "https://www.youtube.com/watch?v=" + mains[0].id,
                        "author": mains[0].snippet.channelTitle,
                        "authorimage": mains[0].snippet.thumbnails.medium.url,
                        "like": mains[0].statistics.likeCount,
                        "dislike": mains[0].statistics.dislikeCount,
                        "view": mains[0].statistics.viewCount,
                        "subscribers": "",
                        "engagement": parseInt(mains[0].statistics.likeCount) + parseInt(mains[0].statistics.dislikeCount) + parseInt(mains[0].statistics.viewCount),
                        "postdate": convert.dateFormat(mains[0].snippet.publishedAt, "YOUTUBE"),
                        "postymd": convert.dateFormat(mains[0].snippet.publishedAt, "POSTYMD"),
                        "collectdate": convert.dateFormat(),
                        "collectnexttime": timetostamp,
                        "source_type": 'youtube',
                        "typepost": 'page_post'
                      }
                    },
                    async function (err, rs) {
                      if (err) {
                        console.error("update post youtube err : " + err);
                      }
                    });

                } else {


                  await db.collection("zprimarykey_voice_youtube").findAndModify(
                    {
                      query: { _id: "indexid" },
                      update: { $inc: { seq: 1 } },
                      new: true
                    },
                    async function (err, result) {
                      var id = result.seq;
                      idposttocomment = result.seq;
                      var content = [];
                      content.push({
                        _id: id,
                        voice_refid: 0,
                        index_id: index_id,
                        channel: "https://www.youtube.com/channel/" + mains[0].snippet.channelId,
                        campaign_id: rscampaign,
                        campaign_set: campaign_set,
                        keyword: keyword,
                        voice_message: mains[0].snippet.title,
                        directurl: "https://www.youtube.com/watch?v=" + mains[0].id,
                        author: mains[0].snippet.channelTitle,
                        authorimage: mains[0].snippet.thumbnails.medium.url,
                        like: mains[0].statistics.likeCount,
                        dislike: mains[0].statistics.dislikeCount,
                        view: mains[0].statistics.viewCount,
                        subscribers: "",
                        engagement: parseInt(mains[0].statistics.likeCount) + parseInt(mains[0].statistics.dislikeCount) + parseInt(mains[0].statistics.viewCount),
                        postdate: convert.dateFormat(mains[0].snippet.publishedAt, "YOUTUBE"),
                        postymd: convert.dateFormat(mains[0].snippet.publishedAt, "POSTYMD"),
                        collectdate: convert.dateFormat(),
                        collectnexttime: timetostamp,
                        source_type: 'youtube',
                        typepost: 'page_post'
                      });

                      await db.collection("voice_youtube").insert(content, async function (err, res) {
                        if (err) {
                          console.log('insert voice_youtube Err :' + err);
                        }

                      });


                    });//ปิด run number mongo


                }
              });



            } catch (err) {
              // console.error("manage addmon POST ERR : "+err.message)
              await db.collection("index_repo_campaign").update({ "_id": index_id }, {
                $set: { "error_status": "F", "readindex": 'Y', "readnexttime": timetostamp, "readindexdate": new Date() }
              });// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง
            }

            await voiceupdate.readIndexChangeY(index_id, timetostamp, title_voice)//Stamp Y

          }// ปิด manageCampaign





        });//ปิด REQUEST


        rows++
        run(data, rows)


      } catch (err) {//try post ใหญ่สุด
        console.error("REQUEST POST ERR : " + err);
        end_point_process++;
        await db.collection("index_repo_campaign").update({ "_id": index_id }, {
          $set: { "error_status": "NS", "readindex": 'Y', "readnexttime": timetostamp, "readindexdate": new Date() }
        });// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง
      }


    }//ปิด for ใหญ่สุด
  }


  //comment
  async function runcom(data, rowxx) {


    var index = rowxx;

    if (data[index]) {
      var row = data[index];


      var fullurl = row[0]
      const index_id = row[1]
      var videoid = row[2]
      var timetostamp = row[3]


      try {

        var URL = "https://www.googleapis.com/youtube/v3/commentThreads?videoId=" + videoid + "&maxResults=100&part=snippet,replies&key=AIzaSyAUg-HrJST7PlCjnS0Na9ZzJMouvfMF4F4"
        var jar = request.jar();
        await request({
          method: 'GET',
          url: URL,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
          },
          jar: jar
        }, async function (err, response, body) {
          // จัดอาเรย์ลงมองโก

          if (typeof body !== "undefined") {
            var data = JSON.parse(body)
            var mains = data.items;
          }

          //SELECT CAMPAIGN
          await db.collection("index_repo_campaign").find({ 'url': fullurl }).toArray(async function (err, result) {
            if (err) {
              console.error("select cam :" + err);
            }
            var campaign_id = [];
            var campaign_set = result[0].campaign_set
            var keyword;
            campaign_id.push(result[0].campaign_id)
            keyword = result[0].search_keyword;
            await setCamcom(result[0].campaign_id, campaign_set, async function (camset1) {
              setTimeout(async () => {
                await manageCampaigncom(campaign_id, mains, camset1, keyword, index_id, timetostamp, 0)
              }, 1000);
              // await manageCampaign(campaign_id, mains, camset1,keyword, index_id, timetostamp)
            });


          });
          //CLOSE SELECT CAMPAIGN



          async function setCamcom(camid, campaign_setArr, callback) {
            try {

              var campaign_set = [];
              let camidcheck = camid
              // console.log("idcam : " + camidcheck);

              for (const camsetcheck of campaign_setArr) {
                await db.collection("campaign_setkeyword").find({ 'campaign_id': camidcheck, _id: camsetcheck }).toArray(async function (err, result1) {
                  for (const rs1 of result1) {
                    var arrPush = rs1.campaign_id + "_" + camsetcheck + "_" + rs1.typeof_keyword;
                    // console.log("setcam : " + arrPush);
                    campaign_set.push(arrPush);
                  }
                });
                callback(campaign_set)
              }


            } catch (err) {
              console.error(err);
            }


          }


          async function manageCampaigncom(rscampaign, mains, campaign_set, keyword, index_id, timetostamp, rowx) {

            try {
              if ((mains[rowx])) {

                await db.collection("voice_youtube").find({ "voice_message": mains[rowx].snippet.topLevelComment.snippet.textOriginal }).toArray(async function (err, resultcheck) {
                  if (resultcheck.length > 0) {

                    await db.collection("voice_youtube").update(
                      {
                        "_id": resultcheck._id,
                      },
                      {
                        $set: {
                          '_id': resultcheck.id,
                          'voice_refid': idposttocomment,
                          'index_id': index_id,
                          'channel': mains[rowx].snippet.topLevelComment.snippet.authorChannelUrl,
                          // 'campaign_id': rscampaign,
                          // 'campaign_set': campaign_set,
                          // 'keyword': keyword,
                          'voice_message': mains[rowx].snippet.topLevelComment.snippet.textOriginal,
                          'directurl': "https://www.youtube.com/watch?v=" + mains[rowx].snippet.topLevelComment.snippet.videoId,
                          'author': mains[rowx].snippet.topLevelComment.snippet.authorDisplayName,
                          'authorimage': mains[rowx].snippet.topLevelComment.snippet.authorProfileImageUrl,
                          'like': mains[rowx].snippet.topLevelComment.snippet.likeCount,
                          'dislike': "",
                          'view': "",
                          'subscribers': "",
                          'engagement': "",
                          'postdate': convert.dateFormat(mains[rowx].snippet.topLevelComment.snippet.publishedAt, "YOUTUBE"),
                          'postymd': convert.dateFormat(mains[rowx].snippet.topLevelComment.snippet.publishedAt, "POSTYMD"),
                          'collectdate': convert.dateFormat(),
                          'collectnexttime': timetostamp,
                          'source_type': 'youtube',
                          "typepost": 'comment'
                        }
                      },
                      async function (err, rs) {
                        if (err) {
                          console.error("update comment yb err : " + err);
                        }
                        rowx++;
                        manageCampaigncom(rscampaign, mains, campaign_set, keyword, index_id, timetostamp, rowx)
                      });

                  } else {

                    await db.collection("zprimarykey_voice_youtube").findAndModify(
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
                          voice_refid: idposttocomment,
                          index_id: index_id,
                          channel: mains[rowx].snippet.topLevelComment.snippet.authorChannelUrl,
                          campaign_id: rscampaign,
                          campaign_set: campaign_set,
                          keyword: keyword,
                          voice_message: mains[rowx].snippet.topLevelComment.snippet.textOriginal,
                          directurl: "https://www.youtube.com/watch?v=" + mains[rowx].snippet.topLevelComment.snippet.videoId,
                          author: mains[rowx].snippet.topLevelComment.snippet.authorDisplayName,
                          authorimage: mains[rowx].snippet.topLevelComment.snippet.authorProfileImageUrl,
                          like: mains[rowx].snippet.topLevelComment.snippet.likeCount,
                          dislike: "",
                          view: "",
                          subscribers: "",
                          engagement: "",
                          postdate: convert.dateFormat(mains[rowx].snippet.topLevelComment.snippet.publishedAt, "YOUTUBE"),
                          postymd: convert.dateFormat(mains[rowx].snippet.topLevelComment.snippet.publishedAt, "POSTYMD"),
                          collectdate: convert.dateFormat(),
                          collectnexttime: timetostamp,
                          source_type: 'youtube',
                          typepost: 'user_comment'
                        });


                        await db.collection("voice_youtube").insert(content, async function (err, res) {
                          if (err) {
                            console.log('insert comment voice_youtube Err :' + err);
                          }
                          rowx++;
                          manageCampaigncom(rscampaign, mains, campaign_set, keyword, index_id, timetostamp, rowx)
                        });


                      });//ปิด run number mongo


                  }
                });



              }//ปิด if main[rowx]

            } catch (err) { }


          }// ปิด manageCampaign

        });//ปิด REQUEST




      } catch (err) {
        console.error("REQUEST Comment ERR : " + err);
      }

      rowxx++
      runcom(data, rowxx)
    }

  }

  await voiceupdate.showMemoryUsage("youtube");

  await voiceupdate.d("----- end loop youtube")
  end_point_process = new Date()
  await voiceupdate.dSum(success_process, err_process, start_process, end_point_process, data.length);

  await voiceupdate.d("----- end youtube")

}



// ค้นหาจากคีเวิด
exports.getYoutubeNochannel = function (data, rowx) {
  try {

    async function run(data, rowx) {

      let row = data[rowx];
      let campaign_set = row[0]
      let campaign_id = row[1]
      let keyword = row[2]
      let startCmp = row[3]
      let first = row[4]
      startCmp = await setPubAfterOne(startCmp)
      if (first == 1) {
        startCmp = await setPubAfterTwo(startCmp)
      }

      await doRequest(campaign_set, campaign_id, keyword, startCmp)

    } run(data, rowx)

    async function doRequest(campaign_set, campaign_id, keyword, startCmp, pagetoken) {
      try {
        if ((pagetoken)) {
          var nextPageClick = await doNextPage(pagetoken)
        } else {
          var nextPageClick = ""
        }
        const URL = "https://www.googleapis.com/youtube/v3/search?q=" + encodeURIComponent(keyword) + "&maxResults=50&publishedAfter=" + encodeURIComponent(startCmp.toISOString()) + "&part=snippet" + nextPageClick + "&key=AIzaSyAUg-HrJST7PlCjnS0Na9ZzJMouvfMF4F4"
        let jar = request.jar();
        request({
          method: 'GET',
          url: URL,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
          },
          jar: jar
        }, async function (err, response, body) {

          if (typeof body !== "undefined") {
            let data = await JSON.parse(body)
            if ((data.nextPageToken)) {
              var pagetoken = data.nextPageToken;
              console.log(pagetoken);
            }
            var mains = data.items;
          }
          console.log("---------------------TOTAL YOUTUBE : " + mains.length);
          try {

            let rs = await manageindex(mains, campaign_id, keyword);
            if ((pagetoken)) {
              console.log("OPEN NEXT PAGE KEYWORD : " + keyword);
              await doRequest(campaign_set, campaign_id, keyword, startCmp, pagetoken)
            } else {
              console.log("NO NEXT PAGE KEYWORD : " + keyword);
            }
            await voiceupdate.updateIndexRepoSearch(rs, campaign_set, 0, "post")

            console.log("-------------------------------END PROCESS ");
          } catch (err) {
            console.error("REQUEST ERR", err);
          }// ปิด catch eval
        });


      } catch (err) {
        console.error("doRequest ERR", err);
      }

    }
    function doNextPage(pagetokennext) {
      if ((pagetokennext)) {
        return "&pageToken=" + pagetokennext
      } else {
        return ""
      }
    }

    function plusRowx(rowx) {
      return rowx++
    }

    function setPubAfterOne(startCmp) {
      try {
        let date = new Date(startCmp)
        let datas = date.setMonth(date.getMonth() - 1)
        startCmp = new Date(datas)
        return startCmp
      } catch (err) {
        console.error("setPubAfterOne ERROR : ", err);
      }
    }

    function setPubAfterTwo(startCmp) {
      try {
        date = new Date()
        datas = date.setDate(date.getDate() - 1)
        startCmp = new Date(datas)
        return startCmp
      } catch (err) {
        console.error("setPubAfterTwo ERROR : ", err);
      }
    }

    function manageindex(datas, campaign_id, keyword) {
      try {
        var passed = [];
        var keepArr = {};
        var keywordArr = []
        keywordArr.push(keyword)

        for (var data of datas) {

          keepArr = {};
          // console.log("URL GET : https://www.youtube.com/watch?v=" + data.id.videoId);

          keepArr["campaign_id"] = campaign_id;
          keepArr["search_keyword"] = keywordArr;
          keepArr["title_search"] = data.snippet.title,
          keepArr["domain"] = "youtube.com";
          keepArr["url"] = "https://www.youtube.com/watch?v=" + data.id.videoId
          keepArr["platform"] = "youtube";

          passed.push(keepArr)


        }


        return passed;


      } catch (error) {
        console.error("ManageIndex Catch", error)
      }
    }



  } catch (err) {
    console.error(err);
  }




}
