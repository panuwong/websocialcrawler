const request = require('request');
const puppeteer = require('puppeteer');
const convert = require('../lib/convert');
const voiceupdate = require('../lib/voiceupdate');
let mongojs = require('../configDB/db'); 

let db = mongojs.connect;

let index_collection = "index_repo_campaign"
let voice_collect = "voice_instagram"
 
// ค้นหาจากคีเวิด #hashtag ทำได้แค่ Count จำนวน
exports.getTagCount = function (callback) {
  var keyword = "เบียร์";
  const URL = "https://api.instagram.com/v1/tags/search?q=" + encodeURIComponent(keyword) + "&access_token=207566344.0ab3c23.b73dc828c4274364a14ba1155f4ba8da"
  var jar = request.jar();

  request({
    method: 'GET',
    url: URL,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
    },
    jar: jar
  }, function (err, response, body) {

    callback(null, body)
  });

}

exports.getIndexInMedia = function (data) {

  (async () => {
    // Set up browser and page.

    var browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    voiceupdate.d("sv start instagram")
    voiceupdate.d("total : " + data.length);

    for (var index = 0; index < data.length; index++) {
      var row = data[index];
      var url = row[0]
      var index_id = row[1]

      const page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (request.resourceType() === 'image') {
          // console.log("abort jpeg "+request.resourceType());

          request.abort();
        } else {

          // console.log("continue "+request.resourceType());
          request.continue();
        }
      });
      page.setViewport({ width: 1280, height: 540 });

      await page.waitFor(3000);
      // ล็อกอิิน 
      await page.goto(url)


      await page.waitFor(5000);
      // await page.waitForSelector('div.EZdmt');
      // await scrolled(page);
      // div.EZdmt

      let secPopTap = await page.$("div.EZdmt")

      if (secPopTap) {

        await page.evaluate((sel) => {
          document.querySelector(sel).remove();
        }, "div.EZdmt")
      }

      await page.waitFor(2000);
      let campaign_id = [];
      let campaign_set = [];
      let search_keyword = [];
      await db.collection("index_repo_campaign").find({ "url": url }).toArray(function (err, result) {
        //
        for (const rs of result) {
          campaign_id = rs.campaign_id;
          search_keyword = rs.search_keyword
          campaign_set = rs.campaign_set

        }
      });

      await page.waitFor(2000);

      await clickone(page);
      await page.waitFor(1000);
      await cliclNextPost(page, campaign_id, campaign_set, search_keyword, true, 1);
      // await page.waitFor(3000);   

      console.log("end instagram close page for TYPE PAGE");
      // callback(null,rs);
    }

    // voiceupdate.d("----- end loop " + numCount)
    await browser.close();

    voiceupdate.d("----- end instagram close browser")

  })();

  async function cliclNextPost(page, campaign_id, campaign_set, search_keyword, check, contIndex) {
    try {
      // let contIndexs = contIndex;
      if (check) {


        const clickbtn = await page.$$("a.HBoOv")
        if (clickbtn[0]) {
          await page.waitFor(2000);
          await clickbtn[0].click()
          await page.waitFor(1000);


          await page.addScriptTag({ content: `${manageIndex}` });
          const rs = await page.evaluate(({ campaign_id, search_keyword }) => {
            return manageIndex(campaign_id, search_keyword);
          }, { campaign_id, search_keyword });

          voiceupdate.d("      create index_repo_search " + (contIndex + 1))
          voiceupdate.updateIndexRepoSearch(rs, campaign_set[0], 0)


          await page.waitFor(500);
          const rsCheckBrak = await page.evaluate(checkdate);

          await page.waitFor(500);
          // console.log(rsCheckBrak);

          if (!rsCheckBrak) {
            check = rsCheckBrak

            // voiceupdate.d("      keyword :" + search_keyword[0] + " count index: " + contIndex)

            voiceupdate.showMemoryUsage("search ig for keyword")
            return true
            //  break;
          } else {
            //  setTimeout(() => {
            // await page.waitFor(500);

            contIndex = contIndex + 1;
            cliclNextPost(page, campaign_id, campaign_set, search_keyword, check, contIndex)
            // }, 1000);
          }


          // dataForIndex =rs;

        } else {
          // voiceupdate.d("      keyword :" + keyword + " count index: " + contIndex)

          voiceupdate.showMemoryUsage("search ig for keyword")
          return true
        }
      }
    } catch (e) {
      console.error(e)
    }

  }

  async function clickone(page) {
    const clickbtn = await page.$$("div.v1Nh3")
    if (clickbtn) {
      await clickbtn[0].click('a')
      await page.waitFor(1000);
    }
  }


  function checkdate() {
    var time = document.querySelector('time[datetime]')

    if (time) {
      time = time.attributes[1].value
      var d = new Date();
      var str = d.setDate(d.getDate() - 10)
      str = str.toString();
      var datestop = str.substring(0, 10)
      datestop = parseInt(datestop);

      var dateIG = new Date(time)
      var dateIGCon = dateIG.setDate(dateIG.getDate()).toString()
      var dateIGF = dateIGCon.substring(0, 10)
      if (parseInt(dateIGF) <= datestop) {
        return false
      } else {

        return true
      }
    }
  }



  function manageIndex(campaign_id, keyword) {

    try {

      var passed = [];
      var keepArr = {};

      keepArr = {};
      keepArr["campaign_id"] = campaign_id;
      keepArr["search_keyword"] = keyword
      keepArr["title_search"] = document.title;
      keepArr["domain"] = "instagram.com";
      keepArr["url"] = document.URL;
      keepArr["platform"] = "instagram";

      passed.push(keepArr)

      return passed;


    } catch (error) {
      console.log(error);
    }



  }
}

