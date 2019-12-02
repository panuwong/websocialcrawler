const puppeteer = require('puppeteer');
const mongojs = require('../configDB/db');
db = mongojs.connect;
const convert = require('../lib/convert');
const voiceupdate = require('../lib/voiceupdate');

const index_collection = "index_repo_campaign"
const voice_collection = "voice_facebook"



exports.getSingleCommentOnly = function (data, rowx) {

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



    getSingleCommentOnlys(data, rowx, proxyData);



  });

  async function getSingleCommentOnlys(data, rowx, proxyData) {
    (async () => {
      try {

        browser = await puppeteer.launch({
          headless: false,
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

        let fbuser = "noppadorn24@gmail.com"
        let fbpass = "Nop31252369ptr"
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

          //==========================
          try {
            console.log('Click Newest');
            await clicknewest(page);
            await page.waitFor(5000);
          } catch (err) {
            console.log("ERR click newest :" + err);
            throw "newest ERR" + err;
          }

          //==========================

          try {
            const result =  await voiceupdate.updateStatus(data, index)
            if (result) {
              console.log('Click MORE COMMENT');
              await clickone(page, url, index_id, timetostamp);
              console.log('WAITING 1s');
              await page.waitFor(1000);
              console.log('Click MORE REPLY');
              await clicktwo(page, url, index_id, timetostamp);
              console.log('WAITING 1s');
              await page.waitFor(1000);
            } else {
             await voiceupdate.d("----- skip " + (index + 1) + " : get start url :" + url + " readrindex R")
             index++;
             browser.close()
             getSingleCommentOnlys(data, index, proxyData)
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
        await getSingleCommentOnlys(data, index, proxyData)
      }finally{
        browser.close()
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




  async function addcommentonebyone(page, url, index_id, timetostamp) {

    try {
      await page.addScriptTag({ content: `${managesinglepost}` });
      const rs = await page.evaluate(({ url, index_id }) => {
        return managesinglepost(url, index_id);
      }, { url, index_id });
      await setCam(url, async function (result, result1, result3) {
        await addMongocom(result, result1, result3, index_id, rs, timetostamp, 0)
      });


    } catch (err) {
      console.error("Eval err Eval err addonebyone: " + err);
      const used = process.memoryUsage();
      for (let key in used) {
        console.log("Facebook" + `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
      }
      page.close();
    }// ปิด catch eval

  }



  async function addMongocom(camid, camset, keyword, index_id, data, timetostamp, rowx) {

    try {


      if ((data[rowx])) {


        await db.collection(voice_collection).find({ "voice_message": data[rowx]['voice_message'] }).toArray(async function (err, resultcheck) {
          if (resultcheck.length == 0) {


            await db.collection("zprimarykey_voice_facebook").findAndModify(
              {
                query: { _id: "indexid" },
                update: { $inc: { seq: 1 } },
                new: true
              },
              async function (err, result) {



                // console.log(data[rowx]['postdate']);

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




                if (data[rowx]['typepost'] == "user_comment" || data[rowx]['typepost'] == "page_comment") {
                  await db.collection(voice_collection).find({ "fb_id": data[rowx]['fb_id'] }).toArray(async function (err, result2) {

                    if (result2.length > 0) {


                      data[rowx]['voice_refid'] = result2[0]._id


                      await addCommentR(camid, camset, keyword, index_id, data, timetostamp, rowx)
                    } else {
                      console.log("Not Yet POST OF THIS INDEX BEFORE This FUNC GET COMMENT. SO NO INSERT DB NOW.");
                    //   data[rowx]['voice_refid'] = 888
                    }
                  });
                } else {
                  await db.collection(voice_collection).find({ "fb_refid": data[rowx]['fb_refid'] }).toArray(async function (err, result3) {


                    if (result3.length > 0) {


                      data[rowx]['voice_refid'] = result3[0]._id

                      await addCommentR(camid, camset, keyword, index_id, data, timetostamp, rowx)
                    } else {
                      data[rowx]['voice_refid'] = 999
                    }
                  });
                }




                // data[rowx] = {...data[rowx], ...keepArr};




              });//ปิด run number mongo


          }
        });




      } else {


        voiceupdate.readIndexChangeY(index_id, timetostamp);
      }
      //ปิด if ((main))




    } catch (err) {
      console.log("Addmongo ERROR EVALUATE NO DATA ANY VARIABLE ");
      voiceupdate.readIndexChangeR(index_id, "NS : Evaluate ERR Facebook " + err + " index_id: " + index_id);
    }
  }

  async function addCommentR(camid, camset, keyword, index_id, data, timetostamp, rowx) {
    await db.collection(voice_collection).insert(data[rowx], async function (err, res) {
      if (err) {
        console.error('insert voice_facebook :' + err);
      } else {
        // console.log("insert voice_facebook Success: NO."+rowx);
        await rowx++;
        addMongocom(camid, camset, keyword, index_id, data, timetostamp, rowx)

      }

    });
  }



  async function clicknewest(page) {
    var secone = await page.$('div[data-insertion-position="0"]')
    if ((secone) && typeof secone !== 'undefined' && secone !== null) {
      var aTags = await secone.$('div._3sct')
      if ((aTags) && typeof aTags !== 'undefined' && aTags !== null) {
        await aTags.click('div._3sct')
        await page.waitFor(3000);
        var checknew = page.$("li._54ni.__MenuItem:nth-child(2)")
        if ((checknew)) {
          await page.click('li._54ni.__MenuItem:nth-child(2)')
          await page.waitFor(3000);
        }
      }
    } else {
      console.log("No Btn newest");
    }
  }

  async function checkdate() {

    const secone = await document.querySelector('div[data-insertion-position="0"]')
    var contents = secone.querySelectorAll('.UFISutroCommentTimestamp')
    for (const content of contents) {
      var date = content.attributes[2].value

      var d = new Date();
      var str = d.setDate(d.getDate() - 30)
      str = str.toString();
      var datestop = str.substring(0, 10)
      datestop = parseInt(datestop);

      if (parseInt(date) <= datestop) {
        return "200";
      }
    }

  }


  async function clickone(page, url, index_id, timetostamp) {

    const secone = await page.$('div[data-insertion-position="0"]')
    if (!(secone)) {
      throw "LINK NOT AVAILABLE"
    }
    const aTags = await secone.$('a.UFIPagerLink')
    if ((aTags) && typeof aTags !== 'undefined' && aTags !== null) {
      await aTags.click('a.UFIPagerLink')
      await addcommentonebyone(page, url, index_id, timetostamp)
      await page.waitFor(1000);
      const rs = await page.evaluate(checkdate);
      if ((rs)) {
        console.log(rs);
        return;
      }
      await clickone(page, url, index_id, timetostamp)
    } else {
      await addcommentonebyone(page, url, index_id, timetostamp)
      console.log("No Btn More Comment Anymore");
    }
  }

  async function clicktwo(page, url, index_id, timetostamp) {
    try {
      const secone = await page.$('div[data-insertion-position="0"]')
      if ((secone)) {
        const aTags = await secone.$$('div.UFIReplyList')
        if ((aTags) && typeof aTags !== 'undefined' && aTags !== null) {
          for (const aTag of aTags) {
            await aTag.click('div.UFIReplyList');
            await page.waitFor(1000);
            await addcommentonebyone(page, url, index_id, timetostamp)
          }
        } else {
          console.log("No Btn More Comment Anymore");
        }
      }

    } catch (err) {
      throw "Func clicktwo Err : " + err;
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


  async function managesinglepost(url, index_id) {

    try {


      var passed = [];
      var captionname = ""
      var indexmainpost = document.querySelector('.userContent');
      var indexmainpostshow = 0;
      if (typeof indexmainpost !== "undefined" && (indexmainpost)) {
        indexmainpostshow = indexmainpost.innerText;
        if (indexmainpostshow === null && typeof indexmainpostshow === "undefined" && !(indexmainpostshow)) {
          indexmainpostshow = indexmainpost.innerHTML;
        }
      }
      var boxsecone = document.querySelector('div[data-insertion-position="0"]');
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

      console.log("comlength : " + comlength);


      if ((comlength) && comlength > 0) {

        console.log("comlength > 0");

        var ii = 0;
        var i = 1;
        var iii = 0;
        var iiii = 0;

        for (var comments of comment) {
          var date = document.querySelectorAll('.UFISutroCommentTimestamp')[ii];
          var commentid = document.querySelectorAll('.UFICommentCloseButton')[ii];
          var boxcommentrefid = boxsecone.querySelectorAll('div.UFIComment')[ii];
          var commentrefid = boxcommentrefid.querySelector('a.uiLinkSubtle');
          var fb_idsecone = boxsecone.querySelector("input[name='ft_ent_identifier']");
          var fbid = fb_idsecone.attributes[3].value;
          console.log("fbid : " + fbid);
          var addtexttoLink = commentrefid.attributes[1].value.replace('?', '/?');
          console.log("REFID : " + addtexttoLink);

          var linkArr = []
          var dataLink = addtexttoLink.split('/');
          for (var i = 0; i < dataLink.length; i++) {

            var row = dataLink[i]

            if (row.includes('comment_id')) {
              var dataComment = row.split('&');

              for (let index = 0; index < dataComment.length; index++) {
                const data = dataComment[index];
                if (data.includes('comment_id')) {

                  var comment_id = data.match(/[0-9]+/g);

                  linkArr.push(comment_id[0])
                }
              }
            }

          }
          var id1 = linkArr[0]


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

          // EMOCOMMENT
          var box = document.querySelectorAll('.UFICommentContent')[ii];
          if ((box) && typeof box !== "undefined") {
            var commentemocountall = box.querySelector('div > div > div._10lo._10lp');
            if ((commentemocountall) && typeof commentemocountall !== "undefined") {
              var showcommentemocountall = commentemocountall.innerText;// show reaction,engagement,interaction
              // start like
              var checkers = commentemocountall.querySelectorAll('a > .UFICommentReactionsBling > span > span[data-testid]');
              for (const checker of checkers) {
                var reactlike = checker.querySelector('span:nth-child(2)');
                if ((reactlike) && typeof reactlike !== "undefined" && checker.attributes[1].value === "ufi_bling_token_1") {
                  var showreactlike = reactlike.innerText;
                  break;
                } else {
                  var showreactlike = '0';
                }
              }
              // end like
              // start love
              var checkers = commentemocountall.querySelectorAll('a > .UFICommentReactionsBling > span > span[data-testid]');
              for (const checker of checkers) {
                var reactlove = checker.querySelector('span:nth-child(2)');
                if ((reactlove) && typeof reactlove !== "undefined" && checker.attributes[1].value === "ufi_bling_token_2") {
                  var showreactlove = reactlove.innerText;
                  break;
                } else {
                  var showreactlove = '0';
                }
              }
              // end love
              // start wow
              var checkers = commentemocountall.querySelectorAll('a > .UFICommentReactionsBling > span > span[data-testid]');
              for (const checker of checkers) {
                var reactwow = checker.querySelector('span:nth-child(2)');
                if ((reactwow) && typeof reactwow !== "undefined" && checker.attributes[1].value === "ufi_bling_token_3") {
                  var showreactwow = reactwow.innerText;
                  break;
                } else {
                  var showreactwow = '0';
                }
              }
              // end wow
              // start haha
              var checkers = commentemocountall.querySelectorAll('a > .UFICommentReactionsBling > span > span[data-testid]');
              for (const checker of checkers) {
                var reacthaha = checker.querySelector('span:nth-child(2)');
                if ((reacthaha) && typeof reacthaha !== "undefined" && checker.attributes[1].value === "ufi_bling_token_4") {
                  var showreacthaha = reacthaha.innerText;
                  break;
                } else {
                  var showreacthaha = '0';
                }
              }
              // end haha
              // start sad
              var checkers = commentemocountall.querySelectorAll('a > .UFICommentReactionsBling > span > span[data-testid]');
              for (const checker of checkers) {
                var reactsad = checker.querySelector('span:nth-child(2)');
                if ((reactsad) && typeof reactsad !== "undefined" && checker.attributes[1].value === "ufi_bling_token_7") {
                  var showreactsad = reactsad.innerText;
                  break;
                } else {
                  var showreactsad = '0';
                }
              }
              // end sad
              // start angry
              var checkers = commentemocountall.querySelectorAll('a > .UFICommentReactionsBling > span > span[data-testid]');
              for (const checker of checkers) {
                var reactangry = checker.querySelector('span:nth-child(2)');
                if ((reactangry) && typeof reactangry !== "undefined" && checker.attributes[1].value === "ufi_bling_token_8") {
                  var showreactangry = reactangry.innerText;
                  break;
                } else {
                  var showreactangry = '0';
                }
              }
              // end angry
            } else {
              var showcommentemocountall = '0';
              var showreactlike = '0';
              var showreactlove = '0';
              var showreactsad = '0';
              var showreacthaha = '0';
              var showreactwow = '0';
              var showreactangry = '0';
            }
          } else {
            var showcommentemocountall = '0';
          }
          // EMOCOMMENT


          if (i == 1) {

            i++;
            captionname = comments.innerText;
            passed.push({
              fb_id: fbid,//id post only
              fb_refid: id1,
              voice_refid: "",
              index_id: index_id,
              client_competitor: "client",
              pages: document.querySelector('._64-f > span').innerText,
              voice_message: captionname,
              directurl: "https://www.facebook.com" + commentrefid.attributes[1].value,
              typepost: comtype,
              interaction: showcommentemocountall,
              like: showreactlike,
              love: showreactlove,
              haha: showreacthaha,
              wow: showreactwow,
              sad: showreactsad,
              angry: showreactangry,
              comment: '0',
              share: '0',
              reaction: showcommentemocountall,
              engagement: showcommentemocountall,
              postdate: date.attributes[1].value,
              postymd: date.attributes[1].value,
              collectdata: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
              source_type: 'facebook',
            });

          } else {

            captionname = comments.innerText;

            passed.push({
              fb_id: fbid,//id post only
              fb_refid: id1,
              voice_refid: "",
              index_id: index_id,
              client_competitor: "client",
              pages: document.querySelector('._64-f > span').innerText,
              voice_message: captionname,
              directurl: "https://www.facebook.com" + commentrefid.attributes[1].value,
              typepost: comtype,
              interaction: showcommentemocountall,
              like: showreactlike,
              love: showreactlove,
              haha: showreacthaha,
              wow: showreactwow,
              sad: showreactsad,
              angry: showreactangry,
              comment: '0',
              share: '0',
              reaction: showcommentemocountall,
              engagement: showcommentemocountall,
              postdate: date.attributes[1].value,
              postymd: date.attributes[1].value,
              collectdata: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
              source_type: 'facebook',
            });
          }

          ii++;
          iiii = i;
          i++;
        }

      }


      return passed;

    } catch (err) {

      console.error("Get Comment Eval Err : " + err);

    }



  }//ปิดเมเนจ singlepost





}