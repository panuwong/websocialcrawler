var mongojs = require('mongojs');

var databaseUrl = 'mongodb://ivb:ivb2018!ja@159.65.141.81:54302/mandala_db?authSource=admin';
var collections = ['c2-index','voice_facebook','voice_instagram','index_repo_campaign','voice_pantip','youtube-voice-test'];


var connect = mongojs(databaseUrl, collections);


module.exports = {
    connect: connect
};
