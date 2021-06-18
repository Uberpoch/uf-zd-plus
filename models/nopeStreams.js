const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const nopeStreamSchema = new mongoose.Schema({
    id: {
        type: Number, 
        required: 'zd section id missing on nopestream', 
        select: true
    },
    category_id: {
        type: Number, 
        required: 'zd category id missing on nopestream', 
        select: true
    }
});

module.exports = mongoose.model('nopeStream', nopeStreamSchema);