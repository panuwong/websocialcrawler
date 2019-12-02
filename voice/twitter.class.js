'use strict';

const puppeteer = require('puppeteer');
const convert = require('../lib/convert');
const mongojs = require('../configDB/db');

const db = mongojs.connect;


const LibVoice = require('../lib/lib.class');
const voiceupdate = new LibVoice()
let pages
let index_ids
let index_id
class Twitter {

  constructor() {
    // console.log("start class")

  }

  async startSearch(data, rowx) {

    // Set up browser and page.
    voiceupdate.d("sv start twitter get index")
    voiceupdate.d("total : " + data.length);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    var page = await browser.newPage();
    await page.setRequestInterception(true);
    // await page.on('error', (err) => {
    //   console.log(`Puppetter error occurred on ${req.originalUrl}: ${err}`)
    //   browser.close();
    // })
    // await page.on('pageerror', (pageerr) => {
    //   console.log(`Puppetter pageerror occurred on ${req.originalUrl}: ${pageerr}`)
    //   browser.close();
    // })

    await page.on('request', (request) => {
      if (request.resourceType() === 'image') {
        // console.log("abort jpeg "+request.resourceType());

        request.abort();
      } else {

        // console.log("continue "+request.resourceType());
        request.continue();
      }
    });
    await page.setViewport({ width: 1280, height: 540 });

    await page.waitFor(2000);
    // ล็อกอิิน

    await this.getSearch(data, rowx, browser, page, browser.process().pid)




    // console.log("end twitter close page for TYPE PAGE");
  }


