const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const runSchema = new mongoose.Schema({
    epochDateStamp: {
        type: Number,
        required: 'Epoch Date error',
},
});

module.exports = mongoose.model('Run', runSchema);