const h = require('./helpers');
const dbs = require('./db-scripts');
const zds = require('./zd-scripts');
const ufs = require('./uf-scripts');
const sort = require('./sort');

const zdCreds = Buffer.from(process.env.ZD_STRING).toString('base64');


const run = async () => {
  console.log('the first one is working?');
  try {
  
  
  
  
  } catch (err) {
    
  }
  
}
setTimeout(run, 500);
// run();
module.exports = run;