  async getSearch(data, rowx, browser, page, pid) {
    // for (let index = rowx; index < data.length; index++) {

    console.log(pid);
    try {
      if (data[rowx]) {

        let row = data[rowx];
        console.log(row)
        let campaign_set = row[0]
        let campaign_id = row[1]
        let keyword = row[2]
        var startCmp = row[3]
        let first = row[4]

        voiceupdate.d("----- No" + (rowx + 1) + " : get start keyword :" + keyword)
        await page.goto("https://twitter.com/search?q=" + keyword, { waitUntil: 'networkidle2' })


        let key = []

        key.push(keyword)

        const rs = await page.evaluate(manageIndex)

        let dataR = []

        for (let index = 0; index < rs.length; index++) {
          let row = rs[index]
          let keepArr = {};
          keepArr['campaign_id'] = campaign_id
          keepArr['search_keyword'] = key
          row = { ...row, ...keepArr };
          dataR.push(row)
        }
        // console.log(dataR.length);

        voiceupdate.d("      create index_repo_search keyword :" + keyword)
        // new LibVoice().updateIndexRepoSearch(dataR, campaign_set, 0)



        const scrollable_section = '.SearchEmptyTimeline-emptyTitle';
        await page.waitFor(1500);
        const check = await page.evaluate(selector => {
          return new Promise(async function (resovle, reject) {
            const select = document.querySelector(selector);
            // resovle( select)
            // scrollableSection.scrollTo(1000, scrollableSection.scrollHeight);
            if (select) {
              resovle(false)
            } else {
              resovle(true)
            }
          })

        }, scrollable_section);
        await page.waitFor(1500);
        // console.log(check)
        var dScrolled = "end"
        if (check) {
          await page.waitFor(2000);
          voiceupdate.d("     scroller page Twitter")
          try {

            dScrolled = await scrolled(page, campaign_set, campaign_id, startCmp, first, key);
            var secone = await page.$('.AdaptiveFiltersBar-nav>li:nth-child(2)')

            var aTags = await secone.$('a')
            await aTags.click()
            voiceupdate.d('     last')
            dScrolled = await scrolled(page, campaign_set, campaign_id, startCmp, first, key);
            var secone = await page.$('.AdaptiveFiltersBar-nav>li:nth-child(5)')

            var aTags = await secone.$('a')
            await aTags.click()
            voiceupdate.d('     video')

            dScrolled = await scrolled(page, campaign_set, campaign_id, startCmp, first, key);
            var secone = await page.$('.AdaptiveFiltersBar-nav>li:nth-child(6)')

            var aTags = await secone.$('a')
            await aTags.click()
            voiceupdate.d('     news')

            dScrolled = await scrolled(page, campaign_set, campaign_id, startCmp, first, key);
            var secone = await page.$('.AdaptiveFiltersBar-nav>li:nth-child(7)')

            var aTags = await secone.$('a')
            await aTags.click()
            voiceupdate.d('     broadcast')
            dScrolled = await scrolled(page, campaign_set, campaign_id, startCmp, first, key);

            if (dScrolled == "end") {

              rowx++
              this.getSearch(data, rowx, browser, page, pid)
              return
            }


          } catch (error) {
            throw ("ERR: dScrolled ->" + error)
          }


        }



      } else {
        voiceupdate.showMemoryUsage("twitter")
        voiceupdate.d("     end twitter close page for TYPE PAGE")

      }

      function manageIndex() {

        try {
          let passed = [];
          let keepArr = {};

          let linkTw = document.querySelectorAll('div.tweet');



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

      async function scrolled(page, campaign_set, campaign_id, startCmp, first, key, reCheckDate = false) {


        return new Promise(async function (resolveMain, reject) {


          var previousHeight;
          var checkLoop = true;
          let row = 20;
          var sH
          var d = 0
          previousHeight = await page.evaluate('document.body.scrollHeight');
          do {


            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await page.waitFor(500);

            sH = await page.evaluate('document.body.scrollHeight');
            if (d > 2) {
              if (sH <= previousHeight) {
                resolveMain("end")
              }
            }
            // await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
            await page.waitFor(1000);

            var rs2 = await page.evaluate(manageIndex)
            let dataR = []

            for (let index = 0; index < rs2.length; index++) {
              let rows = rs2[index]
              let keepArr = {};
              keepArr['campaign_id'] = campaign_id
              keepArr['search_keyword'] = key
              rows = { ...rows, ...keepArr };
              dataR.push(rows)
            }
            row = (dataR.length - 20)
            voiceupdate.d("      create index_repo_search ")
            new LibVoice().updateIndexRepoSearch(dataR, campaign_set, row)

            // console.log("reCheckDate do startCmp" + startCmp);
            await page.waitFor(1500);
            reCheckDate = await page.evaluate(startCmp => {
              return new Promise(async function (resovle, reject) {


                let contents = document.querySelectorAll('span[data-time]')
                for (const content of contents) {
                  let date = content
                  var d = new Date(startCmp)
                  var datas = d.setMonth(d.getMonth() - 2)
                  var ds = new Date(datas)
                  var datestop = ds.getTime()
                  datestop = parseInt(datestop);
                  if (parseInt(date.attributes[3].value) <= datestop) {
                    resovle(true);
                  }
                }

                resovle(false)

              })

            }, startCmp);


            // console.log("Recheck " + reCheckDate);

            if (reCheckDate) {

              resolveMain("end")
              break
            }
            checkLoop = !reCheckDate
            d++
            if (d > 10) {
              resolveMain("end")
              break
            }

          } while (checkLoop);


        })
      }

    } catch (error) {
      voiceupdate.showMemoryUsage("twitter")
      voiceupdate.showMemoryUsage("Err :" + error)
      voiceupdate.d("     end twitter close page for TYPE PAGE")




    }
    finally {
      console.log('     Close pid:' + pid);

      browser.close();

      // process.kill(browser.process().pid)
    }




  }


  ////////////////////////////////////// start voice

  async start_voice(data, rowx, checkBrowser, success_p = 0, err_p = 0) {
    // let url = result[index].url;

    voiceupdate.d("total : " + data.length);
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox']
    });

    pages = await browser.newPage();
    const bpid = browser.process().pid;

    await pages.on('request', (request) => {
      if (request.resourceType() === 'image') {
        request.abort();
      } else {
        request.continue();
      }
    });

    await pages.setViewport({ width: 1280, height: 540 });
    await pages.setRequestInterception(true);
    var start_process = new Date()
    await this.getDataTwN(start_process, data, rowx, success_p, err_p, browser, pages);



    // console.log('#--------Closed Job ' + index + ' on Browser ' + browser.process().pid + ' ------------------');
  }


