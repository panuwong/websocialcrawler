'use strict';

const request = require('request');
const puppeteer = require('puppeteer');

const convert = require('../lib/convert');

const voiceupdate = require('../lib/voiceupdate');
const mongojs = require('../configDB/db');

const db = mongojs.connect;

exports.getIndexTwitter = function (data) {

  (async () => {
    process.setMaxListeners(Infinity); // <== Important line
    voiceupdate.d("sv start twitter get index")
    voiceupdate.d("total : " + data.length);
    // Set up browser and page.
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });


    for (var index = 0; index < data.length; index++) {
      var row = data[index];
      var url = row[0]
      var index_id = row[1]
      var timetostamp = row[2]

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

      page.on('error', (err) => {
        console.log(`Puppetter error occurred on ${req.originalUrl}: ${err}`)
        browser.close();
      })
      page.on('pageerror', (pageerr) => {
        console.log(`Puppetter pageerror occurred on ${req.originalUrl}: ${pageerr}`)
        browser.close();
      })

      page.setViewport({ width: 1280, height: 540 });

      // ล็อกอิิน
      // await page.goto("https://twitter.com/hashtag/%E0%B8%84%E0%B8%B3%E0%B8%84%E0%B8%A1")
      await page.goto(url)
      voiceupdate.d("     " + (index + 1) + ". url Twitter:" + url)

      await page.waitFor(2000);
      var campaign_id = [];
      var campaign_set = [];
      await db.collection("index_repo_campaign").find({ "_id": index_id }).toArray(function (err, result) {
        //
        for (const rs of result) {
          campaign_id = rs.campaign_id;

          db.collection("campaign_setkeyword").find({ 'campaign_id': rs.campaign_id }).toArray(function (err, result1) {
            for (const rs1 of result1) {
              var arrPush = rs1.campaign_id + "_" + rs1._id + "_" + rs1.typeof_keyword;

              campaign_set.push(arrPush);
            }
          });

        }
      });

      await page.waitFor(2000);
      voiceupdate.d("     scroller page Twitter")
      await scrolled(page)
      await page.waitFor(1000);
      voiceupdate.d("     page evalute")
      const rs = await page.evaluate(manageIndex)
      voiceupdate.d("     reslut:" + rs.length)
      await page.waitFor(1000);
      // console.log("reslut :"+rs.length);

      // data(null,rs);
      // console.log("Test");
      // // browser.close();
    }

    voiceupdate.showMemoryUsage("twitter")
    voiceupdate.d("     end twitter close page for TYPE PAGE")
    await browser.close();


    // console.log("end twitter close page for TYPE PAGE");
  })();

  async function scrolled(page) {
    try {
      let previousHeight;
      var ii = 1;
      while (ii <= 10) {

        // const aTags = await page.$('div.PermalinkOverlay-modal')
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await page.waitFor(1000);
        ii++;
      }
    } catch (e) { }
  }

  async function manageIndex() {

    try {
      var passed = [];
      var keepArr = {};

      var linkTw = document.querySelectorAll('div.tweet');



      for (const rs of linkTw) {

        keepArr = {};
        // keepArr["campaign_id"] = "";
        // keepArr["campaign_set"] = "";
        keepArr["title"] = document.title;
        keepArr["domain"] = "twitter.com";
        keepArr["url"] = "twitter.com" + rs.attributes[3].value;
        keepArr["platform"] = "twitter";

        passed.push(keepArr)
      }
      return passed;
    } catch (error) {
      console.log("ManageIndex Catch")
      console.log(error);

    }
  }

}


// ค้นหาจากคีเวิด pup เอา index
exports.getTwitter = function (data) {

  (async () => {
    // Set up browser and page.
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    page.setViewport({ width: 1280, height: 540 });

    // ล็อกอิิน


    await page.goto("https://twitter.com/search?q=" + 'น้องหมาน่ารัก')
    await page.waitFor(2000);




    const rs = await page.evaluate(managesinglepost)
    await page.waitFor(1000);


    // browser.close();

    data(null, rs);

  })();








  async function managesinglepost() {

    try {

      var passed = [];
      var keepArr = {};
      var url = document.querySelectorAll('div[data-permalink-path]');





      var i = 0;
      for (const rs of url) {
        keepArr = {};
        keepArr["no"] = i;
        keepArr["url"] = "https://twitter.com" + rs.attributes[3].value;
        passed.push(keepArr);
        i++;
      }


      return passed;


    } catch (error) {
      console.log(error);
    }



  }


}



