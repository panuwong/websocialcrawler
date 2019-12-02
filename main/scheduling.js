'use strict';

const mongojs = require('../configDB/db');
const db = mongojs.connect;
const youtube = require('../voice/youtube')
const facebookcrawler = require('../voice/facebookcrawler')
const facebookpost = require('../voice/facebookpost')
const webcrawler = require('../voice/webcrawler')
const pantip = require('../voice/pantip')
const twitter = require('../voice/twitter')

const instagram = require('../voice/instagram')
const updateCamp = require('../voice/updatecampaign')

const convert = require('../lib/convert')

const index_collection = "index_repo_campaign"

// const server = require('../lib/server')
const libs = require('../lib/voiceupdate')

const Twitter = require('../voice/twitter.class');
// const twitter = new Twitter();


exports.mainManage = function (model, limitData = 1000, callback, limitR = 500) {


    try {

        process.setMaxListeners(Infinity);

        // if (server.checkPerformance()) {
            libs.d("-----server ok")
            // console.log("mainManage limit :"+limitData);
            var date_now = Date.now();//1542084181388    1550206994
            // var nextdd = date_now.getTime();
            var nextdd = date_now.toString();
            nextdd = nextdd.substr(0, 10);
            var date_now_t = parseInt(nextdd);
            db.collection(index_collection).find({ 'platform': model, 'status': 'Y', 'readindex': 'Y', 'readnexttime': { $lte: date_now_t } }).sort({ qc_score: -1, rereadindexdate: -1 }).limit(parseInt(limitData)).toArray(function (err, result) {

                // db.collection(index_collection).aggregate([{ "$match": { "platform": model, "readindex": "R" } }, { "$group": { "_id": { "platform": "$platform" }, "COUNT(*)": { "$sum": 1 } } }, { "$project": { "count": "$COUNT(*)", "_id": 0 } }], { "allowDiskUse": true }).toArray(function (err, resultCount) {

                //     if (resultCount.length > 0) {
                //         if (  server.checkPerformance() < 80) {
                            requestCrawler(result, 0, model);
                    //     } else {
                    //         callback("break")
                    //         libs.d("-----data readindex R :" + resultCount[0].count + " for platform :" + model + " > " + limitR)


                    //     }
                    // } else {

                    //     if (model == "website" && result.length == 0) {
                    //         db.collection("index_mini_search").find({ 'platform': model, 'status': 'Y', 'readindex': 'Y', 'readnexttime': { $lte: date_now_t } }).sort({ qc_score: -1, rereadindexdate: -1 }).limit(parseInt(limitData)).toArray(function (err, resultmini) {
                    //             requestCrawler2(resultmini, 0, model);
                    //         });

                    //     } else {
                    //         requestCrawler(result, 0, model);
                    //     }


                    // }


                // })

                if (!result) {
                    throw "NO INDEX RETURN FROM index_repo_campaign_bk"
                }
            });
        // } else {
        //     var d = 'server  hard working  MEMORY > 80%'
        //     callback(d)
        //     libs.d("-----" + d)


        // }


    } catch (err) {
        console.error("QUERY INDEX REPO CAMPAIGN : " + err.message);

    }

    async function updateStatus(data, rowx) {
        if (data[rowx]) {
            db.collection(index_collection).update({ "_id": data[rowx][1] }, {
                $set: { "readindex": 'R', "readindexdate": new Date() }
            });// หยิบแล้ว stamp ทันที

            rowx++;
            await updateStatus(data, rowx)
        } else {
            db.collection(index_collection).update({ "_id": data }, {
                $set: { "readindex": 'R', "readindexdate": new Date() }
            });// หยิบแล้ว stamp ทันที

        }
    }


    async function updateStatus2(data, rowx) {
        if (data[rowx]) {
            db.collection('index_mini_search').update({ "_id": data[rowx][1] }, {
                $set: { "readindex": 'R', "readindexdate": new Date() }
            });// หยิบแล้ว stamp ทันที

            rowx++;
            await updateStatus(data, rowx)
        } else {
            db.collection('index_mini_search').update({ "_id": data }, {
                $set: { "readindex": 'R', "readindexdate": new Date() }
            });// หยิบแล้ว stamp ทันที

        }
    }

    function requestCrawler(result, rowx, model) {

        try {

            var yUrl = [];
            var fbPostUrl = [];
            var fbPageUrl = [];
            var webUrl = [];
            var websUrl = [];
            var youtubeUrl = [];
            var panUrl = [];
            var twPostUrl = [];
            var igPostUrl = [];
            var igPageUrl = [];

            var dataloop = 0;
            var loopto = 0
            var countloop = 0

            var looptoP = 0
            var countloopP = 0

            var looppost = 0
            var looppage = 0
            for (const row of result) {
                if (model == "facebook" || model == "instagram" || model == "twitter") {
                    if (row.platform_typepost === "posts") {
                        looppost++
                    } else if (row.platform_typepost === "pages") {
                        looppage++
                    }
                }
            }





            if (model == "facebook") {
                var limitD = looppost
                loopto = Math.clz32(limitD) * Math.ceil(limitD / 100)
            } else if (model == "pantip") {
                var limitD = result.length
                loopto = Math.clz32(limitD) * Math.ceil(limitD / 100)
            } else if (model == "instagram") {
                var limitD = looppost
                loopto = Math.clz32(limitD) * Math.ceil(limitD / 100)
            } else if (model == "twitter") {
                var limitD = looppost
                loopto = Math.clz32(limitD) * Math.ceil(limitD / 100)
            } else {
                var limitD = result.length
                loopto = Math.clz32(limitD) * Math.ceil(limitD / 100)
            }



            if (model == "facebook") {
                var limitP = looppage
                looptoP = Math.clz32(limitP) * Math.ceil(limitP / 100)
            }
            else if (model == "instagram") {
                var limitP = looppage
                looptoP = Math.clz32(limitP) * Math.ceil(limitP / 100)
            } else if (model == "twitter") {
                var limitP = looppage
                looptoP = Math.clz32(limitP) * Math.ceil(limitP / 100)
            }

            let lengthResultP = result.length
            if (looppage > 0) {
                lengthResultP = looppage
            }


            let lengthResult = result.length
            if (looppost > 0) {
                lengthResult = looppost
            }


            var dataloop = Math.ceil(lengthResult / loopto);

            var loop = Math.floor(lengthResult / dataloop)


            var dataloopP = Math.ceil(lengthResultP / looptoP);

            var loopP = Math.floor(lengthResultP / dataloopP)

            var datatoLoop = loop * dataloop
            var countloops = 0;
            var countloopsP = 0;
            // var countA =  Math.ceil(result/50);
            // console.log(lengthResult)
            // console.log(dataloop)
            // console.log(loop)
            // console.log(datatoLoop)
            var typeLoop = [{ twPost: 0, instagramPage: 0, instagramPost: 0, facebookPage: 0, facebookPost: 0, webUrl: 0, panUrl: 0, yUrl: 0 }]
            var ig = 1; var tw = 1;
            for (const row of result) {

                var collect_minute = row.collect_minute;
                collect_minute = (collect_minute != '') ? parseInt(collect_minute) : 60;

                var timetostamp = convert.getNextTimetostampDate(collect_minute, 'm')




                switch (row.platform) {
                    case "youtube":
                        // updateStatus(row._id)
                        var videoid = row.url.split("=")
                        var a = [row.url, row._id, videoid[1], timetostamp]
                        yUrl.push(a);

                        if (yUrl.length == loop) {

                            updateStatus(yUrl, 0)
                            countloops = countloops + yUrl.length
                            youtube.getCommentThread(yUrl, 0);//ส่งไป Crawler

                            typeLoop[0].yUrl = typeLoop[0].yUrl + yUrl.length;
                            yUrl = [];
                            countloop++
                        }
                        if (dataloop != 1) {
                            if (countloop == dataloop - 1) {
                                var s = lengthResult - countloops
                                loop = s;
                            }
                        }

                        break;
                    case "facebook":

                        var url = row.url
                        // if (typeof url !== "undefined" && newdata.platform_typepost==="posts") {
                        //     console.log("posts");
                        //     facebookcrawler.getSinglePostFromScheduling(url,newdata._id,timetostamp);//ส่งไป Crawler เอา voice
                        // }else if (typeof url !== "undefined" && newdata.platform_typepost==="pages") {
                        //     console.log("pages");
                        //     facebookcrawler.getPost(url,newdata._id,timetostamp);//ส่งไป Crawler เอาอินเด็กลง campagin
                        // }
                        var a = [url, row._id, timetostamp]
                        // var a = ["https://www.facebook.com/LaLiga/videos/live-the-mcdonalds-virtual-laliga-esports-/1751398894896662/",17909,timetostamp]

                        if (row.platform_typepost === "posts") {

                            // updateStatus(row._id)
                            fbPostUrl.push(a)



                            if (fbPostUrl.length == loop) {
                                updateStatus(fbPostUrl, 0)
                                facebookpost.getSinglePostOnly(fbPostUrl, 0, true);
                                countloops = countloops + fbPostUrl.length
                                typeLoop[0].facebookPost = typeLoop[0].facebookPost + fbPostUrl.length;
                                fbPostUrl = []
                                countloop++

                            }

                            //  var s = result.length - dataloop 
                            if (dataloop != 1) {
                                if (countloop == dataloop - 1) {
                                    var s = lengthResult - countloops
                                    loop = s;
                                }
                            }

                        } else if (row.platform_typepost === "pages") {

                            fbPageUrl.push(a)
                            if (fbPageUrl.length == loopP) {
                                updateStatus(fbPageUrl, 0)
                                ///
                                facebookcrawler.getPost(fbPageUrl, 0, true)
                                countloopsP = countloopsP + fbPageUrl.length
                                typeLoop[0].facebookPage = typeLoop[0].facebookPage + fbPageUrl.length;
                                fbPageUrl = []
                                countloopP++

                            }
                            //  var s = result.length - dataloop 
                            if (dataloopP != 1) {
                                if (countloopP == dataloopP - 1) {
                                    var s = lengthResultP - countloopsP
                                    loopP = s;
                                }
                            }

                        }

                        break;

                    case "pantip":

                        var a = [row.url, row._id, "pantip.com", timetostamp]
                        panUrl.push(a)
                        // updateStatus(row._id)
                        if (panUrl.length == loop) {
                            updateStatus(panUrl, 0)
                            console.log("Start pantip");
                            pantip.getComment(panUrl, 0, true);//ส่งไป Crawler
                            countloops = countloops + panUrl.length
                            typeLoop[0].panUrl = typeLoop[0].panUrl + panUrl.length;
                            panUrl = []
                            countloopP++
                        }
                        // var s = result.length - dataloop 
                        if (dataloop != 1) {
                            if (countloopP == dataloop - 1) {
                                var s = lengthResult - countloops
                                loop = s;
                            }
                        }



                    case "twitter":

                        var a = [row.url, row._id, timetostamp]
                        if (row.platform_typepost === "posts") {

                            // updateStatus(row._id)
                            twPostUrl.push(a)
                            if (twPostUrl.length == loop) {

                                // updateStatus(twPostUrl, 0)
                                // twitter.getTwitterLanding(twPostUrl, 0, true);
                                

                                new Twitter().getTwitterLanding(twPostUrl, 0, true);

                                countloops = countloops + twPostUrl.length

                                typeLoop[0].twPost = typeLoop[0].twPost + twPostUrl.length;
                                twPostUrl = []
                                tw++;

                                countloop++
                            }
                            // var s = result.length - dataloop /
                            if (dataloop != 1) {
                                if (countloop == dataloop - 1) {
                                    var s = lengthResult - countloops
                                    loop = s;
                                }
                            }
                        }
                        break;
                    case "instagram":

                        var a = [row.url, row._id, timetostamp]
                         
                        if (row.platform_typepost === "posts") {

                            // updateStatus(row._id)
                            igPostUrl.push(a)
                            if (igPostUrl.length == loop) {

                                // updateStatus(igPostUrl, 0)
                                instagram.getCommentInMediaPup(igPostUrl, ig, 0, true);
                                countloops = countloops + igPostUrl.length
                                typeLoop[0].instagramPost = typeLoop[0].instagramPost + igPostUrl.length;
                                igPostUrl = []
                                ig++;
                                countloop++
                            }
                            if (dataloop != 1) {
                                if (countloop == dataloop - 1) {
                                    var s = lengthResult - countloops
                                    loop = s;
                                }
                            }

                        } 

                        break;
                    case "website":
                        // var url = row.url
                        var a = [row.url, row.domain, row._id, timetostamp]

                        // if (typeof url !== "undefined") {
                        // console.log(url);
                        // setTimeout(() => {
                        websUrl.push(a)
                        if (websUrl.length == loop) {

                            updateStatus(websUrl, 0)

                            webcrawler.getWebCrawler(websUrl, 0);//ส่งไป Crawler
                            countloops = countloops + websUrl.length
                            websUrl = []

                            countloop++
                        }
                        // }, 200);
                        // }Í

                        if (dataloop != 1) {
                            if (countloop == dataloop - 1) {
                                var s = lengthResult - countloops
                                loop = s;
                            }
                        }
                        typeLoop[0].webUrl = typeLoop[0].webUrl + 1;
                        break;
                    default:
                        break;
                }
            }

            var d = "finish scheduling"
            if (model == "website") {

                d += " webUrl :" + typeLoop[0].webUrl
            } else if (model == "instagram") {

                d += " instagramPost :" + typeLoop[0].instagramPost
            } else if (model == "facebook") {

                d += " facebookPost :" + typeLoop[0].facebookPost
                d += " facebookPage :" + typeLoop[0].facebookPage
            } else if (model == "pantip") {

                d += " pantipUrl :" + typeLoop[0].panUrl
            } else if (model == "youtube") {

                d += " youtubeUrl :" + typeLoop[0].yUrl
            } else if (model == "twitter") {

                d += " twUrl :" + typeLoop[0].twPost
            }
            // d += " instagramPage :"+typeLoop[0].instagramPage

            console.log(d);



            callback(null, d);

        }
        catch (err) {
            console.error("ARRAY INDEX BEFORE CRAW : " + err.message);
        }



    }

    function requestCrawler2(result, rowx, model) {

        try {

            var yUrl = [];
            var fbPostUrl = [];
            var fbPageUrl = [];
            var webUrl = [];
            var websUrl = [];
            var youtubeUrl = [];
            var panUrl = [];
            var twPostUrl = [];
            var igPostUrl = [];
            var igPageUrl = [];

            var dataloop = 0;
            var loopto = 0
            var countloop = 0

            var looptoP = 0
            var countloopP = 0

            var looppost = 0
            var looppage = 0
            for (const row of result) {
                if (model == "facebook" || model == "instagram" || model == "twitter") {
                    if (row.platform_typepost === "posts") {
                        looppost++
                    } else if (row.platform_typepost === "pages") {
                        looppage++
                    }
                }
            }





            if (model == "facebook") {
                var limitD = looppost
                loopto = Math.clz32(limitD) * Math.ceil(limitD / 100)
            } else if (model == "pantip") {
                var limitD = result.length
                loopto = Math.clz32(limitD) * Math.ceil(limitD / 100)
            } else if (model == "instagram") {
                var limitD = looppost
                loopto = Math.clz32(limitD) * Math.ceil(limitD / 100)
            } else if (model == "twitter") {
                var limitD = looppost
                loopto = Math.clz32(limitD) * Math.ceil(limitD / 100)
            } else {
                var limitD = result.length
                loopto = Math.clz32(limitD) * Math.ceil(limitD / 100)
            }



            if (model == "facebook") {
                var limitP = looppage
                looptoP = Math.clz32(limitP) * Math.ceil(limitP / 100)
            }
            else if (model == "instagram") {
                var limitP = looppage
                looptoP = Math.clz32(limitP) * Math.ceil(limitP / 100)
            } else if (model == "twitter") {
                var limitP = looppage
                looptoP = Math.clz32(limitP) * Math.ceil(limitP / 100)
            }

            let lengthResultP = result.length
            if (looppage > 0) {
                lengthResultP = looppage
            }


            let lengthResult = result.length
            if (looppost > 0) {
                lengthResult = looppost
            }


            var dataloop = Math.ceil(lengthResult / loopto);

            var loop = Math.floor(lengthResult / dataloop)


            var dataloopP = Math.ceil(lengthResultP / looptoP);

            var loopP = Math.floor(lengthResultP / dataloopP)

            var datatoLoop = loop * dataloop
            var countloops = 0;
            var countloopsP = 0;
            // var countA =  Math.ceil(result/50);
            // console.log(lengthResult)
            // console.log(dataloop)
            // console.log(loop)
            // console.log(datatoLoop)
            var typeLoop = [{ twPost: 0, instagramPage: 0, instagramPost: 0, facebookPage: 0, facebookPost: 0, webUrl: 0, panUrl: 0, yUrl: 0 }]
            var ig = 1; var tw = 1;
            for (const row of result) {

                var collect_minute = row.collect_minute;
                collect_minute = (collect_minute != '') ? parseInt(collect_minute) : 60;

                var timetostamp = convert.getNextTimetostampDate(collect_minute, 'm')




                switch (row.platform) {

                    case "website":
                        // var url = row.url
                        var a = [row.url, row.domain, row._id, timetostamp]

                        // if (typeof url !== "undefined") {
                        // console.log(url);
                        // setTimeout(() => {
                        websUrl.push(a)
                        if (websUrl.length == loop) {

                            updateStatus2(websUrl, 0)

                            webcrawler.getWebCrawlerMiniSearch(websUrl, 0);//ส่งไป Crawler
                            countloops = countloops + websUrl.length
                            websUrl = []

                            countloop++
                        }
                        // }, 200);
                        // }Í

                        if (dataloop != 1) {
                            if (countloop == dataloop - 1) {
                                var s = lengthResult - countloops
                                loop = s;
                            }
                        }
                        typeLoop[0].webUrl = typeLoop[0].webUrl + 1;
                        break;
                    default:
                        break;
                }
            }

            var d = "finish scheduling"
            if (model == "website") {

                d += " webUrl :" + typeLoop[0].webUrl
            } else if (model == "instagram") {

                d += " instagramPost :" + typeLoop[0].instagramPost
            } else if (model == "facebook") {

                d += " facebookPost :" + typeLoop[0].facebookPost
                d += " facebookPage :" + typeLoop[0].facebookPage
            } else if (model == "pantip") {

                d += " pantipUrl :" + typeLoop[0].panUrl
            } else if (model == "youtube") {

                d += " youtubeUrl :" + typeLoop[0].yUrl
            } else if (model == "twitter") {

                d += " twUrl :" + typeLoop[0].twPost
            }
            // d += " instagramPage :"+typeLoop[0].instagramPage

            console.log(d);



            callback(null, d);

        }
        catch (err) {
            console.error("ARRAY INDEX BEFORE CRAW : " + err.message);
        }



    }

}


