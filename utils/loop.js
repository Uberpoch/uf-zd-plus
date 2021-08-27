const { create } = require('connect-mongo');
const { connect } = require('../app');
const dbs = require('./db-scripts');
const ufs = require('./uf-scripts');

exports.isNopeStream = async (streams) => {
  let nopeArray = [];
  let streamArray = [];
  console.log('isNopeStream start');
  for(let i = 0; i < streams.length; i++) {
    
    if(streams[i].category_id === 360001068432){
      nopeArray.push(streams[i]);
    }
    else {
      streamArray.push(streams[i]);
      // isSavedStream(token, stream, savedStreams);
    }
  }
  console.log('isNopeStream complete');
  return { nopeArray, streamArray };
};

exports.recordNopeStream = async(array, nopeStreams) => {
  let resArray = [];
  console.log('recordNopeStream start');
  if(nopeStreams === undefined){
    for(let i = 0; i < array.length; i++) {
      let obj = {
        id: array[i].id,
        name: array[i].name,
        category_id: array[i].category_id,
      };
      let stream = await dbs.saveNopeStreams(obj);
      resArray.push(stream);
    }
  }
  for(let i = 0; i < array.length; i++) {
    if(nopeStreams.some(dbStream => dbStream.id === array[i].id) === false){
      let obj = {
        id: array[i].id,
        name: array[i].name,
        category_id: array[i].category_id,
      };
      let stream = await dbs.saveNopeStreams(obj);
      resArray.push(stream);
    }
  }
  console.log('recordNopeStream complete');
  return resArray;
};

exports.isSavedStream = async (token, streams, savedStreams) => {
  let createdStreamsArray = [];
  let updatedStreamsArray = [];
  console.log('isSavedStream start');
  if(savedStreams === undefined){
    console.log('no saved streams');
    for(let i = 0; i < streams.length; i++){
      const stream = await ufs.makeStream(token, streams[i]);
      createdStreamsArray = createdStreamsArray.concat(stream);
    }
  } else {
    console.log('saved streams exist');
    console.log('start sorting loop');
    for(let i = 0; i < streams.length; i++){
      if(savedStreams.some(savedStream => savedStream.id === streams[i].id) === false){
        // console.log('item is new')
        // create new stream in UF
        // console.log(streams[0]);
        const createUFStream = await ufs.makeStream(token, streams[i]);
        createUFStream.uf_stream = createUFStream.id;
        createUFStream.id = streams[i].id;
        createUFStream.category_id = streams[i].category_id
        createdStreamsArray = createdStreamsArray.concat(createUFStream);
        // create new stream in DB
        // const createDBStream = dbs.saveStream(createUFStream);
      }
      else {
        // console.log('item is update');
        const index = savedStreams.findIndex(savedStream => savedStream.id === streams[i].id);
        streams[i].uf_stream = savedStreams[index].uf_stream;
        streams[i].id = savedStreams[index].id;
        streams[i].category_id = savedStreams[index].category_id;
        
        
        // update values in UF
        const updateUFStream = await ufs.updateStream(token, streams[i]);
        updatedStreamsArray = updatedStreamsArray.concat(updateUFStream);
        // update values in DB
        // const updateDBStream = dbs.updateStream(updateUFStream);
        
      }
      
    }
  }
  console.log('isSavedStream complete');
  return { createdStreamsArray, updatedStreamsArray };
}

exports.streamsToDBNew = async(array) => {
  let resArray = [];
  console.log('streamsToDBNew start');
  const streams = array.map(stream => {
    const obj = {
      uf_stream: stream.uf_stream,
      id: stream.id,
      category_id: stream.category_id,
      outdated: stream.outdated
    }
    return obj
  });
  for(let i = 0; i < streams.length; i++) {
    let res = await dbs.saveStream(streams[i]);
    resArray = resArray.concat(res);
  }
  console.log('streamsToDBNew complete');
  return resArray;
}
exports.streamsToDBUpdate = async(array) => {
  let resArray = [];
  console.log('streamsToDBUpdate start');
  const streams = array.map(stream => {
    const obj = {
      uf_stream: stream.uf_stream,
      id: stream.id,
      category_id: stream.category_id,
      outdated: stream.outdated
    }
    return obj
  });
  for(let i = 0; i < streams.length; i++) {
    let res = await dbs.updateStream(streams[i]);
    resArray = resArray.concat(res);
  }
  console.log('streamsToDBUpdate complete');
  return resArray;
};

