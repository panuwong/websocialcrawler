var cheerio = require('cheerio');
var request = require('request');
const puppeteer = require('puppeteer');
var mongojs = require('../configDB/db');
const voiceupdate = require('../lib/voiceupdate');
const convert = require('../lib/convert');
db = mongojs.connect;

// https://pantip.com/topic/38400378

const pantipURL = 'http://pantip.com'
var jar = request.jar();

exports.getPantipCategory = function (callback) {
  let category = []

  request({
    method: 'GET',
    url: pantipURL,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With',
      'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
    },
    jar: jar
  }, function (err, response, body) {
    if (err)
      callback(err)

    let $ = cheerio.load(body)

    $('.submenu-room-item').each(function (i, elem) {
      if ($(this).find('.title').text()) {
        category.push({
          title: $(this).find('.title').text(),
          description: $(this).find('.desc').text(),
          link: $(this).find('a').prop('href')
        });
      }
    });
    callback(null, category)
  });

}



exports.getComment = function (data, rowx, checkBrowser, success_p = 0, err_p = 0) {
  var start_process = new Date()
  var success_process = success_p;
  var err_process = err_p;
  var end_point_process = new Date()
  var page
  var browser
  var agentR = voiceupdate.getAgent();
  // Set up browser and page.

  try {
    // console.log(agentR);
    voiceupdate.proxyData("bing", function (proxyData) {
      (async () => {

        // console.log(proxyData);
        getComments(data, rowx, checkBrowser, proxyData)


      })();
    });

    async function getComments(data, rowx, checkBrowser, proxyData, success_p = 0, err_p = 0) {
      (async () => {

        // console.log(proxyData);

        try {
          if (proxyData == "NOT PROXY PLATFORM") {
            throw (proxyData)
          }
          voiceupdate.d("sv start pantip")
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
            var domain = row[2]
            var index_id = row[1]
            var timetostamp = row[3]


            voiceupdate.d("----- No" + (index + 1) + " : get start url :" + url)
            await page.goto(url)
            await page.waitFor(1000)


            voiceupdate.d("      clickpage pantip")

            await clickone(page)
            //  await clicktwo(page)
            //  await clickthree(page)
            // await scrolled(page)
            await page.waitFor(1000);

            try {
              await addpost(url, index_id, domain, timetostamp)
            } catch (error) {
              throw (error + " addpost err")
            }
            await page.waitFor(5000);
            try {
              await addcomment(url, index_id, domain, timetostamp)
            } catch (error) {
              throw (error + " addcomment err")
            }


            success_process++
            voiceupdate.showMemoryUsage("pantip")

          }

          await page.waitFor(1000);
          await page.close();
          await browser.close();
          end_point_process = new Date()
          voiceupdate.dSum(success_process, err_process, start_process, end_point_process, data.length);
          voiceupdate.d("----- end pantip close browser")


        } catch (error) {

          voiceupdate.d("----- Pantip ERR :" + error);
          let senderr = 200
          var keeperr = error.toString()
          if (keeperr.includes("TimeoutError")) {
            senderr = 501
          }
          await voiceupdate.readIndexChangeR(index_id, "NS : PP ERR pantip " + error + " index_id: " + index_id, senderr);

          err_process++
          // await voiceupdate.readIndexChangeR(index_id, "erro innerText for index:" + index_id)
          index++;
          browser.close()
          await getComments(data, index, true, proxyData, success_process, err_process)

        }



      })();
    }

    async function addpost(url, index_id, domain, timetostamp) {

      await page.addScriptTag({ content: `${manageindex}` });

      voiceupdate.d("      evaluate addpost")
      const rs = await page.evaluate(({ url, index_id, domain }) => {
        return manageindex(url, index_id, domain);
      }, { url, index_id, domain });

      voiceupdate.d("      addMongo rs " + rs.length)
      await setCam(url, async function (result, result1,keyword) {
        await addMongo(result, result1, keyword,index_id, rs, timetostamp, 0)
      });
    }

    async function addcomment(url, index_id, domain, timetostamp) {

      await page.addScriptTag({ content: `${manageindexcomment}` });
      let indexref;
      db.collection("voice_pantip").find({ index_id: index_id, 'typepost': 'page_post' }).toArray(function (err, resultd) {
        try {
          for (const row of resultd) {


            indexref = row._id


          }
        } catch (err) {
          throw (err)
        }
      });

      voiceupdate.d("      evaluate addcomment")

      await page.waitFor(5000)

      const rs = await page.evaluate(({ indexref, url, index_id, domain }) => {
        return manageindexcomment(indexref, url, index_id, domain);
      }, { indexref, url, index_id, domain });
      await page.waitFor(3000)
      voiceupdate.d("      addMongo rs " + rs.length)
      await setCam(url, async function (result, result1,keyword) {
        await addMongo(result, result1,keyword, index_id, rs, timetostamp, 1)
      });
    }

    async function clickone(page) {
      try {
        const aTags1 = await page.$$('.bar-paging-ed')
        for (const aTag1 of aTags1) {
          await aTag1.click('.bar-paging-ed');
          await page.waitFor(1000);
        }
        clickone(page);
      } catch (error) {
        // console.error(error);

      }

    }

    async function addMongo(camid, camset,keyword, index_id, data, timetostamp, rowx) {

      try {
        // console.log(data.length)
        if (data[rowx]) {

          db.collection("voice_pantip").find({ "voice_message": data[rowx].contenttitle }).toArray(function (err, resultcheck) {
            if (resultcheck.length > 0) {
              try {
                data[rowx]['_id'] = resultcheck[0]._id
                data[rowx]['campaign_id'] = camid
                data[rowx]['campaign_set'] = camset
                data[rowx]['keyword'] = keyword
                data[rowx]['collectdate'] = convert.dateFormat()
                data[rowx]['emotion'] = convert.engagementToInt(data[rowx]['emotion'])
                data[rowx]['like'] = convert.engagementToInt(data[rowx]['like'])
                data[rowx]['engagement'] = convert.engagementToInt(data[rowx]['like']) 
                data[rowx]['postdate'] = convert.dateFormat(data[rowx]['postdate'], "P")
                data[rowx]["postymd"] = convert.dateFormat(data[rowx]['postdate'], 'POSTYMD');

                delete data[rowx]['campaign_id'];
                delete data[rowx]['campaign_set'];
                delete data[rowx]['keyword'];

                db.collection("voice_pantip").update(
                  {
                    "_id": resultcheck[0]._id
                  },
                  {
                    $set: data[rowx]
                  },
                  { upsert: true });

              } catch (err) {
              }
            } else {
              // console.log(data.length)
              db.collection("zprimarykey_voice_pantip").findAndModify(
                {
                  query: { _id: "indexid" },
                  update: { $inc: { seq: 1 } },
                  new: true
                }, function (err, rspk) {
                  if (data.length == 1) {
                    data[0]['_id'] = rspk.seq
                    data[0]['campaign_id'] = camid
                    data[0]['campaign_set'] = camset
                    data[0]['keyword'] = keyword
                    data[0]['collectdate'] = convert.dateFormat()
                    data[0]['emotion'] = convert.engagementToInt(data[0]['emotion'])
                    data[0]['like'] = convert.engagementToInt(data[0]['like'])
                    data[0]['engagement'] = convert.engagementToInt(data[0]['like']) 

                    data[0]['postdate'] = convert.dateFormat(data[0]['postdate'], "P")

                    var d = convert.dateFormat(data[0]['postdate'], "P")

                    data[0]["postymd"] = convert.dateFormat(d, 'POSTYMD');

                    db.collection("voice_pantip").update(
                      {
                        "voice_message": data[0].contenttitle
                      },
                      {
                        $set: data[0]
                      },
                      { upsert: true });

                    // rowx++;
                  } else if (rowx <= data.length) {

                    if (data[rowx]) {

                      data[rowx]['_id'] = rspk.seq
                      data[rowx]['campaign_id'] = camid
                      data[rowx]['campaign_set'] = camset
                      data[rowx]['keyword'] = keyword
                      data[rowx]['collectdate'] = convert.dateFormat()
                      data[rowx]['emotion'] = convert.engagementToInt(data[rowx]['emotion'])
                      data[rowx]['like'] = convert.engagementToInt(data[rowx]['like'])
                      
                      data[rowx]['engagement'] = convert.engagementToInt(data[rowx]['like'])
                      data[rowx]['postdate'] = convert.dateFormat(data[rowx]['postdate'], "P")
                      data[rowx]["postymd"] = convert.dateFormat(data[rowx]['postdate'], 'POSTYMD');
 

                      db.collection("voice_pantip").update(
                        {
                          "voice_message": data[rowx].contenttitle
                        },
                        {
                          $set: data[rowx]
                        },
                        { upsert: true });

                      rowx++;
                    }
                  }
                });


            }
          });

          rowx++
          // await addMongo(camid, camset, index_id, data, timetostamp, rowx)

          setTimeout(() => {
            addMongo(camid, camset, keyword, index_id, data, timetostamp, rowx)
          }, 1000);
        } else {

          await voiceupdate.readIndexChangeY(index_id, timetostamp)
        }

      } catch (err) {
        console.error("pantip addmongo err" + err);
        await voiceupdate.readIndexChangeR(index_id, "addmongo error");

      }
    }



    async function setCam(url, callback) {
      var campaign_id = [];
      var campaign_set = [];
      var keyword = [];
      

        


      await db.collection("index_repo_campaign").find({ 'url': url }).toArray(async function (err, result) {

        for (const rs of result) {

          campaign_id.push(rs.campaign_id);

          keyword.push(rs.search_keyword[0]); 
          if (err) {
            console.log(err);
          }




          await db.collection("campaign_setkeyword").find({ 'campaign_id': rs.campaign_id, _id: rs.campaign_set[0] }).toArray(function (err, result1) {
            for (const rs1 of result1) {
              var arrPush = rs1.campaign_id + "_" + rs1._id + "_" + rs1.typeof_keyword;

              campaign_set.push(arrPush);
            }
          });
        }
        
        callback(campaign_id, campaign_set,keyword);
      });
      //CLOSE SELECT CAMPAIGN


    }




    async function manageindex(url, index_id, domain) {
      var comment = document.querySelector('div.display-post-story');
      // - 2 only
      var authors = document.querySelector('.display-post-name');
      // var countmaincomment = document.querySelector('#comments-counts');
      var like = document.querySelector('span.like-score');
      var emotion = document.querySelector('span.emotion-score');
      let passed = [];
      // var index = parseInt(document.querySelectorAll('span.like-score').length) - 1; 
      var postdates = document.querySelector('abbr[data-utime]');
      var titlePost = document.querySelector('.display-post-title');


      var tkeepArr = {};

      tkeepArr["_id"] = 0;
      tkeepArr["voice_refid"] = "";
      tkeepArr["index_id"] = index_id;
      tkeepArr["domain"] = domain;
      tkeepArr["directurl"] = url;
      tkeepArr["subject"] = titlePost.innerText; 
      tkeepArr["engagement"] = 0 
      tkeepArr["voice_message"] = comment.innerText;
      tkeepArr["author"] = authors.innerText;
      tkeepArr["like"] = like.innerText;
      tkeepArr["emotion"] = emotion.innerText;
      tkeepArr["postdate"] = postdates.attributes[1].value;
      tkeepArr["collectdate"] = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      tkeepArr["sourcetype"] = "webpantip";
      tkeepArr["typepost"] = "page_post";
      tkeepArr["postymd"] = "";
      passed.push(tkeepArr);
      // return passed

      return passed;
    }


    async function manageindexcomment(indexref, url, index_id, domain) {

      var secComment = document.querySelector('div#comments-jsrender')

      var comment = secComment.querySelectorAll('div.display-post-story')



      // var comment = document.querySelectorAll('div.display-post-story');
      // - 2 only
      var authors = secComment.querySelectorAll('.display-post-name');
      // var countmaincomment = document.querySelector('#comments-counts');
      var like = secComment.querySelectorAll('span.like-score');
      var emotion = secComment.querySelectorAll('span.emotion-score');
      let passed = [];
      // var index = parseInt(document.querySelectorAll('span.like-score').length) - 1;
      // var parentid = secComment.querySelectorAll('span.display-post-number');
      var postdates = secComment.querySelectorAll('abbr[data-utime]');
      var titlePost = document.querySelector('.display-post-title');

      var i = 0;
      for (var ii = 0; ii < comment.length; ii++) {

        var keepArr = {};
        keepArr["_id"] = 0;
        keepArr["voice_refid"] = indexref;
        keepArr["index_id"] = index_id;
        keepArr["domain"] = domain;
        keepArr["directurl"] = url;
        keepArr["subject"] = titlePost.innerText;
        keepArr["engagement"] = 0 
        keepArr["voice_message"] = comment[ii].innerText;
        keepArr["author"] = authors[ii].innerText;
        keepArr["like"] = like[ii].innerText;
        keepArr["emotion"] = emotion[ii].innerText;
        keepArr["postdate"] = postdates[ii].attributes[1].value;
        keepArr["collectdate"] = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        keepArr["sourcetype"] = "webpantip";
        keepArr["typepost"] = "user_comment";
        keepArr["postymd"] = "";

        i++;
        passed.push(keepArr);

      }



      return passed;
    }


  } catch (err) {
    console.error("show error")
    console.error(err);
  }



}



