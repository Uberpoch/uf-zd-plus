const mongoose = require('mongoose');

require('dotenv').config({path: '.env'});

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

require('./models/Items');
require('./models/Runs');
require('./models/Streams');
require('./models/nopeStreams');

const app = require('./app');
app.set('port', process.env.port || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running => PORT ${server.address().port}`);
})