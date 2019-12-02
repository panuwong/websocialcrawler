const https = require('https');
const request = require('request');



exports.getProxyCrawler = function(callback){


    const url = encodeURIComponent('https://www.thairath.co.th/content/1430161');
    var jar = request.jar();

  request({
    method: 'GET',
    url: "https://api.proxycrawl.com/?token=F0qCKwuf54wvQnhf8xaDfA&page_wait=2000&url=" + url + "&format=json",
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':'*',
        'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
    },
    jar:jar
    }, function(err, response, body) {
            callback(null, body)
  });



}