exports.getTopiclist = function (url, callback) {


  (async () => {
    // Set up browser and page.
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    page.setViewport({ width: 1280, height: 926 });

    await page.goto(url)


    await scrolled(page);


    const rs = await page.evaluate(manageindex)




    browser.close();

    callback(null, rs);

  })();


  async function scrolled(page) {
    try {
      let previousHeight;
      var ii = 1;
      while (ii <= 10) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(1000, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await page.waitFor(1000);
        ii++;
      }
    } catch (e) { }
  }





  async function manageindex() {
    var passed = [];

    const posts = document.querySelectorAll('.post-item-title');
    ii = 0;
    i = 1;
    for (var post of posts) {
      var link = document.querySelectorAll('.post-item-title a')[ii];

      // check index href
      if (link.attributes[1].value == "_blank") {
        var linkurl = "https://www.pantip.com" + link.attributes[0].value;
      } else {
        var str = link.attributes[1].value;
        var res = str.match(/https:/);
        if (!res) {
          var linkurl = "https://www.pantip.com" + link.attributes[1].value;
        } else {
          var linkurl = link.attributes[1].value;
        }

      }
      // check index href close

      passed.push({
        index_id: i,
        index_type: "C",
        campaign_id: 1,
        keyword: "หมา",
        title: post.innerText,
        domain: "https://www.pantip.com",
        url: linkurl,
        platform: "webpantip",
        readindex: "N",
        readindexdate: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        collect_rate: 9.5,
        collect_minute: 10
      });
      ii++;
      i++;

    }


    return passed;
  }



}



