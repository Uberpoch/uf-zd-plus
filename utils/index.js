const h = require('./helpers');
const dbs = require('./db-scripts');
const zds = require('./zd-scripts');
const ufs = require('./uf-scripts');
const sort = require('./sort');
const loop = require('./loop');
const server = require('../start.js');

const zdCreds = Buffer.from(process.env.ZD_STRING).toString('base64');



const run = async () => {
  console.log('Starting script run');
  try {
    // Get all data and tokens
    const token = await ufs.auth();
    // console.log(token);
    const lastEpoch = await dbs.getLastEpoch();
    // console.log(lastEpoch);
    const zdItems = await zds.getZdReturnedValues(zdCreds,lastEpoch);
    console.log(`articles count: ${zdItems.articles.length}`);
    console.log(`streams count: ${zdItems.sections.length}`)

    
    // Sort data
    const nextEpoch = await {epochDateStamp: zdItems.end_time};
    console.log(nextEpoch);
    if(lastEpoch === zdItems.end_time){
      process.kill(process.pid, 'SIGTERM')
    }

    const streamData = await zdItems.sections;
    const itemData = await zdItems.articles;

    // get DB values Streams
    const savedStreams = await dbs.getStreams();
    // console.log(savedStreams);
    
    // get DB values items
    const savedItems = await dbs.getItems();
    // console.log(savedItems.length);
    
    // get DB values nope streams
    const nopeStreams = await dbs.getNopeStreams();
    // console.log(nopeStreams.length);

    const { nopeArray, streamArray } = await loop.isNopeStream(streamData);

    const resNope = await loop.recordNopeStream(nopeArray, nopeStreams);
    console.log(`${resNope.length} nopeStreams created`);
    const { createdStreamsArray, updatedStreamsArray } = await loop.isSavedStream(token, streamArray, savedStreams);

    const toDBStreams = await loop.streamsToDBNew(createdStreamsArray);
    // console.log(toDBStreams.length);
    // console.log(toDBStreams);
    const putDBStreams = await loop.streamsToDBUpdate(updatedStreamsArray);
    // console.log(putDBStreams.length);
    // console.log(putDBStreams);
    const latestNopeStreams = await dbs.getNopeStreams();
    const { nopeItemArray, itemArray } = await loop.isNopeItems(itemData, latestNopeStreams);
    console.log(`nopeItemArray: ${nopeItemArray.length}`);
    console.log(`itemArray: ${itemArray.length}`);
    const latestSavedStreams = await dbs.getStreams();
    const allItems = await loop.itemAssignStream(itemArray, latestSavedStreams);
    
    const { itemsToCreate, itemsToUpdate } = await loop.itemNewOrUpdate(allItems, savedItems);
    console.log(`items to create ${itemsToCreate.length} items to update ${itemsToUpdate.length}`);
    
    let { itemsToPub, itemsToDB } = await loop.itemCreateLoop(token, itemsToCreate);

    let { itemsUpdatePub, itemsUpdateDB } = await loop.itemUpdateLoop(token, itemsToUpdate);
    // console.log(itemsToPub.length);
    // console.log(itemsToPub);

    await loop.itemNewDBLoop(itemsToDB);
    await loop.itemUpdateDBLoop(itemsUpdateDB);
    console.log(`total: ${itemsToPub.length} plus ${itemsUpdatePub.length}`)
    itemsToPub = itemsToPub.concat(itemsUpdatePub);
    console.log(`total is: ${itemsToPub.length}`);
    // console.log(itemsToPub);
    const published = await loop.publishAll(token, itemsToPub);
    console.log(`${published.length} items published`);
    const lastStep = await dbs.createNextEpoch(nextEpoch);
    
    setTimeout(() => {
      process.kill(process.pid, 'SIGTERM')
    }, 1500)

  
  } catch (err) {
    console.log('Error:', err.message);
  }
  
}


setTimeout(run, 500);
// run();
module.exports = run;