// ค้นหา comment ใน media แต่ละตัว
exports.getCommentInMedia = function (callback) {



  var a = convert.engagementToInt("9 like");
  var g = convert.engagementToInt("All 11");
  var e = convert.engagementToInt("100");
  var f = convert.engagementToInt("42,444");

  console.log("9.9 K " + a);
  console.log("All 11K" + g);
  //   console.log("90 M "+b);
  //   console.log("1.4 M "+c);
  //   console.log("10 m "+d);
  console.log("100 " + e);
  console.log("42,444 " + f);

  var str = "https://www.facebook.com/1164107963611361/photos/a.1164128126942678/1791457384209746/?type=1&theater"
  var c = str.match(/[a-zA-Z0-9]+/g);

  var sdd = "`https://www.facebook.com/Cosmetic20baht/photos/a.722679961076775/2212367742107982/?type=1&theater"
  var cd = sdd.match(/[a-zA-Z0-9]+/g);

  console.log(c[5]);
  console.log(cd[5]);


  var facebook = convert.dateFormat("Wednesday, October 24, 2018 at 9:19 PM", "FB");

  var facebookOld = convert.dateFormat("1544379066", "FB");

  console.log(facebook);
  console.log(facebookOld);
  // convert.dateFormat("2018-11-17T07:12:56.000Z","IG");


}





// https://www.instagram.com/explore/tags/อาหาร/

