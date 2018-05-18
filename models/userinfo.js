var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserInfoSchema = new Schema({
    name: String,
    watch_history: String
});
UserInfoSchema.set('collection', 'vod');

module.exports = mongoose.model('UserInfoSchema', UserInfoSchema);