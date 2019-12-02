const puppeteer = require('puppeteer');
const mongojs = require('../configDB/db');
db = mongojs.connect;
const convert = require('../lib/convert');
const voiceupdate = require('../lib/voiceupdate');

const index_collection = "index_repo_campaign_search"





exports.getPostfrommasterpagefacebook = function (data, rowx) {
  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log("Total : " + data.length);

  var browser
  var page
  var agentR = voiceupdate.getAgent();
  voiceupdate.proxyData("facebook", function (proxyData) {



    getPostfrommasterpagefacebook(data, rowx, proxyData);



  });
  async function getPostfrommasterpagefacebook(data, rowx, proxyData) {
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
        // page.on('console', consoleObj => console.log(consoleObj.text()));
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
        for (var index = rowx; index < data.length; index++) {
          var row = data[index];

          var urlold = row[0]
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


          var checkurl = url.substr(url.length - 1, 1)
          if (checkurl.search('/') === -1) {
            url += '/posts/?ref=page_internal'
          } else {
            url += 'posts/?ref=page_internal'
          }
          console.log(url)

          var random = convert.randomNumber(5);
          await page.waitFor(2000 * random);
          await page.goto(url)
          await page.waitFor(4000);


          await scrolled(page);


          //==========================
          try {
            await page.addScriptTag({ content: `${manageindex}` });
            var rs = await page.evaluate(({ url, index_id }) => {
              return manageindex(url, index_id);
            }, { url, index_id });
            // await setCam(urlold, async function (result, result1, result2) {
              await addMongo( index_id, rs, timetostamp, 0)
            // });


          } catch (err) {
            console.error("Eval err : " + err);
            const used = process.memoryUsage();
            for (let key in used) {
              console.log("Facebook" + `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
            }
            page.close()
          }// ปิด catch eval

        }//ปิด for

        const used = process.memoryUsage();
        for (let key in used) {
          console.log("Facebook" + `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
        }

        browser.close();

      } catch (err) {
        console.error("PP ERR FB PAGE : " + err);

        let senderr = 200
        var keeperr = err.toString()
        if (keeperr.search("TimeoutError") !== -1) {
          senderr = 501
        }
        await voiceupdate.readIndexChangeR(index_id, "NS : PP ERR Facebook PAGE" + err + " index_id: " + index_id, senderr);
        index++;
        browser.close()
        await getPostfrommasterpagefacebook(data, index, proxyData)

      }//ปิด catch ใหญ่

    })();
  }

  async function scrolled(page) {
    try {
      let previousHeight;
      var ii = 1;
      while (ii < 50) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await page.waitFor(10);
        const rs = await page.evaluate(checkdate);
        if ((rs)) {
          console.log(rs);
          break;
        }
        ii++;
      }
    } catch (e) { }
  }


  async function checkdate() {
    var contents = document.querySelectorAll('.userContentWrapper')
    for (const content of contents) {
      var date = content.querySelector('abbr._5ptz')
      var d = new Date();
      var str = d.setDate(d.getDate() - 30)
      str = str.toString();
      var datestop = str.substring(0, 10)
      datestop = parseInt(datestop);
      if (parseInt(date.attributes[1].value) <= datestop) {
        return "200";
      }
    }

  }

  async function addMongo( index_id, data, timetostamp, rowx) {

    try {


      if ((data[rowx])) {


        db.collection(index_collection).find({ "url": data[rowx]['url'] }).toArray(function (err, resultcheck) {
          if (resultcheck.length > 0) {

            db.collection(index_collection).update(
              {
                "_id": resultcheck._id,
              },
              {
                $set: data[rowx]
              },
              function (err, rs) {
                if (err) {
                  console.error("update mongo index_repo_campaign : " + err);
                } else {
                  // console.log("update voice_facebook Success: NO."+rowx);
                  rowx++;
                  addMongo( index_id, data, rowx)
                }
              });

          } else {


            db.collection("zprimarykey_index_repo_campaign").findAndModify(
              {
                query: { _id: "indexid" },
                update: { $inc: { seq: 1 } },
                new: true
              },
              function (err, result) {
                data[rowx]['_id'] = result.seq
                data[rowx]['campaign_id'] = ""
                data[rowx]['campaign_set'] = ""
                data[rowx]['search_keyword'] = search_keyword
                data[rowx]['readindexdate'] = convert.dateFormat();
                data[rowx]['createdate'] = convert.dateFormat();
                data[rowx]['createymd'] = convert.dateFormat(convert.dateFormat(), 'POSTYMD');
                data[rowx]['updatedate'] = convert.dateFormat();




                db.collection(index_collection).insert(data[rowx], function (err, res) {
                  if (err) {
                    console.error('insert index_repo_campaign :' + err);
                  } else {
                    // console.log("insert voice_facebook Success: NO."+rowx);
                    rowx++;
                    addMongo( index_id, data, timetostamp, rowx)
                  }

                });


              });//ปิด run number mongo


          }
        });




      }//ปิด if ((main))

      voiceupdate.readIndexChangeY(index_id, timetostamp);


    } catch (err) {
      console.log("Addmongo ERROR EVALUATE NO DATA ANY VARIABLE ");
      voiceupdate.readIndexChangeR(index_id, "NS : Evaluate ERR Facebook " + err + " index_id: " + index_id);
    }

  }


  // async function setCam(urlold, callback) {
  //   var campaign_id = "";
  //   var campaign_set = [];
  //   var keyword = []
  //   //SELECT CAMPAIGN
  //   await db.collection(index_collection).find({ 'url': urlold }).toArray(async function (err, result) {
  //     var rs = "";
  //     if (result.length > 0) {
  //       rs = result[0];
  //       campaign_id = rs.campaign_id;
  //       search_keyword = rs.search_keyword;
  //     } else {
  //       campaign_id = 0;
  //       search_keyword = 0;
  //     }

  //     if (err) {
  //       console.log(err);
  //     }




  //     await db.collection("campaign_setkeyword").find({ 'campaign_id': campaign_id, 'search_keyword': search_keyword }).toArray(function (err1, result1) {
  //       if (err1) {
  //         console.log(err1);

  //       }
  //       for (const rs1 of result1) {
  //         var arrPush = rs1._id;
  //         // console.log(arrPush);

  //         campaign_set.push(arrPush);
  //       }


  //     });
  //     callback(campaign_id, campaign_set, search_keyword);
  //   });
  //   //CLOSE SELECT CAMPAIGN


  // }



  async function manageindex(url, index_id) {
    var passed = [];

    const idpost = document.querySelectorAll('input[name=ft_ent_identifier]');
    let keepurl = document.querySelector("meta[property='al:ios:url']");
    keepurl = keepurl.attributes[1].value.match(/[0-9]+/g)
    console.log(keepurl);




    i = 1;


    for (var id of idpost) {
      passed.push({
        title_search: document.querySelector('._64-f > span').innerText,
        domain: "facebook.com",
        url: "https://www.facebook.com/" + keepurl + "/posts/" + id.value,
        platform: "facebook",
        platform_typepost: "posts",
        readindex: "Y",
        readindexdate: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        readnexttime: 0,
        qc_score: 1,
        collect_minute: 43200,
        createdate: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        createymd: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        updatedate: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        countcrawler: 0,
        temp_user_id: "",
        status: "Y",
        error_status: "",
      });
      i++;

    }


    return passed;
  }



}//ปิด export getPost