// puppeteer Get comment
exports.getCommentInMediaPup = function (data, numCount = 0, rowx, checkBrowser, success_pro = 0, err_pro = 0) {

  let start_process = new Date()
  let success_process = success_pro;
  let err_process = err_pro; 
  let browser  
  let page  
  let index_ids 
  voiceupdate.proxyData("instagram", function (proxyData) {
    (async () => {
      // let db = mongojs.connect;
      // Set up browser and page.


      if (proxyData == "NOT PROXY PLATFORM") {
        throw (proxyData)
      }

      getCommentInMediaPups(data, numCount, rowx, checkBrowser, proxyData);


    })();
  });


   

  function getCommentInMediaPups(data, numCount, rowx, checkBrowser, proxyData, success_pro = 0, err_pro = 0) {
    (async () => {
      // let db = mongojs.connect;
      // Set up browser and page.
      try {


        voiceupdate.d("sv start instagram")
        voiceupdate.d("total : " + data.length);
        if (checkBrowser) {
          browser = await puppeteer.launch({
            headless: true,
            args: [
              '--proxy-server=' + proxyData[0],
              '--no-sandbox',
              '--disable-setuid-sandbox']
          });
          page = await browser.newPage();
          // await page.setUserAgent(agentR);
          await page.authenticate({ username: proxyData[1], password: proxyData[2] });

          // page.on('console', consoleObj => console.log(consoleObj.text));

          page.setViewport({ width: 1280, height: 540 });
          await page.setRequestInterception(true);
          page.on('request', (request) => {
            if (request.resourceType() === 'css') {

              request.abort();
            } else {
              request.continue();
            }
          });
        }

        try {
          await getDataIG(data, rowx, proxyData, success_pro, err_pro,browser)
        } catch (error) {
          throw (error)
        }


      } catch (err) {


        console.error("PP ERR : " + err);
        let senderr = 200
        var keeperr = err.toString()
        if (keeperr.includes("TimeoutError")) {
          senderr = 501
        }
        await voiceupdate.readIndexChangeR(index_ids, "NS : PP ERR ig " + err + " index_id: " + index_ids, senderr);
        err_process++
        index++;
        browser.close()

        await getCommentInMediaPups(data, numCount, index, true, proxyData, success_process, err_process)
      }

    })();
  }



  async function getDataIG(data, rowx, success_p = 0, err_p = 0,browser) {

    try {
      let index = rowx
      if (data[index]) {
        const row = data[index];
        const url = row[0]
        const index_id = row[1]
        const timetostamp = row[2]

        index_ids = index_id
        try {
          await voiceupdate.updateStatus(data, index, async function (result) {

            setTimeout(async () => {
              
              await evaluateData(result, data, index, success_p , err_p , url, index_id, timetostamp,browser)

            }, 2000);

          });
        } catch (error) {
          throw (error)
        }


      }
    } catch (error) {
      throw ("ERR FOR getdataig: "+error)
    }
  }


  async function evaluateData(result, data, index, success_p = 0, err_p = 0, url, index_id, timetostamp,browser) {
    if (result) {

      await page.waitFor(3000);
      await voiceupdate.d("----- No" + (index + 1) + " : get start url :" + url)
      await page.goto(url)


      // await page.waitForSelector('a.zV_Nj');

      await page.waitFor(4000);
      try {
        await clickone(page);
      } catch (err) {
        voiceupdate.d("     Click No Comment")
      }
      await page.waitFor(5000);
      var campaign_id = [];
      var campaign_set = [];
      var keyword = [];
      await db.collection("index_repo_campaign").find({ "url": url }).toArray(function (err, result) {
        //
        for (const rs of result) {
          campaign_id.push(rs.campaign_id);

          keyword.push(rs.search_keyword[0]);

          db.collection("campaign_setkeyword").find({ 'campaign_id': rs.campaign_id, _id: rs.campaign_set[0] }).toArray(function (err, result1) {
            for (const rs1 of result1) {
              var arrPush = rs1.campaign_id + "_" + rs1._id + "_" + rs1.typeof_keyword;

              campaign_set.push(arrPush);
            }
          });

        }
      });

      await page.waitFor(5000);

      try {
        await addpost(page, index_id, timetostamp, campaign_id, campaign_set, keyword, url)
      } catch (err) {
        throw ("Add PORT " + err)
      }

      try {
        await addcomment(page, index_id, timetostamp, campaign_id, campaign_set, keyword, url)
      } catch (err) {
        throw ("Add Comment " + err)
      }

      await voiceupdate.showMemoryUsage("IG ")

      index++;
       getDataIG(data, index, success_process, err_process,browser)

    } else {
      await voiceupdate.d("----- skip " + (index + 1) + " : get start url :" + url + " readrindex R")
      index++;
       getDataIG(data, index, success_process, err_process,browser)
    }

    if (data.length == index) {
      await voiceupdate.d("----- end loop " + numCount)
      await browser.close();
      end_point_process = new Date()
      await voiceupdate.dSum(success_process, err_process, start_process, end_point_process, data.length);

      await voiceupdate.d("----- end instagram close browser")
    }
  }


  async function addpost(page, index_id, timetostamp, campaign_id, campaign_set, keyword, url) {
    voiceupdate.d("     evaluate data POST")
    try {
      const rs = await page.evaluate(managesinglepost)
      await page.waitFor(4000);
      // console.log(rs.length);
      db.collection(voice_collect).remove(
        {
          "index_id": index_id,
          'typepost': 'page_post'
        });
      await page.waitFor(2000);
      voiceupdate.d("     addMongo")
      await page.waitFor(5000);
      await addMongo(index_id, rs, timetostamp, campaign_id, campaign_set, keyword, url, 0);
      success_process++
    } catch (error) {
      throw ("ERR: No Data For evaluate :" + url)
    }
  }


  async function addcomment(page, index_id, timetostamp, campaign_id, campaign_set, keyword, url) {

    voiceupdate.d("     evaluate data COMMENT")
    try {
      let indexref;

      await page.waitFor(4000);
      db.collection(voice_collect).find({ index_id: index_id, 'typepost': 'post' }).toArray(function (err, resultd) {

        for (const row of resultd) {
          if (data[rowx]) {

            indexref = row._id
          } else {
            throw (" ig voice_refid error")
          }
        }

      });

      await page.waitFor(4000);
      await page.addScriptTag({ content: `${managesinglecomment}` });

      await page.waitFor(2000);
      const rs = await page.evaluate(({ indexref }) => {
        return managesinglecomment(indexref);
      }, { indexref });
      await page.waitFor(4000);

      db.collection(voice_collect).remove(
        {
          "index_id": index_id,
          'typepost': 'comment'
        });

      voiceupdate.d("     addMongoComment")

      await page.waitFor(2000);
      await addMongoComment(index_id, rs, timetostamp, campaign_id, campaign_set, keyword, url, 0);
      // success_process++
    } catch (error) {
      throw (error + " No Data For evaluate :" + url)
    }
  }

  async function addMongo(index_id, data, timetostamp, campaign_id, campaign_set, keyword, url, rowx) {

    try {
      if ((data[rowx])) {

        // for (const row of data) {


        // console.log("addMongo");
        await db.collection("zprimarykey_voice_instagram").findAndModify(
          {
            query: { _id: "indexid" },
            update: { $inc: { seq: 1 } },
            new: true
          },
          function (err, result) {

            // console.log(data[rowx]);
            if (typeof data[rowx] !== "undefined") {
              // console.log("have data");
              // console.log("deletevoice_collect);

              data[rowx]["_id"] = result.seq
              var number = convert.engagementToInt("" + data[rowx]["likepost"])
              data[rowx]["likepost"] = number
              data[rowx]["engagement"] = number
              data[rowx]["postdate"] = convert.dateFormat(data[rowx]["postdate"], "ig");
              data[rowx]["collectdata"] = convert.dateFormat();
              data[rowx]["index_id"] = index_id;
              data[rowx]["directurl"] = url;
              data[rowx]["campaign_id"] = campaign_id;
              data[rowx]["campaign_set"] = campaign_set;
              data[rowx]["keyword"] = keyword;
              data[rowx]["comment"] = convert.engagementToInt("" + data[rowx]["comment"])
              data[rowx]["postymd"] = convert.dateFormat(data[rowx]["postdate"], 'POSTYMD');

              // delete data[rowx]['campaign_id'];
              // delete data[rowx]['campaign_set'];
              // delete data[rowx]['keyword'];

              db.collection(voice_collect).update(
                {
                  "voice_message": data[rowx].comment
                },
                {
                  $set: data[rowx]
                },
                { upsert: true });

              rowx++;
              // console.log(data[rowx]);


            } else {//ปิด if typyof
              console.log('not data for evlue');
            }//ปิด else typyof

          });  //ปิด findAndModify


        setTimeout(() => {
          addMongo(index_id, data, timetostamp, campaign_id, campaign_set, keyword, url, rowx)
        }, 1000);

      } else {
        await voiceupdate.readIndexChangeY(index_id, timetostamp)
      }

    } catch (err) {
      // console.error(err);
      throw (err + "Add to mogodb for :" + index_id)
      // await voiceupdate.readIndexChangeR(index_id, "Add to mogodb for :" + index_id)
      // db.collection("index_repo_campaign").update({"_id":index_id},{
      // $set:{"error_status":"Add to mogodb for :"+index_id,"readindex" : 'Y',"readnexttime" : timetostamp,"readindexdate" : new Date()}});// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง

    }

  }

  async function addMongoComment(index_id, data, timetostamp, campaign_id, campaign_set, keyword, url, rowx) {

    try {
      if ((data[rowx])) {

        // for (const row of data) {


        // console.log("addMongoComment");
        await db.collection("zprimarykey_voice_instagram").findAndModify(
          {
            query: { _id: "indexid" },
            update: { $inc: { seq: 1 } },
            new: true
          },
          function (err, result) {

            // console.log(data[rowx]);
            if (typeof data[rowx] !== "undefined") {
              // console.log("have data");
              // console.log("deletevoice_collect);

              data[rowx]["_id"] = result.seq
              var number = convert.engagementToInt("" + data[rowx]["likepost"])

              data[rowx]["likepost"] = number
              data[rowx]["engagement"] = number
              data[rowx]["postdate"] = convert.dateFormat(data[rowx]["postdate"], "ig");
              data[rowx]["collectdata"] = convert.dateFormat();
              data[rowx]["comment"] = convert.engagementToInt("" + data[rowx]["comment"])
              data[rowx]["index_id"] = index_id;
              data[rowx]["directurl"] = url;
              data[rowx]["campaign_id"] = campaign_id;
              data[rowx]["campaign_set"] = campaign_set;
              data[rowx]["keyword"] = keyword;
              data[rowx]["postymd"] = convert.dateFormat(data[rowx]["postdate"], 'POSTYMD');

              db.collection(voice_collect).update(
                {
                  "voice_message": data[rowx].comment
                },
                {
                  $set: data[rowx]
                },
                { upsert: true });

              rowx++;
              // console.log(data[rowx]);


            } else {//ปิด if typyof
              console.log('not data for evlue');
            }//ปิด else typyof

          });  //ปิด findAndModify


        setTimeout(() => {
          addMongo(index_id, data, timetostamp, campaign_id, campaign_set, keyword, url, rowx)
        }, 1000);

      } else {
        await voiceupdate.readIndexChangeY(index_id, timetostamp)
      }

    } catch (err) {
      // console.error(err);
      throw (err + "Add to mogodb for :" + index_id)
      // await voiceupdate.readIndexChangeR(index_id, "Add to mogodb for :" + index_id)
      // db.collection("index_repo_campaign").update({"_id":index_id},{
      // $set:{"error_status":"Add to mogodb for :"+index_id,"readindex" : 'Y',"readnexttime" : timetostamp,"readindexdate" : new Date()}});// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง

    }

  }

  async function clickone(page) {
    var clickbtn = await page.$$("button.Z4IfV")
    if (clickbtn) {
      if (clickbtn.length > 0) {
        for (const doit of clickbtn) {
          await doit.click('button.Z4IfV')
          await page.waitFor(1000);
        }
        clickone(page);
      }
    } else {
      return false
    }

  }




  // async function managesinglepost(url,index_id,campaign_set,campaign_id) {
  async function managesinglepost() {

    try {

      var passed = [];
      var keepArr = {};
      var mainmedie = document.querySelector('img.FFVAD').attributes[5].value;
      var ownerpost = document.querySelector('.FPmhX.notranslate.TlrDj');
      var postmain = document.querySelector('.C4VMK span');
      var usercommentall = document.querySelectorAll('.FPmhX.notranslate.TlrDj');
      var commentall = document.querySelectorAll('.C4VMK span');
      var timepost = document.querySelector('time[datetime]');
      var likepost = document.querySelector('a.zV_Nj'); //ถ้าไม่ login จะไม่ได้ like


      var countComment = commentall.length - 1
      if (!likepost) {
        likepost = document.querySelector('span.vcOH2');
      }
      if (!mainmedie) {

        mainmedie = document.querySelector('video.tWeCl').attributes[2].value;
      }
      var postcom = "page_post";



      keepArr = {};
      keepArr["voice_refid"] = "";
      keepArr["image"] = mainmedie;
      // keepArr["ownerpost"] = ownerpost.innerText;
      // keepArr["voice_post"] = postmain.innerText;
      keepArr["postdate"] = timepost.attributes[1].value;
      keepArr["engagement"] = 0
      keepArr["likepost"] = likepost.innerText;//ถ้าไม่ login จะไม่ได้ like
      keepArr["author"] = usercommentall[0].innerText;
      keepArr["voice_message"] = commentall[0].innerText;
      keepArr["comment"] = countComment;
      keepArr["typepost"] = postcom;
      keepArr["location_lat"] = "";
      keepArr["location_long"] = "";
      keepArr["location_name"] = "";
      keepArr["source_type"] = "instagram";

      passed.push(keepArr);



      return passed;


    } catch (error) {
      throw (error)

    }
  }


  // async function managesinglecomment(db,index_id, timetostamp, campaign_id, campaign_set, url, rowx) {
  async function managesinglecomment(indexref) {

    try {

      var passed = [];
      var keepArr = {};
      var mainmedie = document.querySelector('img.FFVAD').attributes[5].value;
      var ownerpost = document.querySelector('.FPmhX.notranslate.TlrDj');
      var postmain = document.querySelector('.C4VMK span');
      var usercommentall = document.querySelectorAll('.FPmhX.notranslate.TlrDj');
      var commentall = document.querySelectorAll('.C4VMK span');
      var timepost = document.querySelector('time[datetime]');
      var likepost = document.querySelector('a.zV_Nj'); //ถ้าไม่ login จะไม่ได้ like

      if (!likepost) {
        likepost = document.querySelector('span.vcOH2');
      }
      if (!mainmedie) {

        mainmedie = document.querySelector('video.tWeCl').attributes[2].value;
      }
      // var i = 1;
      postcom = "page_comment";

      // for (const rs of usercommentall) {
      var countComment = commentall.length - 1
      for (let index = 1; index < usercommentall.length; index++) {

        if (!indexref) {
          indexref = 1111
        }
        keepArr = {};
        keepArr["voice_refid"] = indexref;
        keepArr["image"] = mainmedie;
        // keepArr["ownerpost"] = ownerpost.innerText;
        // keepArr["voice_post"] = postmain.innerText;
        keepArr["postdate"] = timepost.attributes[1].value;
        keepArr["engagement"] = 0
        keepArr["likepost"] = likepost.innerText;//ถ้าไม่ login จะไม่ได้ like
        keepArr["author"] = usercommentall[index].innerText;
        keepArr["voice_message"] = commentall[index].innerText;
        keepArr["comment"] = countComment;
        keepArr["typepost"] = postcom;
        keepArr["location_lat"] = "";
        keepArr["location_long"] = "";
        keepArr["location_name"] = "";
        keepArr["source_type"] = "instagram";

        passed.push(keepArr);
        // i++;
        // await addMongoComment(db,index_id, passed, timetostamp, campaign_id, campaign_set, url, rowx)
      }


      return passed;


    } catch (error) {
      throw (error)

    }
  }






}




