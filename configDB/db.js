var mongojs = require('mongojs');

var databaseUrl = '';
var collections = ['c2-index','voice_facebook','voice_instagram','index_repo_campaign','voice_pantip','youtube-voice-test','zprimarykey_voice_instagram'];


var connect = mongojs(databaseUrl, collections);


module.exports = {
    connect: connect
};
