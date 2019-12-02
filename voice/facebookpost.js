const puppeteer = require('puppeteer');
const mongojs = require('../configDB/db');
db = mongojs.connect;
const convert = require('../lib/convert');
const voiceupdate = require('../lib/voiceupdate');

const index_collection = "index_repo_campaign"
const voice_collection = "voice_facebook"


exports.getSinglePostOnly = function (data, rowx) {

  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log("Total : " + data.length);

  let browser
  let page
  let agentR = voiceupdate.getAgent();
  voiceupdate.proxyData("facebook", function (proxyData) {



    getSinglePostOnlys(data, rowx, proxyData);



  });

  async function getSinglePostOnlys(data, rowx, proxyData) {
    (async () => {
      try {

        browser = await puppeteer.launch({
          headless: true,
          args: [
            // '--proxy-server='+proxyData[0],    
            '--no-sandbox',
            '--disable-setuid-sandbox'],
        });

        page = await browser.newPage();
        // page.on('console', consoleObj => console.log(c`onsoleObj.text()));
        // await page.setUserAgent(agentR);
        // await page.authenticate({username:proxyData[1], password:proxyData[2]});
        page.setViewport({ width: 1280, height: 1800 });
        // await page.setRequestInterception(true);
        // page.on('request', (request) => {
        //   if (request.resourceType() === 'image') {
        //     request.abort();
        //   } else {
        //     request.continue();
        //   }
        // });

        var fbuser = "noppadorn24@gmail.com"
        var fbpass = "Nop31252369ptr"
        // ล็อกอิิน
        // await db.collection("master_facebook").find({ 'status': 'Y' }).sort({ count: 1 }).limit(1).toArray(function (err, result) {
        //   if ((err)) {
        //     console.error("find user ERR .So Use Default User");
        //   }

        //   console.log(result[0].user);
        //   console.log(result[0].pass);
        //   fbuser = result[0].user
        //   fbpass = result[0].pass
        //   var countnew = parseInt(result[0].count) + 1;
        //   db.master_facebook.update({ "_id": result[0]._id },
        //     { $set: { "count": countnew } },
        //     function (err, result) {
        //       if ((err)) {
        //         console.error("Can't Plus count");
        //       }
        //     }
        //   );

        // });

        console.log("USER AUTHEN");

        console.log(" ");
        console.log(" ");
        var random = convert.randomNumber(5);
        await page.waitFor(2000 * random);
        try {
          await loginFunc(page, fbuser, fbpass);
          await page.waitFor(5000);
        } catch (err) {
          console.error(err);
          page.close()
          await loginFunc(page, fbuser, fbpass)
        }





        for (var index = rowx; index < data.length; index++) {
          var row = data[index];


          var url = row[0]
          var index_id = row[1]
          var timetostamp = row[2]

          console.log(" ");
          console.log(" ");
          console.log(" ");
          console.log(" ");
          console.log("-----OPERATION");
          console.log(" ");
          console.log("NO." + index + " OF START");
          console.log(" ");
          console.log("-----PROGRESSING");
          console.log(" ");
          var urlgo
          var str = url
          // console.log("url : " + url);
          var typelink = str.match(/[a-zA-Z0-9]+/g);
          // console.log(typelink);
          if (typelink[5] == 'posts' || typelink[6] == 'posts') {
            // var str = url;
            var checkpage = str.includes("/pg/");
            var checkpage2 = str.includes("page_internal");
            if (checkpage) {
              throw "SKIP INDEX BECAUSE NO SUPPORT"
            } else if (checkpage2) {
              throw "SKIP INDEX BECAUSE NO SUPPORT"
            } else {
              urlgo = url
            }
          } else {
            if (typelink[5] == 'photos' || typelink[6] == 'photos') {
              var str1 = url
              var typelink1 = str1.replace("/photos/", "/posts/");
              urlgo = typelink1
            } else {
              if (typelink[5] == 'videos' || typelink[6] == 'videos') {
                var str2 = url
                var typelink2 = str2.replace("/videos/", "/posts/");
                urlgo = typelink2
              } else {
                urlgo = url
              }
            }
          }
          console.log("link do it : " + urlgo);

          await page.goto(urlgo)
          await page.waitFor(5000);

          try {
            var str2 = urlgo
            var typelink2 = str2.match(/[a-zA-Z0-9]+/g);
            // console.log("Tylink2"+typelink2[6]);
            // console.log("Tylink2"+typelink2[5]);

            if (typelink2[5] === 'posts' || typelink2[6] === 'posts' && typelink[6] !== 'videos') {
              console.log('click post');
              await page.click('div')
              await page.waitFor(1000);
            } else if (typelink2[5] === 'photos' || typelink2[6] === 'photos' && typelink[6] !== 'videos') {
              console.log('click photos');
              await page.click('div')
              await page.waitFor(1000);
            } else {
              await page.click('div')
              await page.waitFor(1000);
            }
          } catch (err) {
            console.log("cant open background black post photo and other" + err);
            throw "ERR : " + err;
          }


          //===========================
          try {
            if (typelink[5] === 'videos' || typelink[6] === 'videos') {
              console.log('click close theter');
              var checkelementopen = await page.$('._xlt._418x')
              if ((checkelementopen)) {
                await page.click('._xlt._418x')
                await page.waitFor(1000);
              } else {
                await page.click('div')
                await page.waitFor(1000);
              }
            }
          } catch (err) {
            console.log("cant open background black video" + err);
            throw "ERR : " + err;
          }

         
          try {
           const result =  await voiceupdate.updateStatus(data, index)
           if (result) {
            await addpost(page, url, index_id, timetostamp);
            await page.waitFor(2000);
           } else {
            await voiceupdate.d("----- skip " + (index + 1) + " : get start url :" + url + " readrindex R")
            index++;
            browser.close()
            getSinglePostOnlys(data, index, proxyData)
           }
           
          } catch (err) {
            console.error("ERR click addpost :" + err);
            throw "add post ERR" + err;
          }

          console.log('SUCCESS CRAWLER PUSH ARRAY');
          console.log("-----END PROGRESSING ------");
          console.log(" ");





        }//ปิด for

        const used = process.memoryUsage();
        for (let key in used) {
          console.log("Facebook" + `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
        }

        browser.close();


      } catch (err) {
        console.error("PP ERR : " + err);

        let senderr = 200
        var keeperr = err.toString()
        if (keeperr.search("TimeoutError") !== -1) {
          senderr = 501
        }
        // await page.screenshot({ path: "./image/index" + index_id + err + new Date() + '.png' });
        await voiceupdate.readIndexChangeR(index_id, "NS : PP ERR Facebook " + err + " index_id: " + index_id, senderr);
        index++;
        browser.close()
        process.kill(browser.process().pid);
        await getSinglePostOnlys(data, index, proxyData)
      }finally{
        browser.close()
        process.kill(browser.process().pid);
      }







    })();
  }

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
        // page.close()
        await loginFunc(page, fbuser, fbpass)
      }
    } catch (err) {
      if ((err)) {
        // page.close()
        await loginFunc(page, fbuser, fbpass)
      }
    }
  }


  async function addpost(page, url, index_id, timetostamp) {
    try {
        await page.waitFor(4000);
        console.log('Click SHOW LIKE POST');
        const secone1 = await page.$('div[data-insertion-position="0"]')
        if (!(secone1)) {
          throw "LINK NOT AVAILABLE From ADDPOST FUNC"
        }
        const checkemo1 = await secone1.$('._3t54 > a._3emk._401_')
        if ((checkemo1)) {
          await page.click('._3t54 > a._3emk._401_');
        }
        console.log('WAITING 4s');
        await page.waitFor(4000);
        await page.addScriptTag({ content: `${managemainpost}` });

        const rs = await page.evaluate(({ url, index_id }) => {
          return managemainpost(url, index_id);
        }, { url, index_id });
        if (rs === "nocap") {
          console.log('UNSUCCESS NOCAP');
          throw "UNSUCCESS BECAUSE NOCAPTION"
        } else {
          console.log('SUCCESS CRAWLER PUSH ARRAY');
          await setCam(url, async function (result, result1, result3) {
            await addMongo(result, result1, result3, index_id, rs, timetostamp, 0)
          });
        }
    

    } catch (err) {
      console.error("Eval err add post: " + err);
      throw "Eval err add post: " + err;
    }// ปิด catch eval

  }




  async function addMongo(camid, camset, keyword, index_id, data, timetostamp, rowx) {

    try {
      var title_voice = ""
      if ((data[0]['voice_message'])) {
        title_voice = data[0]['voice_message']
      }


      if ((data[rowx])) {


        db.collection(voice_collection).find({ "voice_message": data[rowx]['voice_message'] }).toArray(function (err, resultcheck) {
          if (resultcheck.length > 0) {

            delete data[rowx]['campaign_id'];
            delete data[rowx]['campaign_set'];
            delete data[rowx]['keyword'];

            db.collection(voice_collection).update(
              {
                "_id": resultcheck._id,
              },
              {
                $set: data[rowx]
              },
              function (err, rs) {
                if (err) {
                  console.error("update mongo : " + err);
                } else {
                  // console.log("update voice_facebook Success: NO."+rowx);
                  rowx++;
                  addMongo(camid, camset, keyword, index_id, data, timetostamp, rowx)
                }
              });

          } else {



            db.collection("zprimarykey_voice_facebook").findAndModify(
              {
                query: { _id: "indexid" },
                update: { $inc: { seq: 1 } },
                new: true
              },
              function (err, result) {

                // db.collection(voice_collection).find({ "voice_id": data[rowx]['voice_id'],"voice_message": data[rowx]['voice_message'] }).toArray(function (err, resultcheck) {
                //   if (resultcheck.length > 0) {
                //     data[rowx]['voice_id'] = parseInt(data.length)+1
                //   }
                //  });

                data[rowx]['_id'] = result.seq
                data[rowx]['campaign_id'] = camid
                data[rowx]['campaign_set'] = camset
                data[rowx]['keyword'] = keyword
                data[rowx]['postdate'] = convert.dateFormat(data[rowx]['postdate'], 'FB');
                data[rowx]['postymd'] = convert.dateFormat(data[rowx]['postdate'], 'POSTYMD');
                data[rowx]['collectdata'] = convert.dateFormat();
                data[rowx]['interaction'] = convert.engagementToInt(data[rowx]['interaction']);
                data[rowx]['like'] = convert.engagementToInt(data[rowx]['like']);
                data[rowx]['reaction'] = convert.engagementToInt(data[rowx]['reaction']);
                data[rowx]['haha'] = convert.engagementToInt(data[rowx]['haha']);
                data[rowx]['sad'] = convert.engagementToInt(data[rowx]['sad']);
                data[rowx]['love'] = convert.engagementToInt(data[rowx]['love']);
                data[rowx]['share'] = convert.engagementToInt(data[rowx]['share']);
                data[rowx]['comment'] = convert.engagementToInt(data[rowx]['comment']);
                data[rowx]['engagement'] = convert.engagementToInt(data[rowx]['engagement']);
                data[rowx]['angry'] = convert.engagementToInt(data[rowx]['angry']);



                db.collection(voice_collection).insert(data[rowx], function (err, res) {
                  if (err) {
                    console.error('insert voice_facebook :' + err);
                  } else {
                    // console.log("insert voice_facebook Success: NO."+rowx);
                    rowx++;
                    addMongo(camid, camset, keyword, index_id, data, timetostamp, rowx)
                  }

                });


              });//ปิด run number mongo


          }
        });




      }//ปิด if ((main))

      voiceupdate.readIndexChangeY(index_id, timetostamp, title_voice);


    } catch (err) {
      console.log("Addmongopost ERROR EVALUATE NO DATA ANY VARIABLE");
      voiceupdate.readIndexChangeR(index_id, "NS : Evaluate ERR Facebook " + err + " index_id: " + index_id);
    }
  }



  async function setCam(url, callback) {
    var campaign_id = [];
    var campaign_set = [];
    var keyword;
    //SELECT CAMPAIGN
    await db.collection(index_collection).find({ 'url': url }).toArray(async function (err, result) {

      for (const rs of result) {

        campaign_id.push(rs.campaign_id);
        keyword = rs.search_keyword;
        if (err) {
          console.log(err);
        }


        for (const camsetcheck of rs.campaign_set) {
          await db.collection("campaign_setkeyword").find({ 'campaign_id': rs.campaign_id, '_id': camsetcheck }).toArray(function (err1, result1) {
            if (err1) {
              console.log(err1);
            }

            for (const rs1 of result1) {
              var arrPush = rs1.campaign_id + "_" + camsetcheck + "_" + rs1.typeof_keyword;
              // console.log(arrPush);

              campaign_set.push(arrPush);
            }


          });
        }
      }
      callback(campaign_id, campaign_set, keyword);
    });
    //CLOSE SELECT CAMPAIGN


  }



  async function managemainpost(url, index_id) {

    try {


      var passed = [];
      var captionname = ""
      var indexmainpost = document.querySelector('.userContent');
      var indexmainpostshow = 0;
      if (typeof indexmainpost !== "undefined" && (indexmainpost)) {
        indexmainpostshow = indexmainpost.innerText;
        if (indexmainpostshow === null || indexmainpostshow === "") {
          return "nocap";
        }
      }
      var boxsecone = document.querySelector('div[data-insertion-position="0"]');

      //Settime
      var date = boxsecone.querySelector('abbr');
      var datamonth = ['none', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      var arr = date.attributes.title.value
      var lastdatadate
      if (arr.includes('/')) {
        var keep = arr.split(',')
        var dateonly = keep[0].split('/')
        lastdatadate = "Monday, " + datamonth[dateonly[0]] + " " + dateonly[1] + ", 20" + dateonly[2] + " at" + keep[1]
      } else {
        lastdatadate = date.attributes.title.value
      }
      //End set time

      var fb_idsecone = boxsecone.querySelector("input[name='ft_ent_identifier']");
      var fbid = fb_idsecone.attributes[3].value;
      console.log("fbid : " + fbid);
      var nameposter = boxsecone.querySelector('span.fwb.fcg > a');
      if ((nameposter)) {
        nameposter = nameposter.innerText;
      } else {
        nameposter = "unknownameposter";
      }
      var comtype1 = ""
      // if (pagename==nameposter) {
      comtype1 = "page_post";
      // } else {
      // comtype1 = "user_post";
      // }
      var comment = boxsecone.querySelectorAll('div.UFICommentActorAndBodySpacing')
      var comlength = comment.length;


      var loveemo = 0;
      var likeemo = 0;
      var hahaemo = 0;
      var sademo = 0;
      var angryemo = 0;
      var wowemo = 0;
      var allemo = 0;


      if (!(comlength)) {

        var allemotion = document.querySelectorAll('ul[defaultactivetabkey]._43o4._4470 > li')[0];
        if ((allemotion)) {
          var allemokeep = allemotion.querySelector('a > span > span');
          allemo = allemokeep.innerText;
        }


        if (allemo === 0) {

          var sharesecone = document.querySelector('.userContentWrapper');
          var sharepost = sharesecone.querySelector('._ipm._2x0m');
          var sharecount = 0;
          if ((sharepost)) {
            if (sharepost.innerText.includes('Shares')) {
              sharecount = sharepost.innerText.replace('Shares', ' ');
            } else {
              sharecount = sharepost.innerText.replace('Share', ' ');
            }
          }

          passed.push({
            fb_id: fbid,//id post only
            fb_refid: 0,
            voice_refid: 0,
            index_id: index_id,
            client_competitor: "client",
            pages: document.querySelector('._64-f > span').innerText,
            voice_message: indexmainpostshow,
            directurl: url,
            typepost: "page_post",
            interaction: 0,
            like: 0,
            love: 0,
            haha: 0,
            wow: 0,
            sad: 0,
            angry: 0,
            comment: 0,
            share: sharecount,
            reaction: 0,
            engagement: 0,
            postdate: lastdatadate,
            postymd: lastdatadate,
            collectdata: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            source_type: 'facebook',
          });
          return passed;

        }




        var emotions = document.querySelectorAll('ul[defaultactivetabkey]._43o4._4470 > li');
        for (let index = 0; index < emotions.length; index++) {
          var emo = emotions[index].querySelector('a > span > span');
          if ((emo) && typeof emo !== "undefined") {
            var str = emo.attributes[0].value;
            if (str.includes("Love")) { loveemo = emo.innerText; }

            if (str.includes("Like")) { likeemo = emo.innerText; }

            if (str.includes("Haha")) { hahaemo = emo.innerText; }

            if (str.includes("Sad")) { sademo = emo.innerText; }

            if (str.includes("Wow")) { wowemo = emo.innerText; }

            if (str.includes("Angry")) { angryemo = emo.innerText; }

          } // ปิด if emo


        }// ปิด for



        var sharesecone = document.querySelector('.userContentWrapper');
        var sharepost = sharesecone.querySelector('._ipm._2x0m');
        if ((sharepost)) {
          if (sharepost.innerText.includes('Shares')) {
            sharecount = sharepost.innerText.replace('Shares', ' ');
          } else {
            sharecount = sharepost.innerText.replace('Share', ' ');
          }
        } else {
          var sharecount = 0;
        }

        passed.push({
          fb_id: fbid,//id post only
          fb_refid: 0,
          voice_refid: 0,
          index_id: index_id,
          client_competitor: "client",
          pages: document.querySelector('._64-f > span').innerText,
          voice_message: indexmainpostshow,
          directurl: url,
          typepost: "page_post",
          interaction: allemo,
          like: likeemo,
          love: loveemo,
          haha: hahaemo,
          wow: wowemo,
          sad: sademo,
          angry: angryemo,
          comment: 0,
          share: sharecount,
          reaction: allemo,
          engagement: allemo,
          postdate: lastdatadate,
          postymd: lastdatadate,
          collectdata: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
          source_type: 'facebook',
        });
        return passed;
      }



      var ii = 0;
      var i = 1;
      var iii = 0;
      var iiii = 0;


      // commenttype open
      var commenttype = document.querySelectorAll('div.UFIRow[aria-label]')[ii];
      var namecomment = commenttype.querySelector('a.UFICommentActorName');
      if ((namecomment)) {
        namecomment = namecomment.innerText;
      } else {
        namecomment = "unknowname";
      }

      var comtype = "";
      if (commenttype.attributes[3].value == "Comment") {
        if (nameposter === namecomment) {
          comtype = "page_comment";
        } else {
          comtype = "user_comment";
        }
      } else if (commenttype.attributes[3].value == "Comment reply") {
        if (nameposter === namecomment) {
          comtype = "page_reply";
        } else {
          comtype = "user_reply";
        }
      } else {
        comtype = "unknowncommenttype";
      }
      // commenttype close

      if (comtype == "page_reply" || comtype == "user_reply") {
        iii = iiii;
      } else {
        iii = 0;
      }



      if (i == 1) {
        captionname = indexmainpostshow;


        // ตัด url
        var emotion = document.querySelectorAll('ul[defaultactivetabkey]._43o4._4470 > li > a > span > span');

        var emotions = document.querySelectorAll('ul[defaultactivetabkey]._43o4._4470 > li');
        for (let index = 1; index < emotions.length; index++) {
          var emo = emotions[index].querySelector('a > span > span');
          if ((emo) && typeof emo !== "undefined") {
            var str = emo.attributes[0].value;
            if (str.includes("Love")) { var loveemo = emo.innerText; }

            if (str.includes("Like")) { var likeemo = emo.innerText; }

            if (str.includes("Haha")) { var hahaemo = emo.innerText; }

            if (str.includes("Sad")) { var sademo = emo.innerText; }

            if (str.includes("Wow")) { var wowemo = emo.innerText; }

            if (str.includes("Angry")) { var angryemo = emo.innerText; }

          } // ปิด if emo

        }// ปิด for

        var commentpost = document.querySelector('a._ipm._-56');
        var commentcount = 0;
        if ((commentpost)) {
          if (commentpost.innerText.includes('Comments')) {
            commentcount = commentpost.innerText.replace('Comments', ' ');
          } else {
            commentcount = commentpost.innerText.replace('Comment', ' ');
          }
        }
        var sharesecone = document.querySelector('.userContentWrapper');
        var sharepost = sharesecone.querySelector('._ipm._2x0m');
        sharecount = 0;
        if ((sharepost)) {
          if (sharepost.innerText.includes('Shares')) {
            sharecount = sharepost.innerText.replace('Shares', ' ');
          } else {
            sharecount = sharepost.innerText.replace('Share', ' ');
          }
        }
        passed.push({
          fb_id: fbid,//id post only
          fb_refid: 0,
          voice_refid: 0,
          index_id: index_id,
          client_competitor: "client",
          pages: document.querySelector('._64-f > span').innerText,
          voice_message: captionname,
          directurl: url,
          typepost: comtype1,
          interaction: emotion[0].innerText,
          like: likeemo,
          love: loveemo,
          haha: hahaemo,
          wow: wowemo,
          sad: sademo,
          angry: angryemo,
          comment: commentcount,
          share: sharecount,
          reaction: emotion[0].innerText,
          engagement: emotion[0].innerText,
          postdate: lastdatadate,
          postymd: lastdatadate,
          collectdata: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
          source_type: 'facebook'
        });

      }

      return passed;



    } catch (err) {

      console.error(err);

    }



  }//ปิดเมเนจ  managemainpost










}