// get comment like from url landing no login
exports.getTwitterLanding = function (data, rowx, checkBrowser, success_p = 0, err_p = 0) {
 

  voiceupdate.proxyData("twitter",function (proxyData) {
    (async () => {
      // Set up browser and page.
      // console.log("sv start twitter");
      getTwitterLandings(data, rowx, checkBrowser,proxyData )
      

    })();
  });

  async function getTwitterLandings(data, rowx, checkBrowser,proxyData, success_p = 0, err_p = 0){
    var start_process = new Date()
    var success_process = success_p;
    var err_process = err_p;
    var end_point_process = new Date()
    var page
    var browser
    var agentR = voiceupdate.getAgent();
    
    (async () => {
    
      try {
        if(proxyData == "NOT PROXY PLATFORM"){
          throw (proxyData)
        }

        if (checkBrowser) {
          voiceupdate.d("sv start twitter get landing")
          voiceupdate.d("total : " + data.length);

          browser = await puppeteer.launch({
            headless: false,
            args: [
              '--proxy-server=' + proxyData[0],
              '--no-sandbox',
              '--disable-setuid-sandbox']
          });

          // var url = "https://twitter.com/Rattanakosin09/status/526631827725758464";

          page = await browser.newPage();
          // await page.setUserAgent(agentR);
          await page.authenticate({ username: proxyData[1], password: proxyData[2] });
  
          page.setViewport({ width: 1280, height: 540 });
          await page.setRequestInterception(true);
          page.on('request', (request) => {
            if (request.resourceType() === 'image') {
              request.abort();
            } else {
              request.continue();
            }
          });
        }

        

        for (var index = rowx; index < data.length; index++) {

          var row = data[index];
          var url = row[0]
          var index_id = row[1]
          var timetostamp = row[2]

          voiceupdate.d("----- No" + (index + 1) + " : get start url :" + url)
          await page.goto(url)
          // voiceupdate.d("     goto Url Twitter")
          await page.waitFor(2000);
          voiceupdate.d("     scroller page Twitter")
          await scrolled(page);
          await page.waitFor(1000);
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
          // console.log("TW open evaluate ");
          voiceupdate.d("     TW open evaluate")
          const rs = await page.evaluate(managesinglepostD);
          await page.waitFor(1000);

          console.log(rs)
          voiceupdate.d("     TW add data mongo")
          await addMongo(index_id, rs, timetostamp, url, campaign_id, campaign_set,keyword, 0);

          await voiceupdate.readIndexChangeY(index_id, timetostamp)
          success_process++


          voiceupdate.showMemoryUsage("twitter")
        }

        // console.log("TW end procress ");
 
        voiceupdate.d("     TW end procress")
        
        browser.close();
        end_point_process = new Date()
        voiceupdate.dSum(success_process, err_process, start_process, end_point_process, data.length);

        voiceupdate.d("----- end TW close browser")
      } catch (e) {
        // console.log("err evaluete restatus")
        // voiceupdate.readIndexChangeRAllUrl(data,index,"err: restatus for Index:"+index_id)

        let senderr = 200
        var keeperr = e.toString()
        if (keeperr.includes("TimeoutError")) {
          senderr = 501
        }

        await voiceupdate.readIndexChangeR(index_id, "NS : PP ERR tw " + e + " index_id: " + index_id, senderr);
        await browser.close();
        err_process++
        index++;
        await getTwitterLandings(data, index, true,proxyData, success_process, err_process)
      }

    })();
  }
 



  async function scrolled(page) {
    try {
      var ii = 1;

      const scrollable_section = 'div#permalink-overlay';

      if (scrollable_section) {
        while (ii <= 11) {

          await page.waitFor(500);
          await page.evaluate(selector => {
            const scrollableSection = document.querySelector(selector);

            scrollableSection.scrollTo(1000, scrollableSection.scrollHeight);


          }, scrollable_section);


          await page.waitFor(500);

          ii++;

        }
      }
    } catch (e) {

      throw "scrollTo Error"

    }
  }



  async function addMongo(index_id, data, timetostamp, url, campaign_id, campaign_set,keyword, rowx, mainD = 0) {

    try {
      // console.log("addMongo");
      var mainid = mainD;
      if ((data[rowx])) {

        await db.collection("zprimarykey_voice_twitter").findAndModify(
          {
            query: { _id: "indexid" },
            update: { $inc: { seq: 1 } },
            new: true
          },
          function (err, result) {

            // console.log(data[rowx]);
            if (typeof data[rowx] !== "undefined") {

              // console.log("delete voice_instagram");
              if (rowx == 0) {
                mainid = result.seq;
              }
              data[rowx]["directurl"] = url;
              data[rowx]["campaign_id"] = campaign_id;
              data[rowx]["campaign_set"] = campaign_set;
              data[rowx]["keyword"] = keyword;
              data[rowx]["_id"] = result.seq
              data[rowx]["like"] = convert.engagementToInt(data[rowx]["like"])
              data[rowx]['engagement'] = convert.engagementToInt(data[rowx]['likepost'])
              data[rowx]["comment"] = convert.engagementToInt(data[rowx]["like"])
              data[rowx]["likepost"] = convert.engagementToInt(data[rowx]["likepost"])
              data[rowx]["retweet"] = convert.engagementToInt(data[rowx]["retweet"])
              data[rowx]["postdate"] = convert.dateFormat(data[rowx]["postdate"], "tw");
              data[rowx]["collectdata"] = convert.dateFormat()
              data[rowx]["voice_refid"] = mainid;
              data[rowx]["index_id"] = index_id;

              data[rowx]["postymd"] = convert.dateFormat(data[rowx]["postdate"],'POSTYMD');
              

            }

            db.collection("voice_twitter").update(
              {
                "tw_id": data[rowx]["tw_id"]
              },
              {
                $set: data[rowx]
              },
              { upsert: true });

            rowx++;
            // console.log(data[rowx]); 
          });  //ปิด findAndModify

        setTimeout(() => {
          addMongo(index_id, data, timetostamp, url, campaign_id, campaign_set,  keyword,rowx, mainid)
        }, 1000);

        if (data.length == rowx) {
        }
      }
      //ปิด if ((main))

    } catch (err) {
      voiceupdate.d("      err: Add data to mongodb and Restatus")

      throw "err: Add data to mongodb Page Twitter Field"
      browser.close();
      voiceupdate.readIndexChangeR(index_id, "err: Add data to mongodb Page Twitter Field" + index_id)
      err_process++
      index++;
      await this.getTwitterLanding(data, index, true, success_process, err_process)
    }
  }

  async function managesinglepostD() {

    try {
      var passed = [];

      // var retwitter = document.querySelector('div.tweet-stats-container > ul.stats > li> a.request-retweeted-popup>strong');
      // var like = document.querySelector('div.tweet-stats-container > ul.stats > li> a.request-favorited-popup>strong');

 
      var element = document.querySelector('div.ProfileTweet-actionList')
      
      var comment = element.querySelector('.ProfileTweet-action--reply')
      var retweet = element.querySelector('.ProfileTweet-action--retweet')
      var like = element.querySelector('.ProfileTweet-action--favorite')
      var tw_id = document.querySelectorAll('div.tweet[data-tweet-id]');
      var converName = document.querySelectorAll('strong.fullname');
      var converPost = document.querySelectorAll('p.TweetTextSize');
      var converTime = document.querySelectorAll('span[data-time]');

      var ownerTime = document.querySelector('span.metadata');


      retweet = retweet.querySelector('button>span').innerText 
      retweet = (retweet != '') ? parseInt(retweet) : 0
      like = like.querySelector('button>span').innerText 
      like = (like != '') ? parseInt(like) : 0
      comment = comment.querySelector('button>span').innerText 
      comment = (comment != '') ? parseInt(comment) : 0

      var i = 0;
      var fkeepArr = {}; 
      fkeepArr["typepost"] = "page_post";
      fkeepArr["tw_id"] = tw_id[i].attributes[1].value;
      fkeepArr["postby"] = converName[i].innerText;
      fkeepArr["voice_message"] = converPost[i].innerText;
      fkeepArr["retweet"] = retweet 
      fkeepArr["like"] = like 
      fkeepArr["engagement"] = 0  
      fkeepArr["comment"] = comment
      fkeepArr["likepost"] = like
      fkeepArr["postdate"] = converTime[i].attributes[2].value;
      fkeepArr["voice_refid"] = "";
      fkeepArr["source_type"] = "twitter";
  

      passed.push(fkeepArr); 

      var engatementComment = document.querySelectorAll('div.content>div.stream-item-footer>div.ProfileTweet-actionList')
 
      i = 1;
      for (const rowEn of engatementComment) {

        var commentEn = rowEn.querySelector('.ProfileTweet-action--reply')
        var retweetEn = rowEn.querySelector('.ProfileTweet-action--retweet')
        var likeEn = rowEn.querySelector('.ProfileTweet-action--favorite')

        retweetEn = retweetEn.querySelector('button>span').innerText 
        retweetEn = (retweetEn != '') ? parseInt(retweetEn) : 0
        likeEn = likeEn.querySelector('button>span').innerText 
        likeEn = (likeEn != '') ? parseInt(likeEn) : 0
        commentEn = commentEn.querySelector('button>span').innerText 
        commentEn = (commentEn != '') ? parseInt(commentEn) : 0



        var keepArr = {};

        keepArr["typepost"] = "page_comment";
        keepArr["tw_id"] = tw_id[i].attributes[1].value;
        keepArr["postby"] = converName[i].innerText;
        keepArr["voice_message"] = converPost[i].innerText;
        keepArr["retweet"] = retweetEn 
        keepArr["like"] = likeEn 
        fkeepArr["engagement"] = 0  
        keepArr["comment"] = commentEn
        keepArr["likepost"] = like
        keepArr["postdate"] = converTime[i].attributes[2].value;
        keepArr["voice_refid"] = "";
        keepArr["source_type"] = "twitter";
    
  
        passed.push(keepArr); 

        i++;
      }

      return passed;


    } catch (error) {
      console.log(error);
      // err_process++
    }



  }

} 