exports.updateCamp = function (mode, limit = 1000, old = 0, callback) {

    db.collection('campaigns').find({ 'active_status': 'Y', 'status': 'Y' }).toArray(function (err, result) {

        if (result) {
            setUpdateCampaigns(result, mode, limit, old, 0);
        } else {
            callback('campaigns active status N')
        }

    });

    callback(null, 'update Camp')

    function setUpdateCampaigns(result, mode, limit, old, rowx = 0) {


        try {


            var collect = "voice_" + mode

            updateCamp.setUpdateCampaigns(mode, result, collect, limit, old, 0)


        }
        catch (err) {
            console.error("ARRAY INDEX BEFORE CRAW : " + err.message);
        }


    }


}

exports.searchKeyword = function (model, callback) {

    db.collection('campaigns').find({ 'active_status': 'Y', 'status': 'Y' }).toArray(function (err, result) {

        if (result) {
            
            for (const row of result) {
                let d = (row.readfirsttieme != '' ) ? parseInt(d) : 0; 


                let firstT = 0
                if(d == 1){
                    firstT = 1
                } else {

                    db.collection('campaigns').update({ "_id": row._id }, {
                        $set: { "readfirsttieme": '1'}
                    });// หยิบแล้ว stamp ทันที 
                }

                db.collection('campaign_setkeyword').find({ 'campaign_id': row._id }).toArray(function (err, result) {

                    requestSearch(model, result, row.start_date ,firstT, 0);
                    if (!result) {
                        throw "NO INDEX RETURN FROM index_repo_campaign_bk"
                    }
                });
            }
        } else {
            callback('campaigns active status N')
        } 

    });

    function requestSearch(model, result, start_cmp,firstT, rowx) {

        try {


            let searchKeyword = [];

            let searchKeywordA = [];

            for (const row of result) {

                for (const keyword of row.main_keyword) {
                    searchKeyword = []
                    let data = [row._id, row.campaign_id, keyword, start_cmp,0]
                    searchKeyword.push(data)
                    searchKeywordA.push(data)

                   if (model == "twitter") {

                        twitter.getSearchForKeyword(searchKeyword, 0)
                    } else if (model == "pantip") {

                        pantip.getSearchForKeyword(searchKeyword, 0)
                    } else if (model == "facebookcrawler") {

                        facebookcrawler.getSearchForKeyword(searchKeyword, 0)
                    } else if (model == "youtube") {

                        youtube.getYoutubeNochannel(searchKeyword, 0)
                    } else   if (model == "instagram") {

                        instagram.getSearchForKeyword(searchKeyword, 0)
                    }  

 


                }
            }

          
            // instagram.getSearchForKeyword(searchKeyword, 0)
            // facebookcrawler.getSearchForKeyword(searchKeyword,0)\
            // facebookcrawler.getSearchForKeyword(searchKeyword,0)


            callback(null, searchKeywordA);

        }
        catch (err) {
            console.error("ARRAY INDEX BEFORE CRAW : " + err.message);
        }



    }


}