exports.getSearchForKeyword = function (data, rowx) {
  var startCmp;
  (async () => {
    // Set up browser and page.
    voiceupdate.d("sv start search keyword instagram")
    voiceupdate.d("total : " + data.length);
    try {


      var browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on('error', (err) => {
        console.log(`Puppetter error occurred on ${req.originalUrl}: ${err}`)
        browser.close();
      })
      page.on('pageerror', (pageerr) => {
        console.log(`Puppetter pageerror occurred on ${req.originalUrl}: ${pageerr}`)
        browser.close();
      })
      page.on('request', (request) => {
        if (request.resourceType() === 'image') {
          // console.log("abort jpeg "+request.resourceType());

          request.abort();
        } else {

          // console.log("continue "+request.resourceType());
          request.continue();
        }
      });
      page.setViewport({ width: 1280, height: 540 });

      await page.waitFor(2000);
      // ล็อกอิิน
      // for (var index = rowx; index < data.length; index++) {
      for (var index = rowx; index < 1; index++) {
        var row = data[index];
        var campaign_set = row[0]
        var campaign_id = row[1]
        var keyword = row[2]
        startCmp = row[3]


        var first = row[4]

        voiceupdate.d("----- No" + (index + 1) + " : get start keyword :" + keyword)

        await page.goto("https://www.instagram.com/explore/tags/" + keyword)

        await page.waitFor(2000);


        var secPopTap = await page.$("div.EZdmt")

        if (secPopTap) {

          await page.evaluate((sel) => {
            document.querySelector(sel).remove();
          }, "div.EZdmt")
        }

        await page.waitFor(2000);

        await clickone(page);
        // await page.waitFor(1000);

        var key = []

        key.push(keyword)

        // var d = new Date(startCmp);
        // var str = d.setDate(d.getDate() - 7)  
        voiceupdate.d("      cliclNextPost ")
        const rs = await cliclNextPost(startCmp, page, campaign_id, campaign_set, key, true, 0, first, browser);

        // const rs = await page.evaluate(managesinglepost)
        // await page.waitFor(1000);

        voiceupdate.d("-----end instagram close page for TYPE PAGE ")
        // callback(null,rs);
        // await browser.close();
      }

    } catch (error) {
      voiceupdate.d("     Error :" + error)
    }


  })();


  async function cliclNextPost(startCmp, page, campaign_id, campaign_set, keyword, check, contIndex, first, b) {
    try {
      // let contIndexs = contIndex;
      if (check) {


        const clickbtn = await page.$$("a.HBoOv")
        if (clickbtn[0]) {
          await page.waitFor(2000);
          await clickbtn[0].click()
          // await page.waitFor(1000);


          await page.addScriptTag({ content: `${manageIndex}` });
          const rs = await page.evaluate(({ campaign_id, keyword }) => {
            return manageIndex(campaign_id, keyword);
          }, { campaign_id, keyword });
          // await page.waitFor(500); 
          // voiceupdate.d("      URL "+rs[0]['url'])
          // await page.waitFor(300);

          voiceupdate.d("      create index_repo_search " + (contIndex + 1))
          voiceupdate.updateIndexRepoSearch(rs, campaign_set, 0)


          await page.waitFor(500);
          await page.addScriptTag({ content: `${checkdate}` });
          const rsCheckBrak = await page.evaluate(({ startCmp, first }) => {
            return checkdate(startCmp, first);
          }, { startCmp, first });
          // const rsCheckBrak = await page.evaluate(checkdate);

          await page.waitFor(500);
          // console.log(rsCheckBrak);

          if (!rsCheckBrak) {
            check = rsCheckBrak

            voiceupdate.d("      keyword :" + keyword + " count index: " + contIndex)

            voiceupdate.showMemoryUsage("search ig for keyword")
            return true
            //  break;
          } else {
            //  setTimeout(() => {
            // await page.waitFor(500);

            contIndex = contIndex + 1;
            cliclNextPost(startCmp, page, campaign_id, campaign_set, keyword, check, contIndex, first, b)
            // }, 1000);
          }


          // dataForIndex =rs;

        } else {
          voiceupdate.d("      keyword :" + keyword + " count index: " + contIndex)

          voiceupdate.showMemoryUsage("search ig for keyword")
          b.close();
          return true
        }
      }
    } catch (e) {
      voiceupdate.d("     Error :" + e)
    }

  }

  async function clickone(page) {
    const clickbtn = await page.$$("div.v1Nh3")
    if (clickbtn[0]) {
      await clickbtn[0].click('a')
      await page.waitFor(1000);
    } else {
      throw ("PAGE NOT DATA SEARCH")
    }
  }


  function checkdate(startCmp, first) {
    try {
      var time = document.querySelector('time[datetime]')

      var passed = [];
      var check = true
      if (time) {
        time = time.attributes[1].value

        var date = new Date(startCmp)
        var datas = date.setMonth(date.getMonth() - 1)
        var date = new Date(datas)
        var datestop = date.getTime()

        if (first == 1) {
          date = new Date()
          datas = date.setDate(date.getDate() - 1)
          date = new Date(datas)
          datestop = date.getTime()
        }

        datestop = parseInt(datestop);

        var dateIG = new Date(time)
        var dateIGCon = dateIG.getTime()
        if (parseInt(dateIGCon) <= datestop) {
          check = false
        }
      }


      //  passed.push(check)

      return check
    } catch (error) {
      console.log(error);
    }
  }

  // campaign_id	
  // campaign_set	
  // title	
  // domain	
  // url	
  // platform	 instagram
  // platform_typepost	posts 

  function manageIndex(campaign_id, keyword) {

    try {

      var passed = [];
      var keepArr = {};

      keepArr = {};
      keepArr["campaign_id"] = campaign_id;
      keepArr["search_keyword"] = keyword
      keepArr["title_search"] = document.title;
      keepArr["domain"] = "instagram.com";
      keepArr["url"] = document.URL;
      keepArr["platform"] = "instagram";

      passed.push(keepArr)

      return passed;


    } catch (error) {
      console.log(error);
    }



  }
}


