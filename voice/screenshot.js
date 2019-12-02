const puppeteer = require('puppeteer');
var mongojs = require('../configDB/db');
db = mongojs.connect;
var convert = require('../lib/convert');
const voiceupdate = require('../lib/voiceupdate');
var upperCase = require('upper-case')




exports.getScreenshot = function (url) {
    console.log(" ");
    console.log(" ");
    console.log(" ");
    console.log(" ");
    console.log(" ");

    var browser
    var page
    (async () => {
        try {


            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            page = await browser.newPage();
            page.setViewport({ width: 1280, height: 1800 });
            
            
            console.log("start CAPTURE : " + url);

            await page.goto(url)
            await page.waitFor(3000);
            await page.screenshot({ path: new Date() + '.png' });


            console.log("CAPTURE SUCCESS : " + url);




            browser.close();



        } catch (err) {

        }//ปิด catch ใหญ่







    })();


    async function addcommentonebyone(page, url, index_id, timetostamp) {

        try {
            await page.addScriptTag({ content: `${managesinglepost}` });
            const rs = await page.evaluate(({ url, index_id }) => {
                return managesinglepost(url, index_id);
            }, { url, index_id });
            await setCam(url, async function (result, result1) {
                await addMongo(result, result1, index_id, rs, timetostamp, 0)
            });


        } catch (err) {
            console.error("Eval err : " + err);
            const used = process.memoryUsage();
            for (let key in used) {
                console.log("Facebook" + `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
            }
            page.close();
        }// ปิด catch eval

    }



    async function addpost(page, url, index_id, timetostamp) {

        console.log('Click SHOW LIKE POST');
        const secone1 = await page.$('div[data-insertion-position="0"]')
        if (!(secone1)) {
            throw "LINK NOT AVAILABLE"
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
            console.log('SUCCESS CRAWLER PUSH ARRAY');
            await setCam(url, async function (result, result1) {
                await addMongo(result, result1, index_id, rs, timetostamp, 0)
            });

        } catch (err) {
            console.error("Eval err : " + err);
            const used = process.memoryUsage();
            for (let key in used) {
                console.log("Facebook" + `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
            }
            page.close();
        }// ปิด catch eval

    }



    async function addMongo(camid, camset, index_id, data, timetostamp, rowx) {

        try {


            if ((data[rowx])) {


                db.collection("voice_facebook").find({ "caption": data[rowx]['caption'] }).toArray(function (err, resultcheck) {
                    if (resultcheck.length > 0) {

                        // db.collection("voice_facebook").find({ "voice_id": data[rowx]['voice_id'],"caption": data[rowx]['caption'] }).toArray(function (err, resultcheck1) {
                        //   if (resultcheck1.length > 0) {
                        //     data[rowx]['voice_id'] = parseInt(data.length)+1
                        //   }
                        //  });

                        db.collection("voice_facebook").update(
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
                                    addMongo(camid, camset, index_id, data, timetostamp, rowx)
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

                                // db.collection("voice_facebook").find({ "voice_id": data[rowx]['voice_id'],"caption": data[rowx]['caption'] }).toArray(function (err, resultcheck) {
                                //   if (resultcheck.length > 0) {
                                //     data[rowx]['voice_id'] = parseInt(data.length)+1
                                //   }
                                //  });

                                data[rowx]['_id'] = result.seq
                                data[rowx]['campaign_id'] = camid
                                data[rowx]['campaign_set'] = camset
                                data[rowx]['postdate'] = convert.dateFormat(data[rowx]['postdate'], 'FB');
                                data[rowx]['collectdata'] = convert.dateFormat();
                                data[rowx]['interaction'] = convert.engagementToInt(data[rowx]['interaction']);
                                data[rowx]['like'] = convert.engagementToInt(data[rowx]['like']);
                                data[rowx]['reaction'] = convert.engagementToInt(data[rowx]['reaction']);
                                data[rowx]['haha'] = convert.engagementToInt(data[rowx]['haha']);
                                data[rowx]['sad'] = convert.engagementToInt(data[rowx]['sad']);
                                data[rowx]['love'] = convert.engagementToInt(data[rowx]['love']);
                                data[rowx]['engagement'] = convert.engagementToInt(data[rowx]['engagement']);
                                data[rowx]['angry'] = convert.engagementToInt(data[rowx]['angry']);



                                db.collection("voice_facebook").insert(data[rowx], function (err, res) {
                                    if (err) {
                                        console.error('insert voice_facebook :' + err);
                                    } else {
                                        // console.log("insert voice_facebook Success: NO."+rowx);
                                        rowx++;
                                        addMongo(camid, camset, index_id, data, timetostamp, rowx)
                                    }

                                });


                            });//ปิด run number mongo


                    }
                });




            }//ปิด if ((main))


            db.collection("index_repo_campaign").update({ "_id": index_id }, {
                $set: { "error_status": "", "readindex": 'Y', "readnexttime": timetostamp, "readindexdate": new Date() }
            });// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง
        } catch (err) {
            console.log("Addmongo ERROR EVALUATE NO DATA ANY VARIABLE ");
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
            const aTags = await secone.$$('div.UFIReplyList')
            if ((aTags) && typeof aTags !== 'undefined' && aTags !== null) {
                for (const aTag of aTags) {
                    await aTag.click('div.UFIReplyList');
                    await page.waitFor(1000);
                    await addcommentonebyone(page, url, index_id, timetostamp)
                }
            } else {
                await addcommentonebyone(page, url, index_id, timetostamp)
                console.log("No Btn More Comment Anymore");
            }
        } catch (err) {
            throw "Func clicktwo Err : " + err;
        }

    }



    async function setCam(url, callback) {
        var campaign_id = [];
        var campaign_set = [];
        //SELECT CAMPAIGN
        await db.collection("index_repo_campaign").find({ 'url': url }).toArray(async function (err, result) {

            for (const rs of result) {

                campaign_id.push(rs.campaign_id);
                if (err) {
                    console.log(err);
                }




                await db.collection("campaign_setkeyword").find({ 'campaign_id': rs.campaign_id }).toArray(function (err1, result1) {
                    if (err1) {
                        console.log(err1);

                    }
                    for (const rs1 of result1) {
                        var arrPush = rs1.campaign_id + "_" + rs1._id + "_" + rs1.typeof_keyword;
                        // console.log(arrPush);

                        campaign_set.push(arrPush);
                    }


                });
            }
            callback(campaign_id, campaign_set);
        });
        //CLOSE SELECT CAMPAIGN


    }



    async function managemainpost(url, index_id) {

        try {


            var passed = [];
            var captionname = ""
            var pagename = document.querySelector('#seo_h1_tag > a > span');
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
                    var dates = document.querySelectorAll('.UFISutroCommentTimestamp')[0];
                    if ((dates)) {
                        var dateshow = dates.attributes[1].value;
                    } else {
                        var datesecone = document.querySelector('.userContentWrapper');
                        var datetwo = datesecone.querySelector('abbr');
                        var dateshow = datetwo.attributes[1].value;
                    }
                    var sharesecone = document.querySelector('.userContentWrapper');
                    var sharepost = sharesecone.querySelector('._ipm._2x0m');
                    var sharecount = 0;
                    if ((sharepost)) {
                        sharecount = sharepost.innerText;
                    }

                    passed.push({
                        voice_id: 1,
                        voice_refid: 0,
                        index_id: index_id,
                        client_competitor: "client",
                        pages: document.querySelector('#pageTitle').innerText,
                        caption: indexmainpostshow,
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
                        postdate: dateshow,
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


                var dates = document.querySelectorAll('.UFISutroCommentTimestamp')[0];
                if ((dates)) {
                    var dateshow = dates.attributes[1].value;
                } else {
                    var datesecone = document.querySelector('.userContentWrapper');
                    var datetwo = datesecone.querySelector('abbr');
                    var dateshow = datetwo.attributes[1].value;
                }
                var sharesecone = document.querySelector('.userContentWrapper');
                var sharepost = sharesecone.querySelector('._ipm._2x0m');
                if ((sharepost)) {
                    var sharecount = sharepost.innerText;
                } else {
                    var sharecount = 0;
                }

                passed.push({
                    voice_id: 1,
                    voice_refid: 0,
                    index_id: index_id,
                    client_competitor: "client",
                    pages: document.querySelector('#pageTitle').innerText,
                    caption: indexmainpostshow,
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
                    postdate: dateshow,
                    collectdata: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                    source_type: 'facebook',
                });
                return passed;
            }



            var ii = 0;
            var i = 1;
            var iii = 0;
            var iiii = 0;

            var date = document.querySelectorAll('.UFISutroCommentTimestamp')[ii];
            var commentid = document.querySelectorAll('.UFICommentCloseButton')[ii];

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
                var sharesecone = document.querySelector('.userContentWrapper');
                var sharepost = sharesecone.querySelector('._ipm._2x0m');
                sharecount = 0;
                if ((sharepost)) {
                    sharecount = parseInt(sharepost.innerText);
                }
                passed.push({
                    voice_id: i,
                    voice_refid: iii,
                    index_id: index_id,
                    client_competitor: "client",
                    pages: document.querySelector('#pageTitle').innerText,
                    caption: captionname,
                    directurl: url,
                    typepost: comtype1,
                    interaction: emotion[0].innerText,
                    like: likeemo,
                    love: loveemo,
                    haha: hahaemo,
                    wow: wowemo,
                    sad: sademo,
                    angry: angryemo,
                    comment: commentpost.innerText.replace(/[^\d.]/g, ''),
                    share: sharecount,
                    reaction: emotion[0].innerText,
                    engagement: emotion[0].innerText,
                    postdate: date.attributes[1].value,
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
            var pagename = document.querySelector('#seo_h1_tag > a > span');
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
                    var dates = document.querySelectorAll('.UFISutroCommentTimestamp')[0];
                    if ((dates)) {
                        var dateshow = dates.attributes[1].value;
                    } else {
                        var datesecone = document.querySelector('.userContentWrapper');
                        var datetwo = datesecone.querySelector('abbr');
                        var dateshow = datetwo.attributes[1].value;
                    }
                    var sharesecone = document.querySelector('.userContentWrapper');
                    var sharepost = sharesecone.querySelector('._ipm._2x0m');
                    var sharecount = 0;
                    if ((sharepost)) {
                        sharecount = parseInt(sharepost.innerText);
                    }

                    passed.push({
                        voice_id: 1,
                        voice_refid: 0,
                        index_id: index_id,
                        client_competitor: "client",
                        pages: document.querySelector('#pageTitle').innerText,
                        caption: indexmainpostshow,
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
                        postdate: dateshow,
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


                var dates = document.querySelectorAll('.UFISutroCommentTimestamp')[0];
                if ((dates)) {
                    var dateshow = dates.attributes[1].value;
                } else {
                    var datesecone = document.querySelector('.userContentWrapper');
                    var datetwo = datesecone.querySelector('abbr');
                    var dateshow = datetwo.attributes[1].value;
                }
                var sharesecone = document.querySelector('.userContentWrapper');
                var sharepost = sharesecone.querySelector('._ipm._2x0m');
                sharecount = 0;
                if ((sharepost)) {
                    sharecount = parseInt(sharepost.innerText);
                }

                passed.push({
                    voice_id: 1,
                    voice_refid: 0,
                    index_id: index_id,
                    client_competitor: "client",
                    pages: document.querySelector('#pageTitle').innerText,
                    caption: indexmainpostshow,
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
                    postdate: dateshow,
                    collectdata: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                    source_type: 'facebook',
                });
                return passed;
            }



            var ii = 0;
            var i = 1;
            var iii = 0;
            var iiii = 0;

            for (var comments of comment) {
                var date = document.querySelectorAll('.UFISutroCommentTimestamp')[ii];
                var commentid = document.querySelectorAll('.UFICommentCloseButton')[ii];

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
                        voice_id: i,
                        voice_refid: iii,
                        index_id: index_id,
                        client_competitor: "client",
                        pages: document.querySelector('#pageTitle').innerText,
                        caption: captionname,
                        directurl: url + "?comment_id=" + commentid.attributes[6].value,
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
                        collectdata: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                        source_type: 'facebook',
                    });

                } else {

                    captionname = comments.innerText;

                    passed.push({
                        voice_id: i,
                        voice_refid: iii,
                        index_id: index_id,
                        client_competitor: "client",
                        pages: document.querySelector('#pageTitle').innerText,
                        caption: captionname,
                        directurl: url + "?comment_id=" + commentid.attributes[6].value,
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
                        collectdata: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                        source_type: 'facebook',
                    });
                }

                ii++;
                iiii = i;
                i++;
            }


            return passed;

        } catch (err) {

            console.error(err);

        }



    }//ปิดเมเนจ singlepost





}