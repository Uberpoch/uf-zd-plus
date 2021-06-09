const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const nopeStreamSchema = new mongoose.Schema({
    id: {type: Number, required: true, select: true},
    html_url: String,
    category_id: {type: Number, required: true, select: true},
    created_at: Date,
    updated_at: Date,
    name: String,
    outdated: Boolean,
    parent_section_id: Number
});

module.exports = mongoose.model('nopeStream', nopeStreamSchema);