exports.openTestPID = function () {

  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log(" ");

  var browser
  var page
  // var agentR = voiceupdate.getAgent();
  // voiceupdate.proxyDataFacebook(function (proxyData) {


  //   // var data = 1
  //   // var rowx = 0

  //   // getSinglePostFromSchedulings(data, rowx, proxyData);





  // });

  (async () => {
    db.collection("index_repo_campaign").find({}).toArray(function (err, resultC) {

      if (resultC) {

        // for (const result of resultC) {

        //   var campaign_set = []
        //   if (result.campaign_set) {
        //     campaign_set = result.campaign_set
        //   }
        //   var newCampSet = []
        //   if (campaign_set.length > 0) {
        //     for (const row of campaign_set) {

        //       if (!Array.isArray(row)) {
        //         newCampSet.push(row)

        //       }

        //     }
        //   }

        //   db.collection("index_repo_campaign").update({ "_id": result._id }, {
        //     $set: { "campaign_set": newCampSet }
        //   })
        // }
        for (const result of resultC) {
          var search_keyword = []
          if (result.search_keyword) {
            search_keyword = result.search_keyword
          }
          var newsearch_keyword = []
          if (search_keyword.length > 0) {

            for (const row of search_keyword) {

              if (search_keyword.length == 1 && Array.isArray(row)) {
                for (const rs of row) {


                  newsearch_keyword.push(rs)
                }
              } else if (!Array.isArray(row)) {
                newsearch_keyword.push(row)

              }

            }
          }

          db.collection("index_repo_campaign").update({ "_id": result._id }, {
            $set: { "search_keyword": newsearch_keyword }
          })



        }


      }

    });
  })();

  async function loginFunc(page, fbuser, fbpass) {
    try {
      await page.goto("https://www.facebook.com")
      await page.waitForSelector('#email');
      await page.type('#email', fbuser, { delay: 10 });
      await page.type('#pass', fbpass, { delay: 10 });
      await page.click('#loginbutton');
      await page.waitFor(2000);
      const checklogin = await page.$('._1vp5')
      if ((checklogin)) {
        console.log("Login SuccessFul");
        return;
      } else {
        console.log("Login UnSuccessFul And ReLogin");
        await loginFunc(page, fbuser, fbpass)
      }
    } catch (err) {
      if ((err)) {
        loginFunc(page, fbuser, fbpass)
      }
    }
  }
}
