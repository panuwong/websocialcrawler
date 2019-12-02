const request = require('request');
const cheerio = require('cheerio');
const voiceupdate = require('./lib/voiceupdate');


exports.getUrlSpider = function (url, rowx, type, timetostamp) {


    var passed = [];
    var passedD = [];
    var start_process = new Date();
    var success_process = 0;
    var err_process = 0;
    var end_point_process = new Date();
    (async () => {
        try {
            voiceupdate.d("----- start getUrl " + url)
            getUrlSpiderd(url, rowx, type, timetostamp)

        } catch (error) {
            console.log("main" + error);

        }
    })();

    function extractHostname(url) {
        var hostname;
        //find & remove protocol (http, ftp, etc.) and get hostname

        if (url.indexOf("//") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }

        //find & remove port number
        hostname = hostname.split(':')[0];
        //find & remove "?"
        hostname = hostname.split('?')[0];

        return hostname;
    }



    function getUrlSpiderd(url, rowx, type, timetostamp, loopPTree = 0, dataMain = []) {

        let loopTree = loopPTree
        var dataMainR = dataMain;
        voiceupdate.readIndexChangeY(type, timetostamp)
        try {
            const urlMain = url[rowx];
            if (urlMain) {
                console.log(urlMain);

                // const urlMain = url[rowx];

                const checkUrl = extractHostname(urlMain)

                var jar = request.jar();
                console.log("start");
                request({
                    method: 'GET',
                    url: urlMain,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': '*',
                        'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
                    },
                    jar: jar
                }, function (err, response, body) {
                    if (!err && response.statusCode === 200) {
                        let $ = cheerio.load(body);


                        // console.log("start loop");
                        voiceupdate.d("----- start loop" + urlMain)

                        $('a[href]').each(function () {
                            var link = $(this).attr('href');
                            try {

                                var sublink = link.match(/[a-zA-Z]+/g);
                                // console.log(sublink); 
                                var data = ''

                                if (!link.includes('/sharer') && !link.includes('help') && !link.includes('intent')) {
                                    if (link.includes(checkUrl)) {
                                        if (sublink[0] == "http") {
                                            // link = "http:" + link
                                            data = link
                                        } else if (sublink[0] == "https") {

                                            // link = "https:" + link
                                            data = link
                                        } else if (sublink[0] != "https" || sublink[0] != "http") {
                                            link = "http:" + link
                                            data = link
                                        } else {

                                            data = link
                                        }

                                    } else {
                                        if (type = 'thairath') {
                                            if (!link.includes('#')) {

                                                link = "https://" + checkUrl + link
                                                // passed.push(link)

                                                data = link

                                            }
                                        }
                                    }
                                }
                                passed.push(data)

                                var kArray = {}

                                checkSubLink(type, data, function (res) {
                                    if (res) {
                                        kArray['url'] = data
                                        kArray['domain'] = checkUrl
                                        kArray['platform_typepost'] = res

                                        kArray['title_search'] = $(this).text();
                                        passedD.push(kArray)
                                    }
                                })

                            } catch (error) {
                                // console.error();

                                console.error("ERR :" + error);
                                rowx++
                            }
                        });

                        voiceupdate.d("----- end loop")
                        var data = [...new Set(passed)]
                        // console.log("count link : " + passed.length);
                        if (rowx == 0) {
                            loopTree = data.length * 3
                        }

                        passedD = [...new Set(passedD)]
                        rowx++

                        if (data.length <= loopTree) {
                            if (dataMainR.length <= loopTree) {

                                dataMainR = data
                            } else {

                                passed = []
                            }
                        } else {
                            var dd = [...new Set(passed)]
                            if (dd.length > dataMainR.length) {

                                dataMainR = data
                            }
                            passed = []
                        }

                        voiceupdate.d("count link : " + data.length)
                        voiceupdate.d("count loop : " + dataMainR.length)
                        voiceupdate.d("count treeloop : " + loopTree)
                        voiceupdate.d("count loop : " + rowx)
                        if (dataMainR.length > loopTree) {
                            voiceupdate.updateIndexRepoSearch(passedD, 0, function (res) {

                                if (res) {
                                    passedD = []

                                    if (rowx <= loopTree) {

                                        // for (let index = 0; index < 5; index++) {
                                            
                                        //     rowx++;
                                            getUrlSpiderd(dataMainR, rowx, type, timetostamp, loopTree, dataMainR)
                                        // }
                                       



                                    } else {

                                        voiceupdate.d("----- end loop ")
                                        end_point_process = new Date()
                                        voiceupdate.dSum(success_process, err_process, start_process, end_point_process, 0);
                                        voiceupdate.d("----- end close")


                                       

                                        var url = "http://localhost:8081/scheduling-min-search"

                                        // var urlservice = 'http://localhost:8080/scheduling-min-search';
                                        request({
                                            method: 'GET',
                                            url: url
                                        })

                                    }
                                }
                            })
                        } else {
                            getUrlSpiderd(dataMainR, rowx, type, timetostamp, loopTree, dataMainR)
                        }

                    } else {
                        voiceupdate.d("err count loop : " + rowx)
                        rowx++
                        voiceupdate.d("data : " + url.length)
                        voiceupdate.d("next url : " + url[rowx])
                        getUrlSpiderd(url, rowx, type, timetostamp, loopTree, dataMain)

                    }

                });//ปิด request
            } else {
                rowx++
                voiceupdate.d("next url : " + url[rowx])
                getUrlSpiderd(url, rowx, type, timetostamp, loopTree, dataMain)
            }


        } catch (error) {
            rowx++
            getUrlSpiderd(url, rowx, type, timetostamp, loopTree, dataMain)
            // console.err(error); 
            console.error(error);


        }
        // })();


    }



    function checkSubLink(type, link, callback) {

        var dataType = ""
        switch (type) {
            case 'sanook':

                var s = link
                var sub = s.split('/')
                var subPost = sub[sub.length - 2]

                var type = subPost.match(/[0-9]+/g);

                if (subPost != '' && type != null) {

                    dataType = 'post'
                } else {

                    dataType = 'page'
                }



                break;

            case 'thairath':

                var s = link
                var sub = s.split('/')
                var subPost = sub[sub.length - 1]
                var type = subPost.match(/[0-9]+/g);
                if (subPost != '' && type != null) {

                    dataType = 'post'
                } else {

                    dataType = 'page'
                }





                break;

            case 'posttoday':
                var s = link
                var sub = s.split('/')
                var subPost = sub[sub.length - 1]
                var type = subPost.match(/[0-9]+/g);
                if (subPost != '' && type != null) {

                    dataType = 'post'
                } else {

                    dataType = 'page'
                }


                break;
            case 'partiharn':
                var s = link
                var sub = s.split('/')
                var subPost = sub[sub.length - 1]
                var type = subPost.match(/[0-9]+/g);
                if (subPost != '' && type != null) {

                    dataType = 'post'
                } else {

                    dataType = 'page'
                }

                break;

            case 'mgronline':
                var s = link
                var sub = s.split('/')
                var subPost = sub[sub.length - 1]
                var type = subPost.match(/[0-9]+/g);
                if (subPost != '' && type != null) {

                    dataType = 'post'
                } else {

                    dataType = 'page'
                }

                break;


            case 'matichon':

                var s = link
                var sub = s.split('/')
                var subPost = sub[sub.length - 1]
                var type = subPost.match(/[news][_][0-9]+/g);
                if (subPost != '' && type != null) {

                    dataType = 'post'
                } else {

                    dataType = 'page'
                }


                break;

            case 'khaosod':

                var s = link
                var sub = s.split('/')
                var subPost = sub[sub.length - 1]
                var type = subPost.match(/[news][_][0-9]+/g);
                if (subPost != '' && type != null) {

                    dataType = 'post'
                } else {

                    dataType = 'page'
                }


                break;

            case 'dailynews':
                var s = link
                var sub = s.split('/')
                var subPost = sub[sub.length - 1]
                var type = subPost.match(/[0-9]+/g);
                if (subPost != '' && type != null) {

                    dataType = 'post'
                } else {

                    dataType = 'page'
                }
                break;

            case 'amarintv':
                var s = link
                var sub = s.split('/')
                var subPost = sub[sub.length - 2]

                var type = subPost.match(/[0-9]+/g);

                type = (type != null) ? type : subPost.match(/[news][-][0-9]+/g);

                if (subPost != '' && type != null) {

                    dataType = 'post'
                } else {

                    dataType = 'page'
                }

                break;

            case '77jowo':
                var s = link
                var sub = s.split('/')
                var subPost = sub[sub.length - 1]
                var type = subPost.match(/[0-9]+/g);
                if (subPost != '' && type != null) {

                    dataType = 'post'
                } else {

                    dataType = 'page'
                }

            default:
                break;
        }

        callback(dataType)

    }





}