exports.isNopeItems = async(items, nopeStreams ) => {
  let nopeItemArray = [];
  let itemArray = [];
  console.log('isNopeItems start');
  for(let i = 0; i < items.length; i++) {
    if(nopeStreams.some(nopeStream => nopeStream.id === items[i].section_id) === false){
      itemArray.push(items[i]);
    }
    else {
      nopeItemArray.push(items[i]);
      // isSavedStream(token, stream, savedStreams);
    }
  }
  console.log('isNopeItems complete');
  return { nopeItemArray, itemArray };
};

exports.itemAssignStream = async (items, streams) => {
  let array = [];
  console.log('itemAssignStream start');
  for(let i = 0; i < items.length; i++){
    const index = streams.findIndex(stream => stream.id === items[i].section_id);
    items[i].uf_stream = streams[index].uf_stream;
    // console.log(`items matched with streams ${[i]}`);
    array.push(items[i]);
  }

  console.log('itemAssignStream complete');
  return array;
};

exports.itemNewOrUpdate = async (items, savedItems) => {
  let itemsToCreate = [];
  let itemsToUpdate = [];
  console.log('itemNewOrUpdate start');
  console.log(items.length);
  console.log(savedItems.length);
  if(savedItems.length === 0){
    itemsToCreate = itemsToCreate.concat(items);
  } else {
    
    for(let i = 0; i < items; i++) {
      console.log(`sort: ${i}`);
      if(savedItems.some(savedItem => savedItem.id === items[i].id) === false){
        //create list
        // console.log('item to create');
        itemsToCreate = itemsToCreate.concat(items[i]);
      } else {
        //update list
        // console.log('item to update');
        let index = savedItems.findIndex(savedItem => savedItem.id === items[i].id);
        items[i].uf_item = savedItems[index].uf_item;
        itemsToUpdate = itemsToUpdate.concat(items[i]);
      }
    }
  }
  
  console.log('itemNewOrUpdate complete');
  console.log(`items to create ${itemsToCreate.length} items to update ${itemsToUpdate.length}`);
  return { itemsToCreate, itemsToUpdate };
};

exports.itemCreateLoop = async (token, array) => {
  let itemsToPub = [];
  let itemsToDB = [];
  console.log('itemCreateLoop start');
  // console.log(array[0]);
  // console.log(`items to create: ${array.length}`);
  for(let i = 0; i < array.length; i++) {
    let res = await ufs.makeItem(token, array[i]);
    // console.log(`items created: ${i}`);
    if(res.status){
    let pubData = {
      itemId: res.data.id,
      published_at: res.data.published_at
    };
    
    let dbItem = {
      uf_stream: array[i].uf_stream,
      uf_item: res.data.id,
      id: array[i].id,
      draft: array[i].draft,
      section_id: array[i].section_id
    };
    itemsToPub = itemsToPub.concat(pubData);
    itemsToDB = itemsToDB.concat(dbItem);
  } else {
    console.log(`issue with item ${i}`);
    // console.log()
  }
  }
  console.log('itemCreateLoop complete');
  return { itemsToPub, itemsToDB };
};

exports.itemUpdateLoop = async (token, array) => {
  let itemsUpdatePub = [];
  let itemsUpdateDB = [];
  // console.log(`items to update: ${array.length}`);
  console.log('itemUpdateLoop start');
  for(let i = 0; i < array.length; i++) {
    let res = await ufs.makeItem(token, array[i]);
    // console.log(`items updated: ${i}`)
    let pubData = {
      itemId: res.data.id,
      published_at: res.data.published_at
    };
    
    let dbItem = {
      uf_stream: array[i].uf_stream,
      uf_item: res.data.id,
      id: array[i].id,
      draft: array[i].draft,
      section_id: array[i].section_id
    };
    itemsUpdatePub = itemsUpdatePub.concat(pubData);
    itemsUpdateDB = itemsUpdateDB.concat(dbItem);
  }
  console.log('itemUpdateLoop complete');
  return { itemsUpdatePub, itemsUpdateDB };
};
exports.itemNewDBLoop = async (array) => {
  console.log('itemNewDBLoop start');
  for(let i = 0; i < array.length; i++) {
    dbs.saveItem(array[i]);
  }
  console.log('itemNewDBLoop complete');
};

exports.itemUpdateDBLoop = async (array) => {
  console.log('itemUpdateDBLoop start');
  for(let i = 0; i < array.length; i++) {
    dbs.itemUpdate(array[i]);
  }
  console.log('itemUpdateDBLoop complete');
};
exports.publishAll = async (token, array) => {
  let resArray = [];
  console.log('publishAll start');
  for(let i = 0; i < array.length; i++){
    let res = await ufs.publishItem(token, array[i]);
    resArray.push(res);
  }
  console.log('publishAll complete');
  return resArray;
}
