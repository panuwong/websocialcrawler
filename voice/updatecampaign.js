const request = require('request');
const cheerio = require('cheerio');
var convert = require('../lib/convert');
const voiceupdate = require('../lib/voiceupdate');
var mongojs = require('../configDB/db');
db = mongojs.connect;



exports.setUpdateCampaigns = async function (mode, data, collection, limitData = 1000, old = 0, rowx = 0) {

  (async () => {

    // setTimeout(() => {
    // updateCampaign(mode,data, collection, limitData, old, rowx)
    updateCampaignData(mode, data, collection, limitData, old, rowx)

  })();

  // for (const row of result) {
  //   db.collection('campaign_setkeyword').find({ 'campaign_id': row._id }).toArray(function (err, resultKey) {

  //     for (const keyword of resultKey) {


  //       for (const key of keyword.main_keyword) {
  //         var keywords = [];
  //         var campsetkey = {}
  //         campsetkey['id'] = keyword._id
  //         campsetkey['main_keyword'] = key
  //         campsetkey['campaign_id'] = row._id
  //         campsetkey['typeof_keyword'] = keyword.typeof_keyword
  //         keywords.push(campsetkey)

  //         setUpdateCampaigns(mode, keywords, limit, old, 0);
  //       }
  //     }

  //   });
  // }
  function updateCampaignData(mode, data, collection, limitData, old, rowx) {

    try {

      if (data[rowx]) {

        var row = data[rowx]
        var startDate = convert.ymd(row.start_date)
        voiceupdate.d("sv Campaign campaign_id :" + row._id)

        db.collection('campaign_setkeyword').find({ 'campaign_id': row._id }).toArray(function (err, resultKey) {
          for (const keyword of resultKey) {
            for (const key of keyword.main_keyword) {
              var keywords = [];
              var campsetkey = {}
              campsetkey['id'] = keyword._id
              campsetkey['main_keyword'] = key
              campsetkey['campaign_id'] = row._id
              campsetkey['typeof_keyword'] = keyword.typeof_keyword
              keywords.push(campsetkey)

              setUpdateCampaigns(mode, keywords, collection, limitData, old, startDate, 0);
            }
          }
        });


        setTimeout(() => {
          rowx++
          updateCampaignData(mode, data, collection, limitData, old, rowx)
        }, 1000);

      } else {
        voiceupdate.d("----- end loop ")

        return null
      }

    } catch (error) {

    }
  }


  function setUpdateCampaigns(mode, resultKey, collection, limitData, old, startDate, rowx) {
  

    if (resultKey[rowx]) {
      var row = resultKey[rowx]

      voiceupdate.d("     keyword :" + row.main_keyword)

      db.collection(collection).find({ 'voice_message': { $regex: row.main_keyword }, 'postymd': { "$gt": startDate } }).skip(parseInt(old)).limit(parseInt(limitData)).toArray(function (err, resultCount) {


        for (const result of resultCount) {

          var camp_set = row.campaign_id + "_" + row.id + "_" + row.typeof_keyword;

          var camp_index_set = row.id
          // console.log("camp set"+camp_set);

          var campaign_id = result.campaign_id
          var campaign_set = result.campaign_set
          var keyword = result.keyword
          var index_id = result.index_id

          if (!campaign_id) {
            campaign_id = []
          }

          if (!campaign_set) {
            campaign_set = []
          }

          if (!keyword) {
            keyword = []
          }



          campaign_id.push(row.campaign_id)
          campaign_set.push(camp_set)
          keyword.push(row.main_keyword)


          var camp_id = [...new Set(campaign_id)]
          var camp_set = [...new Set(campaign_set)]
          var keywords = [...new Set(keyword)]

          setCamp(result, camp_id, camp_set, keywords, collection, index_id, 0)

          if (collection != "voice_mini_search") {

            updateIndex(index_id, camp_id, camp_index_set, keywords)
          }



        }

        if (limitData == resultCount.length) {

          var limitN = limitData * 2

          var url = "localhost:8081/update-camp?model=" + mode + "&limitD=" + limitN + "&limitOld=" + limitData
          request({
            method: 'GET',
            url: url
          })
        }


      });

      setTimeout(() => {
        rowx++
        setUpdateCampaigns(mode, resultKey, collection, limitData, old, rowx)
      }, 500);
    } else {
      return null
    }
  }


  function setCamp(result, camp_id, camp_set, keyword, collection) {


    db.collection(collection).update({ "_id": result._id }, {
      $set: { "campaign_id": camp_id, "campaign_set": camp_set, "keyword": keyword }
    })


  }


  function updateIndex(index_id, camp_id, camp_index_set, keyword) {

    // console.log(index_id);


    db.collection("index_repo_campaign").find({ "_id": index_id }).toArray(function (err, result) {

      if (result[0]) {
         var keywordCamp = []
        if (result[0].search_keyword){
           keywordCamp = result[0].search_keyword
        } 
        for (const key of keyword) {

          keywordCamp.push(key)
        }
        var campaign_set = []
        
        if(result[0].campaign_set){
          campaign_set = result[0].campaign_set
        }
        campaign_set.push(camp_index_set)
        var camp_set= [...new Set(campaign_set)]
        // var camp_set = []

        // camp_set.push(campaign_set)
        var keywords = [...new Set(keywordCamp)]
        db.collection("index_repo_campaign").update({ "_id": result[0]._id }, {
          $set: { "campaign_id": camp_id, "campaign_set": camp_set, "search_keyword": keywords }
        })
      }
    })



  }

}