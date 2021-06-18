const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const streamSchema = new mongoose.Schema({
    uf_stream: {
        type: Number, 
        required: 'uf stream id mssing on stream', 
        select: true
    },
    id: {
        type: Number, 
        required: 'zd section id missing on stream', 
        select: true
    },
    category_id: {
        type: Number, 
        required: 'zd category id missing on stream', 
        select: true
    },
    outdated: Boolean
});

module.exports = mongoose.model('Stream', streamSchema);