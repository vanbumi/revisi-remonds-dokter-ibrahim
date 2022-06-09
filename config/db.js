const mongoose = require ('mongoose');
const config = require('config');
const db = config.get('mongoURI');

//koneksi db
const connectDB = async() => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true, 
      //useCreateIndex: true,
      //useFindAndModify: false 
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected...')
  } catch(err){
    console.error(err.message);

    //exit process with failure
    process.exit(1);
  }
}

// exports module
module.exports = connectDB;
