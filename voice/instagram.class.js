'use strict';

const puppeteer = require('puppeteer');
const convert = require('../lib/convert');
let mongojs = require('../configDB/db');

let db = mongojs.connect;

let index_collection = "index_repo_campaign"
let voice_collect = "voice_instagram"

const LibVoice = require('../lib/lib.class');
const voiceupdate = new LibVoice()

let start_process = new Date()
let success_process
let err_process
// let browser
// let page
let index_ids

let startCmp;
class Instagram {

    constructor() {
        // console.log("start instagram")
    }
    //////////////////// Start Voice

    async startVoice(data, rowx, checkBrowser, success_p = 0, err_p = 0) {
        // let url = result[index].url;

        voiceupdate.d("sv start instagram ")
        voiceupdate.d("total : " + data.length);

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox']
        });

        const pages = await browser.newPage();
        // pages.on('console', consoleObj => console.log(consoleObj.text()));
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
        await this.getDataIG(start_process, data, rowx, success_p, err_p, browser, pages);



        // console.log('#--------Closed Job ' + index + ' on Browser ' + browser.process().pid + ' ------------------');
    }

    async getDataIG(start_process, data, rowx, success_p = 0, err_p = 0, browser, page) {

        try {
            let index = rowx
            if (data[index]) {


                let re = await voiceupdate.updateStatus(data, index)
                // setTimeout(async () => {

                if (re) {
                    const row = data[index];
                    const url = row[0]
                    const index_id = row[1]
                    const timetostamp = row[2]

                    index_ids = index_id

                    await voiceupdate.d("----- No" + (index + 1) + " : get start url :" + url)


                    // await page.goto("https://www.instagram.com/p/BuFOH06hw9x/", { waitUntil: 'networkidle2' })
                    await page.goto(url, { waitUntil: 'networkidle2' })
                    var divErr = await page.$("div.error-container")

                    if (divErr) {
                        voiceupdate.d("Not Data URL")

                    } else {

                        try {

                            await page.waitFor(500);
                            await clickOneVoice(page);
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
                            await page.waitFor(300);
                            dataCamps.push(finMogoIndexref[0][0])
                            // console.log(dataCamps)
                            const evalua_comment = await this.manageComment(dataCamps, page, "page_comment")

                            await page.waitFor(400)

                            if (evalua_comment.length > 0) {

                                // console.log(evalua_comment)
                                db.collection(voice_collect).remove(
                                    {
                                        "index_id": index_id,
                                        'typepost': 'page_comment'
                                    });
                                voiceupdate.d("     ToMongo data Comment")

                                const finMogoC = await Promise.all(evalua_comment.map(this.ToMongo))
                                // const finMogoC = await this.ToMongo(evalua_comment, index_id, timetostamp, url, dataCamp[0], dataCamp[2], dataCamp[1], 0)
                                if (finMogoC) {
                                    await voiceupdate.showMemoryUsage("IG ")
                                }
                            } else {
                                await voiceupdate.showMemoryUsage("IG ")
                            }

                        } catch (err) {
                            throw ("Add POST | COMMENT " + err)
                        }
                    }

                } else {
                    const row = data[index];
                    const url = row[0]
                    const index_id = row[1]

                    index_ids = index_id
                    await voiceupdate.d("----- skip " + (index + 1) + " : get start url :" + url + " readrindex R")
                    // index++ 
                    // await this.getDataIG(data, index, success_process, err_process, browser)
                }
                rowx++
                await this.getDataIG(start_process, data, rowx, success_p, err_p, browser, page)

            } else {
                voiceupdate.d("     IG end procress")

                browser.close();
                var end_point_process = new Date()
                voiceupdate.dSum(success_p, err_p, start_process, end_point_process, data.length);

                voiceupdate.d("----- end IG close browser")

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
            await this.getDataIG(start_process, data, rowx, success_p, err_p, browser, page)
        } finally {
            browser.close()
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



            db.collection("zprimarykey_voice_instagram").findAndModify(
                {
                    query: { _id: "indexid" },
                    update: { $inc: { seq: 1 } },
                    new: true
                },
                function (err, result) {
                    const d = data
                    if (typeof d !== "undefined") {

                        d["_id"] = result.seq
                        let number = convert.engagementToInt("" + d["likepost"])

                        // console.log("like :" + d["likepost"] + " number :" + number)
                        d["likepost"] = number
                        d["engagement"] = number
                        d["postdate"] = convert.dateFormat(d["postdate"], "ig");
                        d["collectdata"] = convert.dateFormat();
                        d["comment"] = convert.engagementToInt("" + d["comment"])
                        d["postymd"] = convert.dateFormat(d["postdate"], 'POSTYMD');

                    }

                    // console.log(d)

                    db.collection(voice_collect).update(
                        {
                            "voice_message": d.comment
                        },
                        {
                            $set: d
                        },
                        { upsert: true });



                    resolve([result.seq, d["index_id"]])
                });

        })

    } // end to mongo

    async managePost(dataCamps, page, type) {

        return new Promise(async function (resolve, reject) {
            voiceupdate.d("     evaluate data " + type)
            try {
                const rs = await page.evaluate(dataCamps => {
                    return new Promise(async function (resolveEvl, reject) {


                        var passed = [];
                        var keepArr = {};

                        var postlike = document.querySelectorAll('meta[content]');
                        
                        for (const row of postlike) {
                            let like = 0;
                            if (row.content.includes('Likes')) {
                                // console.log(row.content)
                                like = row.content.split('Likes')
                                const postLike = like[0]
                                 


                                var mainmedie = document.querySelector('img.FFVAD[src]');
                                var usercommentall = document.querySelectorAll('.FPmhX.notranslate.TlrDj');

                                var profileImage = document.querySelector('img._6q-tv');

                                var commentall = document.querySelectorAll('.C4VMK span');
                                var timepost = document.querySelector('time[datetime]');
                                // var likepost = document.querySelector('a.zV_Nj'); //ถ้าไม่ login จะไม่ได้ like

                                var countComment = commentall.length - 1
                                // if (!likepost) {
                                //     likepost = document.querySelector('span.vcOH2');
                                // }

                                // if(!likepost){
                                //     likepost == like
                                // }

                                if (!mainmedie) {

                                    mainmedie = document.querySelector('video.tWeCl[poster]');
                                }

                                // if (!likepost) {
                                //     likepost = "0"
                                // } else {
                                //     likepost = likepost.innerText
                                // }



                                var postcom = "page_post";
                                keepArr = {};
                                keepArr["voice_refid"] = "";
                                keepArr["index_id"] = dataCamps[1];
                                keepArr["directurl"] = dataCamps[0];
                                keepArr["image"] = mainmedie.value;
                                keepArr["postdate"] = timepost.attributes[1].value;
                                keepArr["engagement"] = postLike
                                keepArr["campaign_id"] = dataCamps[2];
                                keepArr["campaign_set"] = dataCamps[4];
                                keepArr["keyword"] = dataCamps[3];
                                keepArr["likepost"] = postLike;//ถ้าไม่ login จะไม่ได้ like 
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
                                break;
                            }
                        }
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
            voiceupdate.d("     evaluate data " + typeC)

            const rs = await page.evaluate(dataCamps => {
                try {
                    return new Promise(function (resolveEvl, reject) {

                        var passed = [];
                        var keepArr = {};
                        var mainmedie = document.querySelector('img.FFVAD[src]');
                        var usercommentall = document.querySelectorAll('.FPmhX.notranslate.TlrDj');
                        var commentall = document.querySelectorAll('.C4VMK span');
                        var timepost = document.querySelector('time[datetime]');
                        var likepost = document.querySelector('a.zV_Nj'); //ถ้าไม่ login จะไม่ได้ like

                        if (!likepost) {
                            likepost = document.querySelector('span.vcOH2');
                        }

                        if (!mainmedie) {

                            mainmedie = document.querySelector('video.tWeCl[poster]');
                        }

                        if (!likepost) {
                            likepost = "0"
                        } else {
                            likepost = likepost.innerText
                        }

                        var countComment = commentall.length - 1
                        if (commentall.length == 1) {
                            resolveEvl(passed)
                        } else {
                            for (let index = 1; index < usercommentall.length; index++) {


                                keepArr = {};
                                keepArr["voice_refid"] = dataCamps[5];
                                keepArr["image"] = mainmedie.value;
                                keepArr["index_id"] = dataCamps[1];
                                keepArr["directurl"] = dataCamps[0];
                                keepArr["postdate"] = timepost.attributes[1].value;
                                keepArr["engagement"] = 0
                                keepArr["likepost"] = 0//ถ้าไม่ login จะไม่ได้ like
                                keepArr["postby_name"] = usercommentall[index].innerText;
                                keepArr["postby_picture"] = "";
                                keepArr["voice_message"] = commentall[index].innerText;
                                keepArr["comment"] = countComment;
                                keepArr["typepost"] = "page_comment";
                                keepArr["location_lat"] = "";
                                keepArr["location_long"] = "";
                                keepArr["location_name"] = "";
                                keepArr["source_type"] = "instagram";

                                if (keepArr["voice_message"].includes(dataCamps[3][0])) {
                                    keepArr["campaign_id"] = dataCamps[2];
                                    keepArr["campaign_set"] = dataCamps[4];
                                    keepArr["keyword"] = dataCamps[3];
                                } else {

                                    keepArr["campaign_id"] = '';
                                    keepArr["campaign_set"] = '';
                                    keepArr["keyword"] = '';
                                }




                                passed.push(keepArr);
                                // i++;
                                // await addMongoComment(db,index_id, passed, timetostamp, campaign_id, campaign_set, url, rowx)

                            }
                        }

                        resolveEvl(passed)
                    })
                } catch (error) {
                    reject("EVL comment Promise: " + error)
                }
            }, dataCamps)

            resolve(rs)

        })


    }


    /////////////////// Start Search


    async startSearch(data, rowx) {
        // let url = result[index].url;

        voiceupdate.d("sv start search keyword instagram")
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
                await page.goto("https://www.instagram.com/explore/tags/" + keyword)
                await page.waitFor(1000)
                var divErr = await page.$("div.error-container")

                if (divErr) {
                    voiceupdate.d("Not Data Search")
                    rowx++
                    this.getSearch(data, rowx, browser, page)
                } else {

                    var secPopTap = await page.$("div.EZdmt")

                    if (secPopTap) {

                        await page.evaluate((sel) => {
                            document.querySelector(sel).remove();
                        }, "div.EZdmt")
                    }

                    await page.waitFor(1000);
                    await this.clickone(page);

                    var key = []
                    key.push(keyword)

                    voiceupdate.d("      cliclNextPost ")
                    const rs = await this.cliclNextPost(startCmp, page, campaign_id, campaign_set, key, true, 0, first, browser);

                    rowx++
                    this.getSearch(data, rowx, browser, page)
                }

            } else {
                voiceupdate.showMemoryUsage("instagram")
                voiceupdate.d("-----end instagram close page for TYPE PAGE ")
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

    async cliclNextPost(startCmp, page, campaign_id, campaign_set, keyword, check, contIndex, first, b) {
        try {
            // let contIndexs = contIndex;
            if (check) {

                const clickbtn = await page.$$("a.HBoOv")

                await page.waitFor(400);
                if (clickbtn[0]) {
                    // await page.waitFor(1000);
                    await clickbtn[0].click()
                    await page.waitFor(1000);

                    // await page.addScriptTag({ content: `${this.manageIndex}` });
                    const evaluate_index = await page.evaluate(({ campaign_id, keyword }) => {

                        return new Promise(function (resolve, reject) {
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

                                resolve(passed);


                            } catch (error) {
                                console.log(error);
                            }
                        })
                    }, { campaign_id, keyword });



                    voiceupdate.d("      create index_repo_search " + (contIndex + 1))
                    new LibVoice().updateIndexRepoSearch(evaluate_index, campaign_set, 0)
                    // await page.waitFor(500)
                    ///////// add post
                    // const url = evaluate_index[0]['url']
                    // await page.waitFor(200)
                    // let index_id;
                    // db.collection(index_collection).find({ "url": url }).toArray(async function (err, result) {

                    //     index_id = result[0]._id
                    //     // console.log(index_id);

                    //     const dataCamp = await Promise.all([[url, index_id]].map(new Instagram().camp))
                    //     const dataCamps = dataCamp[0][0]
                    //     // console.log(dataCamps);

                    //     await page.waitFor(500)
                    //     const evalua_post = await new Instagram().managePost(dataCamps, page, "page_post")
                    //     db.collection(voice_collect).remove(
                    //         {
                    //             "index_id": index_id,
                    //             'typepost': "page_post"
                    //         });
                    //     await page.waitFor(500);

                    //     voiceupdate.d("     ToMongo data POST")
                    //     await Promise.all(evalua_post.map(new Instagram().ToMongo))
                    //     await page.waitFor(500)





                    // })
                    ///////// end add post
                    await page.waitFor(200);
                    const rsCheckBrak = await page.evaluate(({ startCmp, first }) => {
                        return new Promise(function (resolve, reject) {
                            try {
                                var time = document.querySelector('time[datetime]')

                                var passed = [];
                                var check = true
                                if (time) {
                                    time = time.attributes[1].value

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

                                    var dateIG = new Date(time)
                                    var dateIGCon = dateIG.getTime()
                                    if (parseInt(dateIGCon) <= datestop) {
                                        check = false
                                    }
                                }


                                resolve(check)
                            } catch (error) {
                                console.log(error);
                            }
                        })
                    }, { startCmp, first });
                    // const rsCheckBrak = await page.evaluate(checkdate);

                    await page.waitFor(300);
                    // console.log(rsCheckBrak);

                    if (!rsCheckBrak) {
                        check = rsCheckBrak

                        voiceupdate.d("      keyword :" + keyword + " count index: " + contIndex)

                        voiceupdate.showMemoryUsage("search ig for keyword")
                        return true
                        //  break;
                    } else {

                        contIndex = contIndex + 1;
                        await this.cliclNextPost(startCmp, page, campaign_id, campaign_set, keyword, check, contIndex, first, b)
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




module.exports = Instagram