// exports.repeatR = function () {


//     try {
   
//             libs.d("-----start repeatR") 
//             var date_now = Date.now(); 
//             nextdd = date_now.toString();
//             nextdd = nextdd.substr(0, 10);
//             var date_now_t = parseInt(nextdd);



//             db.collection(index_collection).find({'readindex': 'R', 'readnexttime': { $lte: date_now_t } }).sort({ qc_score: -1, rereadindexdate: -1 }).limit(parseInt(limitData)).toArray(function (err, result) {

//                 db.collection(index_collection).aggregate([{ "$match": { "platform": model, "readindex": "R" } }, { "$group": { "_id": { "platform": "$platform" }, "COUNT(*)": { "$sum": 1 } } }, { "$project": { "count": "$COUNT(*)", "_id": 0 } }], { "allowDiskUse": true }).toArray(function (err, resultCount) {

//                     if (resultCount.length > 0) {
//                         // if (  server.checkPerformance() < 80) {
//                             requestCrawler(result, 0, model);
//                         // } else {
//                         //     callback("break")
//                         //     libs.d("-----data readindex R :" + resultCount[0].count + " for platform :" + model + " > " + limitR)


//                         // }
//                     } else {

//                         if (model == "website" && result.length == 0) {
//                             db.collection("index_mini_search").find({ 'platform': model, 'status': 'Y', 'readindex': 'Y', 'readnexttime': { $lte: date_now_t } }).sort({ qc_score: -1, rereadindexdate: -1 }).limit(parseInt(limitData)).toArray(function (err, resultmini) {
//                                 requestCrawler2(resultmini, 0, model);
//                             });

//                         } else {
//                             requestCrawler(result, 0, model);
//                         }


//                     }


//                 })

//                 if (!result) {
//                     throw "NO INDEX RETURN FROM index_repo_campaign_bk"
//                 }
//             });
//         // } else {
//         //     var d = 'server  hard working  MEMORY > 80%'
//         //     callback(d)
//         //     libs.d("-----" + d)


//         // }


//     } catch (err) {
//         console.error("QUERY INDEX REPO CAMPAIGN : " + err.message);

//     }

//     async function updateStatus(data, rowx) {
//         if (data[rowx]) {
//             db.collection(index_collection).update({ "_id": data[rowx][1] }, {
//                 $set: { "readindex": 'R', "readindexdate": new Date() }
//             });// หยิบแล้ว stamp ทันที

//             rowx++;
//             await updateStatus(data, rowx)
//         } else {
//             db.collection(index_collection).update({ "_id": data }, {
//                 $set: { "readindex": 'R', "readindexdate": new Date() }
//             });// หยิบแล้ว stamp ทันที

//         }
//     }
   
// }



