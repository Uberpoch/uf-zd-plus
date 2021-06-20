require('dotenv').config({path: '.env'});

const h = require('./helpers');
const dbs = require('./db-scripts');
const zds = require('./zd-scripts');
const ufs = require('./uf-scripts');
const sort = require('./sort');

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const promisify = require('es6-promisify');
const expressValidator = require('express-validator');
const helpers = require('./utils/helpers');

const zdCreds = Buffer.from(process.env.ZD_STRING).toString('base64');

const connectDB = async() => {

  mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false,
    bufferCommands: false,
    keepAlive: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: null
  }
  )
  .then(() => {
    console.log(`mongoose connected to mongo`);
  })
  mongoose.set('debug', false)
  mongoose.Promise = global.Promise;
  mongoose.connection.on('error', (err) => {
    console.log(`🚫🚫🚫🚫 => ${err.message}`);
  })
  mongoose.connection.on('disconnected', function(){
    console.log("Mongoose default connection is disconnected");
  });
}

require('./models/Items');
require('./models/Runs');
require('./models/Streams');
require('./models/nopeStreams');

const run = async () => {
  console.log('the first one is working?');
  try {
    // Get all data and tokens
    const token = await ufs.auth();
    const lastEpoch = await dbs.getLastEpoch();
    const zdItems = await zds.getZdReturnedValues(zdCreds,lastEpoch);


    
    // Sort data
    const nextEpoch = await {epochDateStamp: zdItems.end_time};
    const streamData = await zdItems.sections;
    const itemData = await zdItems.articles;


    console.log('number of new items');
    console.log(itemData.length);
    // get DB values Streams
    const savedStreams = await dbs.getStreams();

    // get DB values items
    const savedItems = await dbs.getItems();

    // get DB values nope streams
    const nopeStreams = await dbs.getNopeStreams();
    const runStreamLoop = await sort.streamLoop(token, streamData, savedStreams, nopeStreams);
    // await sort.compareStreams(token, streamData, savedStreams, nopeStreams)
    setTimeout(async function(){
      // console.log('timeout complete running items');
      const streamsForItems = await dbs.getStreams();
      const runItemLoop = await sort.itemLoop(token, itemData, savedItems, streamsForItems, nopeStreams);
      // const finalItems = await sort.compareItems(token, itemData, savedItems, streamsForItems, nopeStreams)
    }, 1500);
      
    const lastStep = await dbs.createNextEpoch(nextEpoch);
  
  } catch (err) {
    console.log(err);
  }
  
}

const zdufInt = async () => {
  console.log('zdufInt started')
try {
  connectDB();
  setTimeout(run, 500);
} catch (err) {
  console.log(err);
}
}
zdufInt();
