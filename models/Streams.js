const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const streamSchema = new mongoose.Schema({
    uf_stream: {type: Number, required: true, select: true},
    id: {type: Number, required: true, select: true},
    html_url: String,
    category_id: {type: Number, required: true, select: true},
    created_at: Date,
    updated_at: Date,
    name: String,
    outdated: Boolean,
    parent_section_id: Number
});

module.exports = mongoose.model('Stream', streamSchema);