  async getDataTwN(start_process, data, rowx, success_p = 0, err_p = 0, browser, page) {

    let index = rowx
    try {
      if (data[index]) {
        try {
          // await voiceupdate.updateStatus(data, index, async function (result) {
          let re = await voiceupdate.updateStatus(data, index)
          // setTimeout(async () => {

          // var resultEva = await evaluateData(start_process, re, data, index, success_p, err_p, url, index_id, timetostamp, browser, page)

          if (re) {

            const row = data[index];
            const url = row[0]
            index_id = row[1]
            const timetostamp = row[2]

            index_ids = index_id
            voiceupdate.d("----- No" + (index + 1) + " : get start url :" + url)
            // await page.goto(url, {waitUntil: 'networkidle2'}, {waitUntil: 'domcontentloaded'});
            await page.goto(url, { waitUntil: 'networkidle2' });
            voiceupdate.d("     goto Url Twitter")
            // await page.waitFor(2000);
            voiceupdate.d("     scroller page Twitter")
            await this.scrolled(page);
            // await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

            const dataCamp = await Promise.all([[url, index_id]].map(this.camp))

            const dataCamps = dataCamp[0][0]
            // console.log(dataCamps)
            const evalu_post = await page.evaluate(dataCamp => {
              return new Promise(async function (resovle, reject) {
                try {
                  let passed = [];


                  let postData = document.querySelector('div.permalink-inner>div.tweet')



                  const engatmentpost = postData.querySelector('div.stream-item-footer>div.ProfileTweet-actionList')

                  let commentEnPost = engatmentpost.querySelector('.ProfileTweet-action--reply')
                  let retweetEnPost = engatmentpost.querySelector('.ProfileTweet-action--retweet')
                  let likeEnPost = engatmentpost.querySelector('.ProfileTweet-action--favorite')

                  const profile = postData.querySelector('div.content>div>a');

                  let converName = profile.querySelector('span>strong.fullname');
                  let profileImg = profile.querySelector('img.js-action-profile-avatar');


                  let converPost = postData.querySelector('div.js-tweet-text-container>p');
                  let converTime = postData.querySelector('div.content>div>small>a');


                  retweetEnPost = retweetEnPost.querySelector('button>span').innerText
                  retweetEnPost = (retweetEnPost != '') ? parseInt(retweetEnPost) : 0
                  likeEnPost = likeEnPost.querySelector('button>span').innerText
                  likeEnPost = (likeEnPost != '') ? parseInt(likeEnPost) : 0
                  commentEnPost = commentEnPost.querySelector('button>span').innerText
                  commentEnPost = (commentEnPost != '') ? parseInt(commentEnPost) : 0

                  let fkeepArr = {};
                  fkeepArr["typepost"] = "page_post";
                  fkeepArr["tw_id"] = postData.attributes[1].value;
                  fkeepArr["postby_name"] = converName.innerText;
                  fkeepArr["postby_picture"] = profileImg.src;
                  fkeepArr["voice_message"] = converPost.innerText;
                  fkeepArr["retweet"] = retweetEnPost
                  fkeepArr["like"] = likeEnPost
                  fkeepArr["engagement"] = likeEnPost
                  fkeepArr["comment"] = commentEnPost
                  fkeepArr["likepost"] = likeEnPost
                  fkeepArr["postdate"] = converTime.attributes[2].value;
                  fkeepArr["voice_refid"] = "";
                  fkeepArr["source_type"] = "twitter";
                  fkeepArr["directurl"] = dataCamp[0];

                  fkeepArr["campaign_id"] = dataCamp[2];
                  fkeepArr["campaign_set"] = dataCamp[4];
                  fkeepArr["keyword"] = dataCamp[3];

                  fkeepArr["index_id"] = dataCamp[1];



                  passed.push(fkeepArr);

                  resovle(passed);
                } catch (error) {
                  reject("post" + error)
                }


              })

            }, dataCamps);

            voiceupdate.d("      to mongo post")
            // const ref_id = await this.ToMongo(evalu_post, 0, 0, "post");

            const ref_id = await Promise.all(evalu_post.map(this.ToMongo))

            // console.log(ref_id);

            dataCamps.push(ref_id[0][0]);

            const evalu_comment = await page.evaluate(dataCamp => {
              return new Promise(async function (resovle, reject) {
                try {
                  let passed = [];


                  let postData = document.querySelector('div.permalink-inner>div.tweet')
                  const engatmentpost = postData.querySelector('div.stream-item-footer>div.ProfileTweet-actionList')
                  let likeEnPost = engatmentpost.querySelector('.ProfileTweet-action--favorite')


                  likeEnPost = likeEnPost.querySelector('button>span').innerText
                  likeEnPost = (likeEnPost != '') ? parseInt(likeEnPost) : 0

                  let fkeepArr = {};
                  fkeepArr["likepost"] = likeEnPost


                  const commentPromise = new Promise(function (resolveCom, reject) {
                    try {
                      const mainComment = document.querySelectorAll('li.js-stream-item>div.tweet')
                      if (mainComment.length > 0) {
                        let keepArr = {};
                        for (const commenntData of mainComment) {
                          const tw_idC = commenntData
                          const engatementCommentc = commenntData.querySelector('div.content>div.stream-item-footer>div.ProfileTweet-actionList')
                          let commentEnC = engatementCommentc.querySelector('.ProfileTweet-action--reply')
                          let retweetEnC = engatementCommentc.querySelector('.ProfileTweet-action--retweet')
                          let likeEnC = engatementCommentc.querySelector('.ProfileTweet-action--favorite')

                          const profileC = commenntData.querySelector('div.content>div>a');
                          const converNameC = profileC.querySelector('span>strong.fullname');
                          const profileImgC = profileC.querySelector('img.js-action-profile-avatar');


                          const converPostC = commenntData.querySelector('div.content>div>p');
                          const converTimeC = commenntData.querySelector('div.content>div>small>a');


                          retweetEnC = retweetEnC.querySelector('button>span').innerText
                          retweetEnC = (retweetEnC != '') ? parseInt(retweetEnC) : 0
                          likeEnC = likeEnC.querySelector('button>span').innerText
                          likeEnC = (likeEnC != '') ? parseInt(likeEnC) : 0
                          commentEnC = commentEnC.querySelector('button>span').innerText
                          commentEnC = (commentEnC != '') ? parseInt(commentEnC) : 0

                          keepArr["typepost"] = "page_comment";
                          keepArr["tw_id"] = tw_idC.attributes[1].value;
                          keepArr["postby_name"] = converNameC.innerText;
                          keepArr["postby_picture"] = profileImgC.src;
                          keepArr["voice_message"] = converPostC.innerText;
                          keepArr["retweet"] = retweetEnC
                          keepArr["like"] = likeEnC
                          keepArr["engagement"] = likeEnC
                          keepArr["comment"] = commentEnC
                          keepArr["likepost"] = likeEnPost
                          keepArr["postdate"] = converTimeC.attributes[2].value;
                          keepArr["voice_refid"] = dataCamp[5];
                          keepArr["source_type"] = "twitter";
                          keepArr["directurl"] = dataCamp[0];
                          keepArr["index_id"] = dataCamp[1];

                          if (keepArr["voice_message"].includes(dataCamp[3][0])) {
                            keepArr["campaign_id"] = dataCamp[2];;
                            keepArr["campaign_set"] = dataCamp[4];;
                            keepArr["keyword"] = dataCamp[3];;
                          } else {

                            keepArr["campaign_id"] = '';
                            keepArr["campaign_set"] = '';
                            keepArr["keyword"] = '';
                          }

                          passed.push(keepArr);
                        }
                      }
                      resolveCom(passed)
                    } catch (error) {
                      reject("comment" + error)
                    }

                  })


                  resovle(commentPromise);
                } catch (error) {
                  reject("post" + error)
                }


              })

            }, dataCamps);

            if (evalu_comment.length > 0) {
              voiceupdate.d("      to mongo comment")
              const ref_id_comment = await Promise.all(evalu_comment.map(this.ToMongo))

              // console.log(ref_id_comment);

            }

            await voiceupdate.readIndexChangeY(ref_id[0][1], timetostamp)
            if (ref_id[0][1]) {
              success_p++

              voiceupdate.showMemoryUsage("twitter")
              index++

              await this.getDataTwN(start_process, data, index, success_p, err_p, browser, page)
            }

          } else {
            const row = data[index];
            const url = row[0]
            // index_id = row[1]
            voiceupdate.d("----- skip " + (index + 1) + " : get start url :" + url + " readrindex R")
            index++

            await this.getDataTwN(start_process, data, index, success_p, err_p, browser, page)
          }

        } catch (error) {
          throw (error)
        }
      } else {

        voiceupdate.d("     TW end procress")

        browser.close();
        var end_point_process = new Date()
        voiceupdate.dSum(success_p, err_p, start_process, end_point_process, data.length);

        voiceupdate.d("----- end TW close browser")
      }
    } catch (e) {

      console.error(e)

      let senderr = 200
      var keeperr = e.toString()
      if (keeperr.includes("TimeoutError")) {
        senderr = 501
      }

      await voiceupdate.readIndexChangeR(index_id, "NS : PP ERR tw " + e + " index_id: " + index_id, senderr);
      // browser.close();
      err_p++
      rowx++;
      this.getDataTwN(start_process, data, rowx, success_p, err_p, browser, page)



    }

  }


