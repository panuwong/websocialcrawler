"use strict";

const puppeteer = require('puppeteer');
const mongojs = require('../configDB/db');
const db = mongojs.connect;
const convert = require('../lib/convert');
const voiceupdate = require('../lib/voiceupdate');

const index_collection = "index_repo_campaign"
const voice_collection = "voice_facebook"


class Facebookcrawler {
    constructor() {
        console.log("start FACEBOOKCRAWLER")
    }
    getSinglePostFromScheduling(data, rowx) {

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



            getSinglePostFromSchedulings(data, rowx, proxyData);



        });

        async function getSinglePostFromSchedulings(data, rowx, proxyData) {
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

                        //==========================
                        try {
                            console.log('Click Newest');
                            await clicknewest(page);
                            await page.waitFor(5000);
                        } catch (err) {
                            console.log("ERR click newest :" + err);
                            throw "newest ERR" + err;
                        }
                        try {
                            await addpost(page, url, index_id, timetostamp);
                            await page.waitFor(2000);
                        } catch (err) {
                            console.error("ERR click addpost :" + err);
                            throw "add post ERR" + err;
                        }

                        //==========================

                        console.log('Click MORE COMMENT');
                        await clickone(page, url, index_id, timetostamp);
                        console.log('WAITING 1s');
                        await page.waitFor(1000);
                        console.log('Click MORE REPLY');
                        await clicktwo(page, url, index_id, timetostamp);
                        console.log('WAITING 1s');
                        await page.waitFor(1000);

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
                    await getSinglePostFromSchedulings(data, index, proxyData)
                }//ปิด catch ใหญ่







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
                    console.log("Catch : Login Again");
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



        async function addpost(page, url, index_id, timetostamp) {

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
            try {
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
                throw err;
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
                                                data[rowx]['voice_refid'] = 888
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
            let campaign_id = [];
            let campaign_set = [];
            let keyword;
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
                                let arrPush = rs1.campaign_id + "_" + camsetcheck + "_" + rs1.typeof_keyword;
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
                        // var id1= 0
                        // var id2 = 0
                        // if (linkArr.length > 1) {
                        //   id1 = linkArr[0]
                        //   id2 = linkArr[1]
                        // } else {
                        //   id1 = linkArr[0]
                        // }



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



    //=========================PAGE GET
    //=========================PAGE GET
    //=========================PAGE GET
    //=========================PAGE GET
    //=========================PAGE GET
    //=========================PAGE GET
    //=========================PAGE GET
    //=========================PAGE GET

    getPost(data, rowx) {
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



            getPost(data, rowx, proxyData);



        });
        async function getPost(data, rowx, proxyData) {
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
                        let index_id = row[1]
                        var timetostamp = row[2]


                        // const indexdata = []
                        const result = await voiceupdate.updateStatus(data, index)
                        if (!result) {
                            await voiceupdate.d("----- skip " + (index + 1) + " : get start url :" + url + " readrindex R")
                            index++;
                        } else {

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
                                if (!url.includes('posts')) {
                                    url += '/posts/?ref=page_internal'
                                }
                            } else {
                                if (!url.includes('posts')) {
                                    url += 'posts/?ref=page_internal'
                                }
                            }
                            console.log(url)

                            var random = convert.randomNumber(5);
                            await page.waitFor(2000 * random);
                            await page.goto(url, { waitUntil: 'networkidle2' })


                            await scrolled(page);


                            //==========================
                            try {
                                var rs = await page.evaluate(() => {
                                    return new Promise(function (resolve, reject) {
                                        var passed = [];

                                        const idpost = document.querySelectorAll('input[name=ft_ent_identifier]');
                                        let keepurl = document.querySelector("meta[property='al:ios:url']");
                                        if (!(keepurl.attributes[1].value.match(/[0-9]+/g))) {
                                            resolve(300);
                                        } else {


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
                                                    counttimeout: 0,
                                                    temp_user_id: "",
                                                    status: "Y",
                                                    error_status: "",
                                                });
                                                i++;

                                            }


                                            resolve(passed);

                                        }
                                    })
                                });
                                if (rs != 300) {
                                    const camid = await setCamid(urlold)
                                    const keyword = await setCamkeyword(urlold)
                                    const camset = await setCamset(camid, keyword)

                                    await addMongo(camid, camset, keyword, index_id, rs, timetostamp, 0)
                                }






                            } catch (err) {
                                console.error("Eval err : " , err);
                                const used = process.memoryUsage();
                                for (let key in used) {
                                    console.log("Facebook" + `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
                                }
                                throw err;
                            }// ปิด catch eval


                        }




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
                    getPost(data, index, proxyData)

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

        async function addMongo(campaign_id, campaign_set, search_keyword, index_id, data, timetostamp, rowx) {

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
                                        addMongo(campaign_id, campaign_set, search_keyword, index_id, data, timetostamp, rowx)
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
                                    data[rowx]['campaign_id'] = campaign_id
                                    data[rowx]['campaign_set'] = campaign_set
                                    data[rowx]['search_keyword'] = search_keyword
                                    data[rowx]['by_name'] = "2"
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
                                            addMongo(campaign_id, campaign_set, search_keyword, index_id, data, timetostamp, rowx)
                                        }

                                    });


                                });//ปิด run number mongo


                        }
                    });




                }//ปิด if ((main))
                // console.log("timesta2 : " + timetostamp);
                if (timetostamp == 1) {
                    var collect_minute = 43200;
                    collect_minute = (collect_minute != '') ? parseInt(collect_minute) : 60;
                    timetostamp = convert.getNextTimetostampDate(collect_minute, 'm')
                }
                voiceupdate.readIndexChangeY(index_id, timetostamp);


            } catch (err) {
                console.log("Addmongo ERROR EVALUATE NO DATA ANY VARIABLE ");
                voiceupdate.readIndexChangeR(index_id, "NS : Evaluate ERR Facebook " + err + " index_id: " + index_id);
            }

        }


        async function setCamid(urlold) {

            var campaign_id = "";
            return new Promise(function (resolve, reject) {
                db.collection(index_collection).find({ 'url': urlold }).toArray(async function (err, result) {
                    var rs = "";
                    if (result.length > 0) {
                        rs = result[0];
                        campaign_id = rs.campaign_id;
                    } else {
                        campaign_id = 0;
                    }
                    resolve(campaign_id)
                })
            })


        }

        async function setCamkeyword(urlold) {

            var search_keyword = [];
            return new Promise(function (resolve, reject) {
                db.collection(index_collection).find({ 'url': urlold }).toArray(async function (err, result) {
                    var rs = "";
                    if (result.length > 0) {
                        rs = result[0];
                        search_keyword = rs.search_keyword;
                    } else {
                        search_keyword = 0;
                    }
                    resolve(search_keyword)
                })
            })


        }

        async function setCamset(camid, keyword) {

            var campaign_set = [];
            return new Promise(function (resolve, reject) {
                db.collection("campaign_setkeyword").find({ 'campaign_id': camid, 'search_keyword': keyword }).toArray(function (err1, result1) {
                    if (err1) {
                        console.log(err1);
                    }
                    for (const rs1 of result1) {
                        var arrPush = rs1._id;
                        // console.log(arrPush);

                        campaign_set.push(arrPush);
                    }
                    resolve(campaign_set);
                })
            })

        }



        // async function manageindex(url, index_id) {
        //     var passed = [];

        //     const idpost = document.querySelectorAll('input[name=ft_ent_identifier]');
        //     let keepurl = document.querySelector("meta[property='al:ios:url']");
        //     keepurl = keepurl.attributes[1].value.match(/[0-9]+/g)
        //     console.log(keepurl);




        //     i = 1;


        //     for (var id of idpost) {
        //         passed.push({
        //             title_search: document.querySelector('._64-f > span').innerText,
        //             domain: "facebook.com",
        //             url: "https://www.facebook.com/" + keepurl + "/posts/" + id.value,
        //             platform: "facebook",
        //             platform_typepost: "posts",
        //             readindex: "Y",
        //             readindexdate: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        //             readnexttime: 0,
        //             qc_score: 1,
        //             collect_minute: 43200,
        //             createdate: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        //             createymd: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        //             updatedate: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        //             counttimeout: 0,
        //             temp_user_id: "",
        //             status: "Y",
        //             error_status: "",
        //         });
        //         i++;

        //     }


        //     return passed;
        // }



    }//ปิด export getPost























    //=========================PAGE GET
    //=========================PAGE GET
    //=========================PAGE GET
    //=========================PAGE GET
    //=========================PAGE GET
    //=========================PAGE GET
    //=========================PAGE GET
    //=========================PAGE GET

    getSearchForKeyword(data, rowx) {
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



            getSearchForKeyword(data, rowx, proxyData);



        });
        async function getSearchForKeyword(data, rowx) {
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
                    page.setViewport({ width: 1280, height: 1240 });
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
                        var campaign_set = row[0]
                        var campaign_id = row[1]
                        var keyword = row[2]
                        var startCmp = row[3]

                        voiceupdate.d("----- No" + (index + 1) + " : get start keyword :" + keyword)
                        await page.goto("https://www.facebook.com/search/posts/?q=" + keyword + "&epa=FILTERS&filters=eyJycF9hdXRob3IiOiJ7XCJuYW1lXCI6XCJtZXJnZWRfcHVibGljX3Bvc3RzXCIsXCJhcmdzXCI6XCJcIn0ifQ%3D%3D", { waitUntil: 'networkidle2' })

                        var key = []

                        key.push(keyword)

                        console.log('Start Search Social Post');

                        await clickone(page, startCmp)
                        await page.waitFor(2000);
                        await scrolled(page, campaign_set, campaign_id, key, startCmp);

                        console.log('Start Search Social Page');
                        await page.goto("https://www.facebook.com/search/pages/?q=" + keyword)
                        await page.waitFor(2000);
                        await scrolledpage(page, campaign_set, campaign_id, key, startCmp);

                    }//ปิด for

                    const used = process.memoryUsage();
                    for (let key in used) {
                        console.log("Facebook" + `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
                    }

                    browser.close();

                } catch (err) {
                    console.error("PP ERR FB INDEX : " + err);
                    // await getSearchForKeyword(data, rowx)
                    browser.close();
                }//ปิด catch ใหญ่

            })();
        }

        async function loginFunc(page, fbuser, fbpass) {
            try {
                await page.goto("https://www.facebook.com")
                await page.waitForSelector('#email');
                await page.type('#email', fbuser, { delay: 10 });
                await page.type('#pass', fbpass, { delay: 10 });
                await page.click('#loginbutton');
                await page.waitForNavigation({
                    waitUntil: 'load'
                });
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
                    console.log("Catch : Login Again");
                    await loginFunc(page, fbuser, fbpass)
                }
            }
        }



        async function clickone(page, startCmp) {
            try {
                await page.click('div')
                await page.waitFor(2000);

                await page.waitForSelector('div._1u6r[id="u_ps_0_0_p"]')
                await page.click('div._1u6r[id="u_ps_0_0_p"]')
                await page.waitFor(2000);



                var datenum = await processDate(startCmp)

                if (datenum[3]) {
                    await page.click('a[id="u_ps_0_0_v"]')
                    await page.waitFor(2000);


                    var year = datenum[2]
                    await page.click('ul._54nf > li:nth-child(' + year + ')>a')
                    await page.waitFor(2000);

                    var nyear = 1
                    await page.waitForSelector('div._1u6r[id="u_ps_fetchstream_' + nyear + '_0_p"]')
                    await page.click('div._1u6r[id="u_ps_fetchstream_' + nyear + '_0_p"]')
                    await page.waitFor(2000);

                    await page.click('a[id="u_ps_fetchstream_' + nyear + '_0_s"]')
                    await page.waitFor(2000);

                    var month = "" + datenum[1]
                    await page.click('#u_ps_fetchstream_1_0_c:nth-child(1)>div > ul._54nf > li:nth-child(' + month + ')>a')
                    await page.waitFor(2000);

                } else {

                    await page.click('#u_ps_0_0_s')//คลิกช่องเดือน
                    await page.waitFor(2000);

                    await page.click('div._54ng > ul > li:nth-child(2) > a')//เดือน
                    await page.waitFor(2000);


                }




            } catch (e) {
                console.error(e);
            }
        }

        function processDate(startCmp) {
            var datecam = new Date(startCmp)
            var datenow = new Date()
            var year = {}
            for (let index = 1; index < 10; index++) {
                if (index == 1) {
                    year[datenow.getFullYear()] = 1
                }
                else {
                    var lob = index - 1
                    year[datenow.getFullYear() - lob] = index
                }
            }
            var sender = []
            sender.push(datecam.getDate())
            sender.push(datecam.getMonth() + 2)
            sender.push(datecam.getFullYear())
            if (datenow.getFullYear() === datecam.getFullYear()) {
                sender.push(false)
            } else {
                sender.push(true)
            }

            return sender
        }




        async function scrolled(page, campaign_set, campaign_id, key, startCmp) {
            try {
                let previousHeight;
                var ii = 1;
                while (ii < 50) {
                    previousHeight = await page.evaluate('document.body.scrollHeight');
                    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                    await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
                    await page.waitFor(10);

                    // //==========================
                    try {
                        var rs2 = await page.evaluate(({ campaign_id, key }) => {
                            return new Promise(function (resolve, reject) {
                                try {
                                    var passed = [];
                                    var keepArr = {};





                                    const posts = document.querySelectorAll('._5zwe._1ch4');

                                    for (var post of posts) {
                                        var linkurl = post.querySelector('a');

                                        keepArr = {};

                                        keepArr["campaign_id"] = campaign_id;
                                        keepArr["search_keyword"] = key;
                                        keepArr["title_search"] = post.innerText,
                                            keepArr["domain"] = "facebook.com";
                                        keepArr["url"] = "https://www.facebook.com" + linkurl.attributes.href.value
                                        keepArr["platform"] = "facebook";

                                        passed.push(keepArr)


                                    }


                                    resolve(passed);


                                } catch (error) {
                                    console.log("ManageIndex Catch")
                                    console.log(error);

                                }
                            })
                        }, { campaign_id, key });
                        voiceupdate.updateIndexRepoSearch(rs2, campaign_set, 0)

                    } catch (err) {
                        console.error("EvAL Scrolled err : " + err);
                        const used = process.memoryUsage();
                        for (let key in used) {
                            console.log("Facebook" + `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
                        }
                        throw "EvAL Scrolled err : " + err
                    }// ปิด catch eval

                    const rs = await page.$('.phm._64f');
                    if ((rs)) {
                        console.log('post : Found End Result');
                        break;
                    }
                    ii++;
                }
            } catch (err) {
                console.error("EvAL Scrolled err : " + err);
                throw "EvAL Scrolled err : " + err
            }
        }

        async function scrolledpage(page, campaign_set, campaign_id, key, startCmp) {
            try {
                await page.click('div')
                await page.waitFor(2000);
                let previousHeight;
                var ii = 1;
                var rowx = 0
                while (ii < 50) {
                    previousHeight = await page.evaluate('document.body.scrollHeight');
                    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                    await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
                    await page.waitFor(10);

                    // //==========================
                    try {
                        var rs2 = await page.evaluate(() => {
                            return new Promise(function (resolve, reject) {
                                try {
                                    var passed = [];
                                    var keepArr = {};





                                    const pagealls = document.querySelectorAll('a._32mo');

                                    for (var pageall of pagealls) {
                                        var pagename = pageall.querySelector('span');
                                        let linkA = pageall.attributes.href.value
                                        let linkB = linkA.split('?')

                                        keepArr = {};

                                        keepArr["campaign_id"] = "";
                                        keepArr["search_keyword"] = "";
                                        keepArr["title_search"] = pagename.innerText,
                                            keepArr["domain"] = "facebook.com";
                                        keepArr["url"] = linkB[0] + "posts"
                                        keepArr["platform"] = "facebook";

                                        passed.push(keepArr)


                                    }


                                    resolve(passed);


                                } catch (error) {
                                    console.log("ManageIndex Catch")
                                    console.log(error);

                                }
                            })
                        });


                        if (ii == 1) {
                            rowx = 0
                        } else {
                            rowx = rowx - 1
                        }

                        voiceupdate.updateIndexRepoSearch(rs2, "", rowx, "pages")
                        rowx = rs2.length


                    } catch (err) {
                        console.error("EvAL Scrolled err : " + err);
                        const used = process.memoryUsage();
                        for (let key in used) {
                            console.log("Facebook" + `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
                        }
                        throw "EvAL Scrolledpage err : " + err
                    }// ปิด catch eval

                    const rs = await page.$('.phm._64f');
                    if ((rs)) {
                        console.log('page : Found End Result');
                        break;
                    }
                    ii++;
                }
            } catch (err) {
                console.error("EvAL Scrolled err : " + err);
                throw "EvAL Scrolled err : " + err
            }
        }





        // async function manageindex(campaign_id, keyword) {
        //     try {
        //         var passed = [];
        //         var keepArr = {};





        //         const posts = document.querySelectorAll('._5zwe._1ch4');

        //         for (var post of posts) {
        //             var linkurl = post.querySelector('a');

        //             keepArr = {};

        //             keepArr["campaign_id"] = campaign_id;
        //             keepArr["search_keyword"] = keyword;
        //             keepArr["title_search"] = post.innerText,
        //                 keepArr["domain"] = "facebook.com";
        //             keepArr["url"] = "https://www.facebook.com" + linkurl.attributes.href.value
        //             keepArr["platform"] = "facebook";

        //             passed.push(keepArr)


        //         }


        //         return passed;


        //     } catch (error) {
        //         console.log("ManageIndex Catch")
        //         console.log(error);

        //     }
        // }


        // async function manageindexpage(campaign_id, keyword) {
        //     try {
        //         var passed = [];
        //         var keepArr = {};





        //         const pagealls = document.querySelectorAll('a._32mo');

        //         for (var pageall of pagealls) {
        //             var pagename = pageall.querySelector('span');
        //             let linkA = pageall.attributes.href.value
        //             let linkB = linkA.split('?')

        //             keepArr = {};

        //             keepArr["campaign_id"] = "";
        //             keepArr["search_keyword"] = "";
        //             keepArr["title_search"] = pagename.innerText,
        //                 keepArr["domain"] = "facebook.com";
        //             keepArr["url"] = linkB[0] + "posts"
        //             keepArr["platform"] = "facebook";

        //             passed.push(keepArr)


        //         }


        //         return passed;


        //     } catch (error) {
        //         console.log("ManageIndex Catch")
        //         console.log(error);

        //     }
        // }



    }//ปิด export getPost


}
module.exports = Facebookcrawler













