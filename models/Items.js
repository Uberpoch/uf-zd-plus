const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const itemSchema = new mongoose.Schema({
    uf_stream: {type: Number, required: true, select: true},
    uf_item: {type: Number, required: true, select: true},
    id: {type: Number, required: true, select: true},
    draft: Boolean,
    section_id: {type: Number, required: true, select: true},
    created_at: {type: Date, required: true},
    updated_at: {type: Date, required: true},
    name: String,
    title: String,
    edited_at: Date,
    user_segment_id: Number,
    permission_group_id: Number,
    label_names: [String]
});

module.exports = mongoose.model('Item', itemSchema);