  camp(datas) {

    return new Promise(async function (resolve, reject) {
      var campaign_id = [];
      var campaign_set = [];

      const arr = []
      var keyword = [];



      arr.push(datas[0])
      arr.push(datas[1])
      db.collection("index_repo_campaign").find({ "url": datas[0] }).toArray(async function (err, result) {
        //
        for (const rs of result) {
          campaign_id.push(rs.campaign_id);

          keyword.push(rs.search_keyword[0]);

          db.collection("campaign_setkeyword").find({ 'campaign_id': rs.campaign_id, _id: rs.campaign_set[0] }).toArray(function (err, result1) {
            for (const rs1 of result1) {
              var arrPush = rs1.campaign_id + "_" + rs1._id + "_" + rs1.typeof_keyword;

              campaign_set.push(arrPush);

            }

            arr.push(campaign_set)
            resolve([arr])
          });

          // if (campaign_set) {
            arr.push(campaign_id)
            arr.push(keyword)

          // }

        }
      });






    });
  }



  async scrolled(page) {
    try {

      var ii = 1;

      const scrollable_section = 'div#permalink-overlay';

      if (scrollable_section) {
        while (ii <= 11) {

          await page.waitFor(100);
          await page.evaluate(selector => {
            const scrollableSection = document.querySelector(selector);

            scrollableSection.scrollTo(1000, scrollableSection.scrollHeight);


          }, scrollable_section);


          await page.waitFor(100);
          ii++;

        }
      }







    } catch (e) {

      throw "scrollTo Error"

    }
  }




