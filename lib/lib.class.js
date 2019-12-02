'use strict';
const mongojs = require('../configDB/db');
const db = mongojs.connect;
const dateFormat = require('dateformat');
const convert = require('./convert');

const index_collection = "index_repo_campaign"
const index_repo_search = "index_repo_campaign"



class LibVoice {



    readIndexChangeR(index_id, error_status, code_error = 200, index_collection = "index_repo_campaign") {
        (async () => {

            if (code_error == 200) {
                db.collection(index_collection).update({ "_id": index_id }, {
                    $set: { "readindex": 'Y', "status": 'N', "error_status": error_status, "readnexttime": 0, "readindexdate": new Date() }
                });// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง

            } else if (code_error == 501) {


                db.collection(index_collection).find({ "_id": index_id }).limit(1).toArray(function (err, result) {

                    for (const row of result) {
                        let countTimeOut = 0
                        if (row.counttimeout) {
                            countTimeOut = row.counttimeout
                        }
                        if (countTimeOut <= 5) {
                            countTimeOut++
                            db.collection(index_collection).update({ "_id": index_id }, {
                                $set: { "readindex": 'Y', "error_status": error_status, "readnexttime": 0, "readindexdate": new Date(), "counttimeout": countTimeOut }
                            });// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง

                        } else {
                            db.collection(index_collection).update({ "_id": index_id }, {
                                $set: { "readindex": 'Y', "status": 'N', "error_status": error_status, "readnexttime": 0, "readindexdate": new Date() }
                            });// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง

                        }
                    }

                });




            }

            this.d("     " + error_status + "     update status y in index_id : " + index_id);


        })();
    }


    readIndexChangeRAllUrl(data, rowx, error_status) {
        (async () => {
            if (data[rowx]) {
                db.collection(index_collection).update({ "_id": result[2] }, {
                    $set: { "readindex": 'Y', "error_status": error_status, "readnexttime": 0, "readindexdate": new Date() }
                });// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง

                rowx++;

                this.readIndexChangeRAllUrl(data, rowx, error_status)
            } else {
                console.log("update readindex Y not to do ");

            }
        })();
    }


    readIndexChangeY(index_id, timetostamp, caption) {
        return new Promise(function (resolve, reject) {
            db.collection(index_collection).update({ "_id": index_id }, {
                $set: { "title_voice": caption, "readindex": 'Y', "error_status": '', "readnexttime": timetostamp, "readindexdate": new Date(), "counttimeout": 0 }
            });// หยิบแล้ว stamp กลับเป็น Y ทันที พร้อมเซทเวลาในการคลอเลออีกครั้ง

            new LibVoice().d("     update status y in index_id : " + index_id);
            resolve(index_id)
        })


    }

