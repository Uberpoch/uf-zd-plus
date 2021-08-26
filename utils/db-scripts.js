const mongoose = require('mongoose');
// const { findOneAndUpdate } = require('../models/Items');

const Streams = mongoose.model('Stream');
const Items = mongoose.model('Item');
const Runs = mongoose.model('Run');
const nopeStreams = mongoose.model('nopeStream');

exports.createNextEpoch = async (item) => {
  const run = await (new Runs(item)).save();
}

exports.getLastEpoch = async () => {
  const run = await Runs.find().sort({'_id':-1}).limit(1);
  return run[0].epochDateStamp;
}

exports.saveStream = async (item) => {
  return await (new Streams(item)).save();
}

exports.getStreams = async () => {
  return await Streams.find({});
}

exports.saveNopeStreams = async (item) => {
  return await (new nopeStreams(item)).save();
}
exports.getNopeStreams = async () => {
  return await nopeStreams.find({});
}

exports.updateStream = async (item) => {
  const update = {
    uf_stream: item.uf_stream,
    id: item.id,
    category_id: item.category_id,
    outdated: item.outdated
  };
  return await Streams.findOneAndUpdate(
    {id: item.id}, 
    {$set: update}, 
    {"new": true}
  );
}

exports.saveItem = async (item) => {
  return await (new Items(item)).save();
}

exports.getItems = async () => {
  return await Items.find({});
}

exports.updateItem = async (item) => {
  const update = {
    uf_stream: item.uf_stream,
    uf_item: item.uf_item,
    id: item.id,
    draft: item.draft,
    section_id: item.section_id
  };
  const itemUpdate =  await Items.findOneAndUpdate(
    {id: item.id}, 
    {$set: update}, 
    {new: true, runValidators: true, context: 'query'}
    );
  return itemUpdate;
}

// const item = await Items.findOneAndUpdate(
// {item-id: req.item.id},
// {$set: updates},
// {new: true, runValidators: true, context: 'query'}
// )