exports.getSearchForKeyword = function (data,rowx) {

  (async () => {
    // Set up browser and page.
    voiceupdate.d("sv start twitter get index")
    voiceupdate.d("total : " + data.length);

    const browser = await puppeteer.launch({
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
    for (var index = rowx; index < data.length; index++) {
      var row = data[index];
      var campaign_set = row[0]
      var campaign_id = row[1]
      var keyword = row[2]
      var first = row[4]

      voiceupdate.d("----- No" + (index + 1) + " : get start keyword :" + keyword)
      await page.goto("https://twitter.com/hashtag/" + keyword)
      
      await page.waitFor(2000);

      var key = []

      key.push(keyword)

      // await page.addScriptTag({ content: `${manageIndex}` });
      // const rs = await page.evaluate(({ campaign_id, key }) => {
        // return manageIndex(campaign_id, key);
      // }, { campaign_id, key });
      const rs = await page.evaluate(manageIndex)
      // console.log(rs);

      var dataR = [] 

      for (let index = 0; index < rs.length; index++) {
        var row = rs[index]
        var keepArr = {}; 
        keepArr['campaign_id'] = campaign_id
        keepArr['search_keyword'] = key
        row = {...row, ...keepArr};
        dataR.push(row)
      }
      // console.log(dataR.length);
      
      voiceupdate.d("      create index_repo_search keyword :"+keyword)
      voiceupdate.updateIndexRepoSearch(dataR, campaign_set, 0)

      
          

      await page.waitFor(2000);
      voiceupdate.d("     scroller page Twitter")
      await scrolled(page, campaign_set,campaign_id,key)
      // await page.waitFor(1000);
      // voiceupdate.d("     page evalute")
      // const rs = await page.evaluate(manageIndex)
      // voiceupdate.d("     reslut:" + rs.length)
      // await page.waitFor(1000);
      // console.log("reslut :"+rs.length);

      // data(null,rs);
      // console.log("Test");
      // browser.close();
    }

    voiceupdate.showMemoryUsage("twitter")
    voiceupdate.d("     end twitter close page for TYPE PAGE")
    await browser.close();


    // console.log("end twitter close page for TYPE PAGE");
  })();

  async function scrolled(page, campaign_set,campaign_id,key) {
    try {
      let previousHeight;
      var ii = 1;
      let row = 20;
      while (ii <= 10) {

        // const aTags = await page.$('div.PermalinkOverlay-modal')
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await page.waitFor(1000);
 
        const rs2 = await page.evaluate(manageIndex)
        console.log(rs2);
        var dataR = [] 

        for (let index = 0; index < rs2.length; index++) {
          var rows = rs2[index]
          var keepArr = {}; 
          keepArr['campaign_id'] = campaign_id
          keepArr['search_keyword'] = key
          rows = {...rows, ...keepArr};
          dataR.push(rows)
        }
        row = (dataR.length - 20)
        voiceupdate.d("      create index_repo_search ")
        voiceupdate.updateIndexRepoSearch(dataR, campaign_set, row)

        // console.log(row);
        
        

        const rs = await page.evaluate(checkdate);
        if ((rs)) {
          // console.log(rs);
          break;
        }

        

        ii++;
      }
    } catch (e) { }
  }
  
  async function checkdate() {
    var contents = document.querySelectorAll('span[data-time]')
    for (const content of contents) {
      var date = content 
      var d = new Date();
      var str = d.setDate(d.getDate() - 30)
      str = str.toString();
      var datestop = str.substring(0, 10)
      datestop = parseInt(datestop);
      if (parseInt(date.attributes[2].value) <= datestop) {
        return "200";
      }
    }

  }

  function test(data) {
    
  }

//  function manageIndex(campaign_id, keyword)  {
 function manageIndex()  {

    try {
      var passed = [];
      var keepArr = {};

      var linkTw = document.querySelectorAll('div.tweet');



      for (const rs of linkTw) {

        keepArr = {};

        // keepArr["campaign_id"] = campaign_id;
        // keepArr["search_keyword"] = keyword;
        keepArr["title_search"] = document.title;
        keepArr["domain"] = "twitter.com";
        keepArr["url"] = "https://twitter.com" + rs.attributes[3].value;
        keepArr["platform"] = "twitter";

        passed.push(keepArr)
      }
      return passed;
    } catch (error) {
      console.log("ManageIndex Catch")
      console.log(error);

    }
  }

 

}