    showMemoryUsage(type) {
        (async () => {
            const used = process.memoryUsage();
            for (let key in used) {
                console.log("     " + type + " " + `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
            }
            // await page.close();

            // console.log();
            this.d("     " + type + " show end memmory")
        })();
    }


    d(text) {
        let date = new Date()
        console.log(text + " ----- " + dateFormat(date, "isoDateTime"))
    }


    dSum(success_process, err_process, start_time, end_point_time, total_data) {

        console.log("----- SUMMARY PROCRESS -----")
        console.log("      Total      :" + success_process + " /" + total_data)
        console.log("      success    :" + success_process)
        console.log("      error      :" + err_process)
        console.log("      start time :" + start_time + "  end time :" + end_point_time)

        // let start = new Date(start_time);
        // let end = new Date(end_point_time);

        let h = start_time.getHours() - end_point_time.getHours()
        let m = start_time.getMinutes() - end_point_time.getMinutes()
        let s = start_time.getSeconds() - end_point_time.getSeconds()

        console.log("      SUMMARY Time " + h + ":" + m + ":" + s + " for TOTAL:" + total_data)

        console.log("----------------------------")

    }


    proxyData(key) {
        return new Promise(function (resolve, reject) {
            try {
                let proxy = [];
                if (key) {
                    db.collection("master_proxy").find({ 'status': 'Y', 'proxy_platform': key }).sort({ count: 1 }).limit(1).toArray(function (err, result) {
                        // console.log(result);
                        if (result.length > 0) {
                            let dataproxy = result[0];
                            let proxy_id = dataproxy._id;
                            let proxyip = dataproxy.ip;
                            let myuser = dataproxy.user;
                            let mypass = dataproxy.pass;
                            let countnew = parseInt(dataproxy.count) + 1;
                            db.master_proxy.update({ "_id": proxy_id },
                                { $set: { "count": countnew } },
                                function (err, result) { }
                            );



                            proxy.push(proxyip);
                            proxy.push(myuser);
                            proxy.push(mypass);

                        }
                    });
                } else {
                    resolve( "NOT PROXY PLATFORM")
                }

                resolve(proxy)
            } catch (error) {
                reject(error)
            }
        })

    }


    updateStatus(data, rowx) {


        return new Promise(function (resolve, reject) {
            if (data[rowx]) {

                db.collection(index_collection).find({ "_id": data[rowx][1] }).toArray(async function (err, result) {

                    if (result[0].readindex == 'R') {
                        resolve(false)
                    } else if (result[0].readindex == 'Y' && result[0].readnexttime > 0) {
                        resolve(false)
                    } else {
                        db.collection(index_collection).update({ "_id": data[rowx][1] }, {
                            $set: { "readindex": 'R', "readindexdate": new Date() }
                        });// หยิบแล้ว stamp ทันที
                        resolve(true)
                    }

                });

            }
        })
    }


    proxyDataFacebook(calldata) {
        (async () => {

            db.collection("master_proxy").find({ 'status': 'Y', 'proxy_platform': "facebook" }).sort({ count: 1 }).limit(1).toArray(function (err, result) {
                // console.log(result);
                if (result.length > 0) {
                    let dataproxy = result[0];
                    let proxy_id = dataproxy._id;
                    let proxyip = dataproxy.ip;
                    let myuser = dataproxy.user;
                    let mypass = dataproxy.pass;
                    let proxy_country = dataproxy.proxy_country;
                    let countnew = parseInt(dataproxy.count) + 1;
                    db.master_proxy.update({ "_id": proxy_id },
                        { $set: { "count": countnew } },
                        function (err, result) { }
                    );

                    let proxy = [];

                    proxy.push(proxyip);
                    proxy.push(myuser);
                    proxy.push(mypass);
                    proxy.push(proxy_country);

                    calldata(proxy)
                }
            });

        })();
    }



    getAgent() {

        user_agent_list = [
            // #Chrome
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
            'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
            'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
            'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36',
            'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
            'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
            'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
            //  #Firefox
            'Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1)',
            'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
            'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)',
            'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko',
            'Mozilla/5.0 (Windows NT 6.2; WOW64; Trident/7.0; rv:11.0) like Gecko',
            'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
            'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0; Trident/5.0)',
            'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko',
            'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
            'Mozilla/5.0 (Windows NT 6.1; Win64; x64; Trident/7.0; rv:11.0) like Gecko',
            'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
            'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
            'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)'
        ];
        return user_agent_list[Math.floor(Math.random() * user_agent_list.length)];


    }


    updateIndexRepoSearch(data, campaign_set, rowx, platform_typepost) {

        if (!(platform_typepost) || platform_typepost != "pages") {
            platform_typepost = "posts"
        }
        if ((data[rowx])) {

            let camp_set = []
            camp_set.push(campaign_set)

            db.collection(index_repo_search).find({ "url": data[rowx]['url'], "search_keyword": data[rowx]['search_keyword'] }).toArray(function (err, resultcheck) {
                // console.log(resultcheck.length);

                if (resultcheck.length == 0) {
                    if ((data[rowx])) {
                        db.collection("zprimarykey_index_repo_campaign").findAndModify(
                            {
                                query: { _id: "indexid" },
                                update: { $inc: { seq: 1 } },
                                new: true
                            },
                            function (err, result) {

                                let keepArr = {};
                                keepArr['_id'] = result.seq

                                keepArr['campaign_set'] = camp_set
                                keepArr['platform_typepost'] = platform_typepost
                                keepArr['readindex'] = 'Y'
                                keepArr['readindexdate'] = convert.dateFormat()
                                keepArr['readnexttime'] = 0
                                keepArr['qc_score'] = 1
                                keepArr['collect_minute'] = 43200
                                keepArr['createymd'] = convert.dateFormat(convert.dateFormat(), 'POSTYMD');
                                keepArr['createdate'] = convert.dateFormat()
                                keepArr['updatedate'] = convert.dateFormat()
                                keepArr['temp_user_id'] = ''
                                keepArr['status'] = 'Y'
                                keepArr['counttimeout'] = 0
                                keepArr['error_status'] = ''
                                keepArr['by_name'] = '1'

                                data[rowx] = { ...data[rowx], ...keepArr };


                                db.collection(index_repo_search).insert(data[rowx], function (err, res) {
                                    if (err) {
                                        console.error('insert ' + index_repo_search + ' :' + err);
                                    } else {
                                        // console.log("insert voice_facebook Success: NO."+rowx);
                                        rowx++;
                                        new LibVoice().updateIndexRepoSearch(data, campaign_set, rowx, platform_typepost)
                                    }

                                });


                            });//ปิด run number mongo
                    }

                } else if (resultcheck.length > 0) {

                    let keepArr = {};
                    let ca = []
                    ca = resultcheck[0].campaign_set
                    ca.push(campaign_set)

                    let datas = [...new Set(ca)]

                    var dup = new LibVoice().hasDuplicates(datas)

                    if (dup) {
                        keepArr['campaign_set'] = datas

                        data[rowx] = { ...data[rowx], ...keepArr };

                        db.collection(index_repo_search).update(
                            {
                                "_id": resultcheck[0]._id,
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
                                    new LibVoice().updateIndexRepoSearch(data, campaign_set, rowx, platform_typepost)
                                }
                            });

                    }


                }
            });



        } else {
            // return true
        }

    }


    hasDuplicates(array) {
        var valuesSoFar = Object.create(null);
        for (var i = 0; i < array.length; ++i) {
            var value = array[i];
            if (value in valuesSoFar) {
                return true;
            }
            valuesSoFar[value] = true;
        }
        return false;
    }
}

module.exports = LibVoice;