  ToMongo(data) {
    return new Promise(function (resolve, reject) {
      try {

        // if (data[rowx]) {
        db.collection("zprimarykey_voice_twitter").findAndModify(
          {
            query: { _id: "indexid" },
            update: { $inc: { seq: 1 } },
            new: true
          },
          function (err, result) {

            const d = data
            // console.log(data[rowx]);
            if (typeof d !== "undefined") {

              // d["directurl"] = url;
              d["_id"] = result.seq
              d["like"] = convert.engagementToInt(d["like"])
              d['engagement'] = convert.engagementToInt(d['engagement'])
              d["comment"] = convert.engagementToInt(d["comment"])
              d["likepost"] = convert.engagementToInt(d["likepost"])
              d["retweet"] = convert.engagementToInt(d["retweet"])
              d["postdate"] = convert.dateFormat(d["postdate"], "tw");
              d["collectdata"] = convert.dateFormat()
              d["postymd"] = convert.dateFormat(d["postdate"], 'POSTYMD');

            }

            db.collection("voice_twitter").update(
              {
                "tw_id": d["tw_id"]
              },
              {
                $set: d
              },
              { upsert: true });



            resolve([result.seq, d["index_id"]])

            // console.log(data[rowx]); 
          });  //ปิด findAndModify

        // }

      } catch (err) {
        voiceupdate.d("      err: Add data to mongodb and Restatus")

        reject("err: Add data to mongodb Page Twitter Field")
      }
    })



  } // end to mongo


}


module.exports = Twitter;