const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    process.exit(1); // Optional: Exit the process with failure if the connection fails
  }
};



// const connectToDatabase = async () => {
//     try {

// mongoose.connect("mongodb+srv://username:password@cluster0.mongodb.net/dbname?retryWrites=true&w=majority")
//     .then(() => console.log("MongoDB connection successful"))
//     .catch((error) => console.error("Error connecting to the database:", error));
//     } catch (error) {
//       console.error("Error connecting to the database:", error.message);
//       process.exit(1); // Optional: Exit the process with failure if the connection fails
//     }
//   };



// module.exports = connectToDatabase;

 




// const { MongoClient } = require('mongodb');

// const uri = "mongodb+srv://sandeepsharma:5beXfF7i0xDpdWng@cluster0.sd89r.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri , {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
// })
// async function connectToDatabase() {
//     try {
//         await client.connect();
//         console.log("Connected to MongoDB Atlas");
//         // Perform database operations here
//     } catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//     } finally {
//         await client.close();
//     }
// }

module.exports = connectToDatabase;
