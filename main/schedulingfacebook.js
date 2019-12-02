var mongojs = require('../configDB/db');
var db = mongojs.connect;
var facebook = require('../voice/facebook')


var convert = require('../lib/convert')

var index_collection = "master_page"

var server = require('../lib/server')
var libs = require('../lib/voiceupdate')
exports.mainManage = function (limitData = 1000, callback, limitR = 500) {


    try {

        if (server.checkPerformance()) {
            libs.d("-----server ok")
            // console.log("mainManage limit :"+limitData);
            var date_now = Date.now();//1542084181388    1550206994
            // var nextdd = date_now.getTime();
            nextdd = date_now.toString();
            nextdd = nextdd.substr(0, 10);
            var date_now_t = parseInt(nextdd);
            db.collection(index_collection).find({ 'platform': "facebook", 'status': 'Y', 'readindex': 'Y', 'readnexttime': { $lte: date_now_t } }).sort({ qc_score: -1, rereadindexdate: -1 }).limit(parseInt(limitData)).toArray(function (err, result) {

           

                            requestCrawler(result, 0, "facebook");


                if (!result) {
                    throw "NO INDEX RETURN FROM index_repo_campaign_bk"
                }
            });
        } else {
            var d = 'server  hard working  MEMORY > 90%'
            callback(d)
            libs.d("-----"+d)


        }


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




    function requestCrawler(result, rowx, model) {

        try {

            var fbPageUrl = [];
           

            var looptoP = 0
            var countloopP = 0

            var looppage = 0
            for (const row of result) {
                if (model == "facebook") {
                    if (row.platform_typepost === "pages") {
                        looppage++
                    }
                }
            }


            if (model == "facebook") {
                var limitP = looppage
                looptoP = Math.clz32(limitP) * Math.ceil(limitP / 100)
            }
            

            let lengthResultP = result.length
            if (looppage > 0) {
                lengthResultP = looppage
            }







            var dataloopP = Math.ceil(lengthResultP / looptoP);

            var loopP = Math.floor(lengthResultP / dataloopP)

            var countloopsP = 0;
            // var countA =  Math.ceil(result/50);
            // console.log(lengthResult)
            // console.log(dataloop)
            // console.log(loop)
            // console.log(datatoLoop)
            var typeLoop = [{ facebookPage: 0}]
            for (const row of result) {

                var collect_minute = row.collect_minute;
                collect_minute = (collect_minute != '') ? parseInt(collect_minute) : 60;

                var timetostamp = convert.getNextTimetostampDate(collect_minute, 'm')




                switch (row.platform) {
                    
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
                        if(row.platform_typepost==="pages") {

                            fbPageUrl.push(a)
                            if (fbPageUrl.length == loopP) {
                                updateStatus(fbPageUrl, 0)
                                ///
                                facebook.getPostfrommasterpagefacebook(fbPageUrl,0,true)
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

                    default:
                        break;
                }
            }

            var d = "finish scheduling"
            if (model == "facebook") {

                d += " facebookPage :" + typeLoop[0].facebookPage
            } 

            console.log(d);



            callback(null, d);

        }
        catch (err) {
            console.error("ARRAY INDEX BEFORE CRAW : " + err.message);
        }



    }

   
}


