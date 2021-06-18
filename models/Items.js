const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const itemSchema = new mongoose.Schema({
    uf_stream: {
        type: Number, 
        required: 'uf_stream on Item is missing', 
        select: true
    },
    uf_item: {
        type: Number, 
        required: 'uf_item id on item is missing', 
        select: true
    },
    id: {
        type: Number, 
        required: 'zd item id on item is missing', 
        select: true
    },
    draft: Boolean,
    section_id: {
        type: Number, 
        required: 'zd section id on item is missing', 
        select: true
    }
});

module.exports = mongoose.model('Item', itemSchema);