exports.getSearchForKeyword = function (data, rowx) {

  (async () => {
    // Set up browser and page.
    voiceupdate.d("sv start pantip get index")
    voiceupdate.d("total : " + data.length);

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    page.setViewport({ width: 1280, height: 926 });

    // ล็อกอิิน
    for (var index = rowx; index < data.length; index++) {
      // for (var index = rowx; index < 1; index++) {
      var row = data[index];
      var campaign_set = row[0]
      var campaign_id = row[1]
      var keyword = row[2]
      var startCmp = row[3]
      var first = row[4]

      voiceupdate.d("----- No" + (index + 1) + " : get start keyword :" + keyword)
      await page.goto("https://pantip.com/tag/" + keyword)
      await page.waitFor(2000);

      var key = []

      key.push(keyword)

      await page.addScriptTag({ content: `${manageIndex}` });
      const rs = await page.evaluate(({ campaign_id, key }) => {
        return manageIndex(campaign_id, key);
      }, { campaign_id, key });

      if (rs == "error404") {
        voiceupdate.d("     search keyword not data for pantip: " + keyword)

      } else {
        voiceupdate.d("      create index_repo_search ")
        voiceupdate.updateIndexRepoSearch(rs, campaign_set, 0)

        await page.waitFor(2000);
        voiceupdate.d("     scroller page Pantip")
        var fin = await scrolled(page, campaign_set, campaign_id, key, first,startCmp)
      }
    }

    voiceupdate.showMemoryUsage("pantip")
    voiceupdate.d("     end pantip close page for TYPE PAGE")
    await browser.close();

    // console.log("end pantip close page for TYPE PAGE");
  })();


  async function scrolled(page, campaign_set, campaign_id, key, first,startCmp) {
    try {
      let previousHeight;
      var ii = 1;
      let row = 50;
      // while (ii <= 10) {

        // const aTags = await page.$('div.PermalinkOverlay-modal')
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await page.waitFor(1000);

        await page.addScriptTag({ content: `${manageIndex}` });
        const rs = await page.evaluate(({ campaign_id, key }) => {
          return manageIndex(campaign_id, key);
        }, { campaign_id, key });

        await page.waitFor(500);

        row = (rs.length - 50)
        voiceupdate.d("      create index_repo_search ")
        voiceupdate.updateIndexRepoSearch(rs, campaign_set, row)

        await page.waitFor(2000);
        await page.addScriptTag({ content: `${checkdate}` });
        const rsCheckBrak = await page.evaluate(({ startCmp ,first }) => {
          return checkdate(startCmp ,first);
        }, { startCmp ,first});
        // const rsCheckBrak = await page.evaluate(checkdate);

        await page.waitFor(500);

        console.log(rsCheckBrak);
        if (!rsCheckBrak) {
          console.log(rs);
          return true
        } else {
          // contIndex = contIndex + 1;

          // const clickbtn = await page.$$("div.loadmore-bar>a")
          
          //   if (clickbtn[0]) {

 
          //       await clickbtn[0].click()
                 
  
             
  
  
              
          //   }  
          scrolled(page, campaign_set, campaign_id, key, first,startCmp)
          




        }
      // }


    } catch (e) {
      throw (e)
    }
  }

  async function checkdate(startCmp,first) {
    // var contents = document.querySelectorAll('.timeago')
    var contents = document.querySelectorAll('abbr[data-utime]')
    for (const content of contents) {
      // var date = content.querySelector('abbr.data-utime')
      var datePan = new Date(content.attributes[1].value).getTime()
      
      var date = new Date(startCmp)
      var datas = date.setMonth(date.getMonth()-1)
      var date = new Date(datas)
      var datestop = date.getTime()

      if (first == 1){
        date = new Date()
      datas = date.setDate(date.getDate()-1)
      date = new Date(datas)
      datestop = date.getTime()
     }  
    


      datestop = parseInt(datestop);

      if (parseInt(datePan) <= datestop) {
        return false;
      } else {
        return true
      }
    }

  } 


  function manageIndex(campaign_id, keyword) {

    try {
      var passed = [];
      var keepArr = {};


      const non_posts = document.querySelector('.callback-status');

      if (non_posts) {

        return "error404"

      } else {

        const posts = document.querySelectorAll('.post-item-title');

        ii = 0;
        i = 1;
        for (var post of posts) {
          var link = document.querySelectorAll('.post-item-title a')[ii];

          // check index href
          if (link.attributes[1].value == "_blank") {
            var linkurl = "https://www.pantip.com" + link.attributes[0].value;
          } else {
            var str = link.attributes[1].value;
            var res = str.match(/https:/);
            if (!res) {
              var linkurl = "https://www.pantip.com" + link.attributes[1].value;
            } else {
              var linkurl = link.attributes[1].value;
            }
          }

          keepArr = {};

          keepArr["campaign_id"] = campaign_id;
          keepArr["search_keyword"] = keyword;
          keepArr["title_search"] = post.innerText,
            keepArr["domain"] = "pantip.com";
          keepArr["url"] = linkurl
          keepArr["platform"] = "pantip";

          passed.push(keepArr)


          ii++;
          i++;


        }


        return passed;
      }
    } catch (error) {
      console.log("ManageIndex Catch")
      console.log(error);

    }
  }



}
