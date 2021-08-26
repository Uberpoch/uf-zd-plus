// const testData = require('./test')
// const throttledQueue = require('throttled-queue');
const jsesc = require('jsesc');
const dbs = require('./db-scripts');
const ufs = require('./uf-scripts');
// const zds = require('./zd-scripts');

// const throttle = throttledQueue(15, 1000);






// exports.streamLoop = async (token, streamData, savedStreams, nopeStreams) => {
//   let complete = false;
//   // console.log(complete);
//   const runs = streamData.length - 1;
//   let ran = 1;
//   streamData.forEach((stream, index) => {
//     // check if nope stream
//     isNopeStream(token, stream, savedStreams, nopeStreams);
//     ran = index;
//     console.log(`${ran} of ${runs}`)

//     if(runs === ran) {
//       complete = true;
//     }
//   })
//   if(complete === true) {
//     return complete;
//   }
// }


const isSavedItem = async (token, item, savedItems, streamsForItems) => {

  if(savedItems.some(savedItem => savedItem.id === item.id) === false){
    // console.log('item is to be created new');
    // find which stream the item is in
    const index = streamsForItems.findIndex(streamForItem => streamForItem.id === item.section_id);

    item.uf_stream = streamsForItems[index].uf_stream;
    // console.log(item);
    // create new item in UF
    const createUFItem = await ufs.makeItem(token, item);

    // create new item in DB
    const createDBItem = dbs.saveItem(createUFItem);
    
  }
  else {
    // console.log('item is to update');
    // find which stream the item is in
    const index = savedItems.findIndex(savedItem => savedItem.id === item.id);
    // console.log(index);
    // console.log(savedItems[index]);
    item.uf_stream = savedItems[index].uf_stream;
    item.uf_item = savedItems[index].uf_item;
    
    // update item in UF
    const updateUFItem = await ufs.updateItem(token, item);
    // console.log(updateUFItem);
    // // update item in DB
    const updateDBItem = dbs.updateItem(updateUFItem);

  }
};

const itemInNopeStream = async (token, item, savedItems, streamsForItems, nopeStreams) => {
  // console.log(!nopeStreams.some(nopeStream => nopeStream.id === item.section_id));
  if(nopeStreams.some(nopeStream => nopeStream.id === item.section_id) === false){
    // console.log('not in nopestream. move to isSavedItems');
    // move to next step
    isSavedItem(token, item, savedItems, streamsForItems);
  }
}

exports.itemLoop = async (token, itemData, savedItems, streamsForItems, nopeStreams) => {
  let complete = false;

  const runs = itemData.length - 1;
  let ran = 0;
  itemData.forEach((item, index)=> {
    itemInNopeStream(token, item, savedItems, streamsForItems, nopeStreams);
    ran = index;
    if(runs === ran){
      complete = true;
    }
  })
  if(complete === true){
    return complete;
  }
}