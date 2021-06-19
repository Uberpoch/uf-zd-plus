// const testData = require('./test')
// const throttledQueue = require('throttled-queue');
const jsesc = require('jsesc');
const dbs = require('./db-scripts');
const ufs = require('./uf-scripts');
// const zds = require('./zd-scripts');

// const throttle = throttledQueue(15, 1000);


const isSavedStream = async (token, stream, savedStreams) => {

  if(savedStreams.some(savedStream => savedStream.id === stream.id) === false){

    // create new stream in UF
    const createUFStream = await ufs.makeStream(token, stream);

    // create new stream in DB
    const createDBStream = dbs.saveStream(createUFStream);
  }
  else {
    const index = savedStreams.findIndex(savedStream => savedStream.id === stream.id);
    stream.uf_stream = savedStreams[index].uf_stream;
    // console.log(stream);
    // update values in UF
    const updateUFStream = await ufs.updateStream(token, stream);
    // update values in DB
    const updateDBStream = dbs.updateStream(updateUFStream);
    
  }
}

const isNopeStream = async (token, stream, savedStreams, nopeStreams) => {
  // console.log(stream.category_id === 360001068432);
  if(stream.category_id === 360001068432){
    // move to next step
    dbs.saveNopeStreams(stream);
    
  }
  else {
    isSavedStream(token, stream, savedStreams);
  }
}

exports.streamLoop = async (token, streamData, savedStreams, nopeStreams) => {
  streamData.forEach(stream => {
    // check if nope stream
    isNopeStream(token, stream, savedStreams, nopeStreams);
  })
}


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
  itemData.forEach(item => {
    itemInNopeStream(token, item, savedItems, streamsForItems, nopeStreams)
  })
}