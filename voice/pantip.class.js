'use strict';

const puppeteer = require('puppeteer');
const convert = require('../lib/convert');
let mongojs = require('../configDB/db');

let db = mongojs.connect;

let index_collection = "index_repo_campaign"
let voice_collect = "voice_pantip"

const LibVoice = require('../lib/lib.class');
const voiceupdate = new LibVoice()

let start_process = new Date()
let success_process
let err_process
// let browser
// let page
let index_ids

let startCmp;
class Pantip {

    constructor() {
        // console.log("start instagram")
    }
    //////////////////// Start Voice

    async startVoice(data, rowx, checkBrowser, success_p = 0, err_p = 0) {
        // let url = result[index].url;
        // const proxyData = voiceupdate.proxyData("bing")


        voiceupdate.d("sv start pantip ")
        voiceupdate.d("total : " + data.length);

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                // '--proxy-server=' + proxyData[0],
                '--no-sandbox',
                '--disable-setuid-sandbox']
        });

        const pages = await browser.newPage();
        // await pages.authenticate({ username: proxyData[1], password: proxyData[2] });
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
        await this.getDataPantip(start_process, data, rowx, success_p, err_p, browser, pages);



        // console.log('#--------Closed Job ' + index + ' on Browser ' + browser.process().pid + ' ------------------');
    }

    async getDataPantip(start_process, data, rowx, success_p = 0, err_p = 0, browser, page) {

        try {
            let index = rowx
            if (data[index]) {


                let re = await voiceupdate.updateStatus(data, index)
                // setTimeout(async () => {

                if (re) {
                    const row = data[index];
                    const url = row[0]

                    const domain = row[2]
                    const index_id = row[1]
                    const timetostamp = row[3]

                    index_ids = index_id

                    await voiceupdate.d("----- No" + (index + 1) + " : get start url :" + url)
                    await page.goto(url, { waitUntil: 'networkidle2' })


                    try {

                        await page.waitFor(500);
                        await this.clickone(page);
                    } catch (err) {
                        voiceupdate.d("     Click No Comment")
                    }
                    await page.waitFor(300);

                    const dataCamp = await Promise.all([[url, index_id]].map(this.camp))
                    const dataCamps = dataCamp[0][0]

                    try {



                        const evalua_post = await this.managePost(dataCamps, page, "page_post")
                        await page.waitFor(300);
                        db.collection(voice_collect).remove(
                            {
                                "index_id": index_id,
                                'typepost': "page_post"
                            });
                        await page.waitFor(300);

                        voiceupdate.d("     ToMongo data POST")
                        const finMogoIndexref = await Promise.all(evalua_post.map(this.ToMongo))

                        success_p++
                        voiceupdate.readIndexChangeY(index_id, timetostamp)
                        await page.waitFor(1000);
                        dataCamps.push(finMogoIndexref[0][0])
                        // console.log(dataCamps)
                        const evalua_comment = await this.manageComment(dataCamps, page, "page_comment")

                        await page.waitFor(400)

                        if (evalua_comment.length > 0) {


                            voiceupdate.d("     ToMongo data Comment")

                            const finMogoC = await Promise.all(evalua_comment.map(this.ToMongo))
                            // const finMogoC = await this.ToMongo(evalua_comment, index_id, timetostamp, url, dataCamp[0], dataCamp[2], dataCamp[1], 0)
                            if (finMogoC) {
                                await voiceupdate.showMemoryUsage("pantip ")
                            }
                        } else {
                            await voiceupdate.showMemoryUsage("pantip ")

                        }
                        rowx++
                        await this.getDataPantip(start_process, data, rowx, success_p, err_p, browser, page)

                    } catch (err) {
                        throw ("Add POST | COMMENT " + err)
                    }

                } else {
                    const row = data[index];
                    const url = row[0]
                    const index_id = row[1]

                    index_ids = index_id
                    await voiceupdate.d("----- skip " + (index + 1) + " : get start url :" + url + " readrindex R")

                    rowx++
                    await this.getDataPantip(start_process, data, rowx, success_p, err_p, browser, page)
                }

            } else {
                voiceupdate.d("     Pantip end procress")

                browser.close();
                var end_point_process = new Date()
                voiceupdate.dSum(success_p, err_p, start_process, end_point_process, data.length);

                voiceupdate.d("----- end Pantip close browser")

            }

        } catch (err) {

            console.error("PP ERR : " + err);
            let senderr = 200
            var keeperr = err.toString()
            if (keeperr.includes("TimeoutError")) {
                senderr = 501
            }
            voiceupdate.readIndexChangeR(index_ids, "NS : PP ERR ig " + err + " index_id: " + index_ids, senderr);
            err_process++
            rowx++
            await this.getDataPantip(start_process, data, rowx, success_p, err_process, browser, page)
        } finally {
            browser.close()
        }


    }
    async clickone(page) {
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


    async clickOneVoice(page) {
        var clickbtn = await page.$$("button.Z4IfV")
        if (clickbtn) {
            if (clickbtn.length > 0) {
                for (const doit of clickbtn) {
                    await doit.click('button.Z4IfV')
                    await page.waitFor(500);
                }
                clickone(page);
            }
        } else {
            return false
        }

    }

    camp(datas) {
        try {

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
                        arr.push(campaign_id)
                        arr.push(keyword)
                    }
                });

            });
        } catch (error) {
            reject(error)

        }
    }


    ToMongo(data) {

        return new Promise(function (resolve, reject) {
            try {

                // if (data[rowx]) {
                db.collection(voice_collect).find({ "voice_message": data['voice_message'] }).toArray(function (err, resultcheck) {

                    if (resultcheck.length > 0) {

                        data['emotion'] = convert.engagementToInt(data['emotion'])
                        data['like'] = convert.engagementToInt(data['like'])
                        data['engagement'] = convert.engagementToInt(data['like'])
                        data["postdate"] = convert.dateFormat(data["postdate"], "P");
                        data["collectdata"] = convert.dateFormat();
                        data["postymd"] = convert.dateFormat(data["postdate"], 'POSTYMD');


                        db.collection(voice_collect).update(
                            {
                                "voice_message": data["voice_message"]
                            },
                            {
                                $set: data
                            },
                            { upsert: true });



                        resolve([resultcheck[0]._id, data["index_id"]])

                    } else {
                        db.collection("zprimarykey_voice_pantip").findAndModify(
                            {
                                query: { _id: "indexid" },
                                update: { $inc: { seq: 1 } },
                                new: true
                            },
                            function (err, result) {

                                data["_id"] = result.seq
                                data['emotion'] = convert.engagementToInt(data['emotion'])
                                data['like'] = convert.engagementToInt(data['like'])
                                data['engagement'] = convert.engagementToInt(data['like'])
                                data["postdate"] = convert.dateFormat(data["postdate"], "P");
                                data["collectdata"] = convert.dateFormat();
                                data["postymd"] = convert.dateFormat(data["postdate"], 'POSTYMD');


                                db.collection(voice_collect).update(
                                    {
                                        "voice_message": data["voice_message"]
                                    },
                                    {
                                        $set: data
                                    },
                                    { upsert: true });



                                resolve([result.seq, data["index_id"]])

                                // console.log(data[rowx]); 
                            });
                    }

                });
            } catch (err) {
                voiceupdate.d("      err: Add data to mongodb and Restatus")

                reject("err: Add data to mongodb Page Twitter Field")
            }






        }) // end to mongo
    }

    async managePost(dataCamps, page, type) {

        return new Promise(async function (resolve, reject) {
            voiceupdate.d("     evaluate data " + type)
            try {
                const rs = await page.evaluate(dataCamps => {
                    return new Promise(async function (resolveEvl, reject) {


                        const mainpost = document.querySelector('.main-post-inner')

                        const titlePost = mainpost.querySelector('.display-post-status-leftside>h2')
                        const voicePost = mainpost.querySelector('.display-post-status-leftside>div>.display-post-story')
                        const postData = mainpost.querySelector('.display-post-status-leftside>.display-post-story-footer')

                        const action = postData.querySelector('.display-post-action')

                        var like = action.querySelector('.display-post-vote>span.like-score');

                        var emotion = action.querySelector('.display-post-emotion>a.emotion-vote>.emotion-score');

                        var authors = action.querySelector('.display-post-avatar');

                        var name = authors.querySelector('div>.owner');
                        var profileImage = authors.querySelector('a>img');

                        var postdate = action.querySelector('div>.display-post-timestamp>abbr[data-utime]')


                        let passed = [];

                        var tkeepArr = {};

                        tkeepArr["_id"] = 0;
                        tkeepArr["voice_refid"] = "";
                        tkeepArr["domain"] = "pantip";
                        tkeepArr["subject"] = titlePost.innerText;
                        tkeepArr["engagement"] = 0
                        tkeepArr["voice_message"] = voicePost.innerText;
                        tkeepArr["postby_name"] = name.innerText;
                        tkeepArr["postby_picture"] = profileImage.src;
                        tkeepArr["like"] = like.innerText;
                        tkeepArr["emotion"] = emotion.innerText;
                        tkeepArr["postdate"] = postdate.attributes[1].value;
                        tkeepArr["collectdate"] = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                        tkeepArr["sourcetype"] = "webpantip";
                        tkeepArr["typepost"] = "page_post";
                        tkeepArr["postymd"] = "";

                        tkeepArr["index_id"] = dataCamps[1];
                        tkeepArr["directurl"] = dataCamps[0];
                        tkeepArr["campaign_id"] = dataCamps[2];
                        tkeepArr["campaign_set"] = dataCamps[4];
                        tkeepArr["keyword"] = dataCamps[3];

                        passed.push(tkeepArr);
                        // return passed 

                        resolveEvl(passed);

                    })
                }, dataCamps)


                resolve(rs)
            } catch (error) {
                reject("EVL POST Promise: " + error)
            }

        })



    }

    async manageComment(dataCamps, page, typeC) {

        return new Promise(async function (resolve, reject) {
            try {


                voiceupdate.d("     evaluate data " + typeC)
                // console.log(dataCamps); 
                
                const rs = await page.evaluate(dataCamps => {

                    return new Promise(function (resolveEvl, rejects) {

                        let passed = [];

                        const mainpost = document.querySelector('.main-post-inner')

                        const titlePost = mainpost.querySelector('.display-post-status-leftside>h2')


                        const mainComment = document.querySelectorAll('#comments-jsrender>.section-comment>div>.display-post-status-leftside')

                        if (mainComment.length > 0) {
                            let tkeepArr = {};
                            for (const commenntData of mainComment) {

                                const voicePost = commenntData.querySelector('.comment-wrapper>.display-post-story')
                                const postData = commenntData.querySelector('.display-post-story-footer')

                                const action = postData.querySelector('.display-post-action')

                                var like = action.querySelector('.display-post-vote>span.like-score');

                                var emotion = action.querySelector('.display-post-emotion>a.emotion-vote>.emotion-score');

                                var authors = action.querySelector('.display-post-avatar');

                                var name = authors.querySelector('div>.display-post-name');
                                var profileImage = authors.querySelector('a>img');

                                var postdate = authors.querySelector('div>.display-post-timestamp>abbr[data-utime]')

                                tkeepArr["_id"] = 0;
                                tkeepArr["voice_refid"] = dataCamps[5];
                                tkeepArr["domain"] = "pantip";
                                tkeepArr["subject"] = titlePost.innerText;
                                tkeepArr["engagement"] = 0
                                tkeepArr["voice_message"] = voicePost.innerText;
                                tkeepArr["postby_name"] = name.innerText;
                                tkeepArr["postby_picture"] = profileImage.src;
                                tkeepArr["like"] = like.innerText;
                                tkeepArr["emotion"] = emotion.innerText;
                                tkeepArr["postdate"] = postdate.attributes[1].value;
                                tkeepArr["collectdate"] = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                                tkeepArr["sourcetype"] = "webpantip";
                                tkeepArr["typepost"] = "page_comment";
                                tkeepArr["postymd"] = "";
                                tkeepArr["index_id"] = dataCamps[1];
                                tkeepArr["directurl"] = dataCamps[0];

                                if (tkeepArr["voice_message"].includes(dataCamps[3][0])) {
                                    tkeepArr["campaign_id"] = dataCamps[2];
                                    tkeepArr["campaign_set"] = dataCamps[4];
                                    tkeepArr["keyword"] = dataCamps[3];
                                } else {

                                    tkeepArr["campaign_id"] = '';
                                    tkeepArr["campaign_set"] = '';
                                    tkeepArr["keyword"] = '';
                                }



                                passed.push(tkeepArr);


                            }
                        }
                        resolveEvl(passed)
                    })

                }, dataCamps)

                resolve(rs)
            } catch (error) {
                reject("url : "+dataCamps[0]+" EVL comment Promise: " + error)
            }
        })


    }


    /////////////////// Start Search


    async startSearch(data, rowx) {
        // let url = result[index].url;

        voiceupdate.d("sv start search keyword pantip")
        voiceupdate.d("total : " + data.length);

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox']
        });

        const pages = await browser.newPage();
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
        await this.getSearch(data, rowx, browser, pages);



        // console.log('#--------Closed Job ' + index + ' on Browser ' + browser.process().pid + ' ------------------');
    }

    async getSearch(data, rowx, browser, page) {

        try {
            if (data[rowx]) {

                let row = data[rowx];
                let campaign_set = row[0]
                let campaign_id = row[1]
                let keyword = row[2]
                startCmp = row[3]
                let first = row[4]

                voiceupdate.d("----- No" + (rowx + 1) + " : get start keyword :" + keyword)
                await page.goto("https://pantip.com/tag/" + keyword)
                await page.waitFor(1000)


                const divErr = await page.$("div.callback-status")
                if (divErr) {
                    voiceupdate.d("Not Data Search")
                    rowx++
                    this.getSearch(data, rowx, browser, page)
                } else {

                    var key = []
                    key.push(keyword)

                    const rs = await this.cliclNextPost(startCmp, page, campaign_id, campaign_set, key, true, 0, first, browser);


                }

            } else {
                voiceupdate.showMemoryUsage("pantip")
                voiceupdate.d("-----end pantip close page for TYPE PAGE ")
                // await browser.close();
            }
        } catch (error) {
            console.error(error)

            rowx++
            this.getSearch(data, rowx, browser, page)
        } finally {
            browser.close();
        }
    }

    async clickone(page) {
        const clickbtn = await page.$$("div.v1Nh3")
        if (clickbtn[0]) {
            await clickbtn[0].click('a')
            await page.waitFor(1000);
        } else {
            throw ("PAGE NOT DATA SEARCH")
        }
    }

    async cliclNextPost(startCmp, page, campaign_id, campaign_set, keyword, check, contIndex, first, b, rowx = 50) {
        try {
            // let contIndexs = contIndex;
            if (check) {

                const clickbtn = await page.$$("a[rel='next']")


                let row = rowx;
                await page.waitFor(1000);
                if (clickbtn[0]) {
                    // await page.waitFor(1000);
                    await clickbtn[0].click()
                    await page.waitFor(3000);

                    // await page.addScriptTag({ content: `${this.manageIndex}` });
                    const evaluate_index = await page.evaluate(({ campaign_id, keyword }) => {

                        return new Promise(function (resolve, reject) {
                            try {

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


                                resolve(passed);


                            } catch (error) {
                                reject("evlu :" + error);
                            }
                        })
                    }, { campaign_id, keyword });

                    row = (evaluate_index.length - 50)

                    voiceupdate.d("      create index_repo_search " + (contIndex + 1))
                    new LibVoice().updateIndexRepoSearch(evaluate_index, campaign_set, row)


                    await page.waitFor(200);
                    const rsCheckBrak = await page.evaluate(({ startCmp, first }) => {
                        return new Promise(function (resolve, reject) {
                            try {
                                var contents = document.querySelectorAll('abbr[data-utime]')
                                for (const content of contents) {
                                    // var date = content.querySelector('abbr.data-utime')
                                    var datePan = new Date(content.attributes[1].value).getTime()

                                    var date = new Date(startCmp)
                                    var datas = date.setMonth(date.getMonth() - 2)
                                    var date = new Date(datas)
                                    var datestop = date.getTime()

                                    if (first == 1) {
                                        date = new Date()
                                        datas = date.setDate(date.getDate() - 1)
                                        date = new Date(datas)
                                        datestop = date.getTime()
                                    }



                                    datestop = parseInt(datestop);

                                    if (parseInt(datePan) <= datestop) {
                                        resolve(true)
                                    } else {
                                        resolve(false)
                                    }
                                }


                            } catch (error) {
                                reject("recheck :" + error);
                            }
                        })
                    }, { startCmp, first });
                    // const rsCheckBrak = await page.evaluate(checkdate);

                    await page.waitFor(300);
                    // console.log(rsCheckBrak);

                    if (!rsCheckBrak) {
                        check = rsCheckBrak

                        voiceupdate.d("      keyword :" + keyword + " count index: " + contIndex)

                        voiceupdate.showMemoryUsage("search pantip for keyword")

                        return true
                        //  break;
                    } else {

                        contIndex = contIndex + 1;
                        await this.cliclNextPost(startCmp, page, campaign_id, campaign_set, keyword, check, contIndex, first, b, row)
                        // }, 1000);
                    }


                    // dataForIndex =rs;

                }
            } else {
                voiceupdate.d("      keyword :" + keyword + " count index: " + contIndex)

                voiceupdate.showMemoryUsage("search pantip for keyword")
                b.close();
                return true
            }
        } catch (e) {
            voiceupdate.d("     Error :" + e)
        }

    }

    async ToMongoAddPostSearch(page) {

        return new Promise(async function (resolve, reject) {

            const type = "page_post"
            const rs = await page.evaluate(type => {
                return new Promise(async function (resolveEvl, reject) {


                    var passed = [];
                    var keepArr = {};

                    var mainmedie = document.querySelector('div._97aPb>div>div>div.KL4Bh>img.FFVAD[src]');
                    var usercommentall = document.querySelectorAll('.FPmhX.notranslate.TlrDj');

                    var profileImage = document.querySelector('img._6q-tv');

                    var commentall = document.querySelectorAll('.C4VMK span');
                    var timepost = document.querySelector('time[datetime]');
                    var likepost = document.querySelector('button._8A5w5'); //ถ้าไม่ login จะไม่ได้ like

                    var countComment = commentall.length - 1
                    // if (likepost) {
                    //     // likepost = document.querySelector('span.vcOH2');
                    // }

                    if (mainmedie) {

                        keepArr["image"] = mainmedie.value;
                        // mainmedie = document.querySelector('video.tWeCl[poster]');
                    }

                    if (!likepost) {
                        likepost = "0"
                    } else {
                        likepost = likepost.innerText
                    }

                    var postcom = type;
                    keepArr = {};
                    keepArr["voice_refid"] = "";
                    keepArr["postdate"] = timepost.attributes[1].value;
                    keepArr["engagement"] = 0

                    keepArr["likepost"] = likepost;//ถ้าไม่ login จะไม่ได้ like 
                    keepArr["postby_name"] = usercommentall[0].innerText;
                    keepArr["postby_picture"] = profileImage.src;
                    keepArr["voice_message"] = commentall[0].innerText;
                    keepArr["comment"] = countComment;
                    keepArr["typepost"] = postcom;
                    keepArr["location_lat"] = "";
                    keepArr["location_long"] = "";
                    keepArr["location_name"] = "";
                    keepArr["source_type"] = "instagram";

                    passed.push(keepArr);



                    resolveEvl(passed);

                })
            }, type)
            resolve(rs)

        })

    }


}




module.exports = Pantip