var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var videosSchema = mongoose.Schema({
    created: { //informacoes do upload do video
        type: Date,
        default: Date.now
    },
    title: { //nome que o usuario escolhe pro video
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    },
    videoName: { //nome original do video
        type: String
    },
    user: { //usuario que subiu o video
        type: Schema.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Videos', videosSchema);
