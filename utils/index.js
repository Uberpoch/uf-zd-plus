const h = require('./helpers');
const dbs = require('./db-scripts');
const zds = require('./zd-scripts');
const ufs = require('./uf-scripts');
const sort = require('./sort');

const zdCreds = Buffer.from(process.env.ZD_STRING).toString('base64');



const run = async () => {
  console.log('the first one is working?');
  try {
    // Get all data and tokens
    const token = await ufs.auth();
    const lastEpoch = await dbs.getLastEpoch();
    const zdItems = await zds.getZdReturnedValues(zdCreds,lastEpoch);
    console.log(`articles count: ${zdItems.articles.length}`);

    
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


setTimeout(run, 500);
// run();
module.exports = run;