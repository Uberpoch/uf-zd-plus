// const testData = require('./test')
// const throttledQueue = require('throttled-queue');

const dbs = require('./db-scripts');
const ufs = require('./uf-scripts');
// const zds = require('./zd-scripts');

// const throttle = throttledQueue(15, 1000);


const isSavedStream = async (token, stream, savedStreams) => {
  if(!savedStreams.some(savedStream => savedStream.id === stream.id)){
    // create new stream in UF
    const createUFStream = await ufs.makeStream(token, stream);
    // create new stream in DB
    const createDBStream = dbs.saveStream(createUFStream);
  }
  else {
    // update values in UF
    const updateUFStream = await ufs.updateStream(token, stream);
    // update values in DB
    const updateDBStream = dbs.updateStream(updateUFStream);
  }
}

const isNopeStream = async (token, stream, savedStreams, nopeStreams) => {
  if(!stream.category_id === 360001068432){
    // move to next step
    isSavedStream(token, stream, savedStreams);
  }
  else {
    dbs.saveNopeStreams(stream);
  }
}

exports.streamLoop = async (token, streamData, savedStreams, nopeStreams) => {
  streamData.forEach(stream => {
    // check if nope stream
    isNopeStream(token, stream, savedStreams, nopeStreams);
  })
}


const isSavedItem = async (token, item, savedItems, streamsForItems) => {
  if(!savedItems.some(savedItem => savedItem.id === item.id)){
    // find which stream the item is in
    const streamIndex = streamsForItems.findIndex(streamForItem => streamForItem.id === item.section_id);

    // item.uf_stream = streamsForItems[streamIndex].uf_stream;
    const thisStream = streamsForItems[streamIndex];
    console.log(thisStream);
    // create new item in UF
    const createUFItem = await ufs.makeItem(token, item);

    // create new item in DB
    const createDBItem = dbs.saveItem(createUFItem);
  }
  else {
    // find which stream the item is in
    const itemIndex = savedItems.findIndex(savedItem => savedItem.id === item.id);
    item.uf_stream = savedItems[itemIndex].uf_stream;
    item.uf_item = savedItems[itemIndex].uf_item;
    // update item in UF
    const updateUFItem = await ufs.updateItem(token, item);

    // update item in DB
    const updateDBItem = dbs.updateItem(updateUFItem);
  }
};

const itemInNopeStream = async (token, item, savedItems, streamsForItems, nopeStreams) => {
  if(!nopeStreams.some(nopeStream => nopeStream.id === item.section_id)){
    // move to next step
    isSavedItem(token, item, savedItems, streamsForItems);
  }
}

exports.itemLoop = async (token, itemData, savedItems, streamsForItems, nopeStreams) => {
  itemData.forEach(item => {
    itemInNopeStream(token, item, savedItems, streamsForItems, nopeStreams)
  })
}