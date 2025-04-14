import connectDB from './db/index.js';
import dotenv from 'dotenv';
import { app } from './app.js';

dotenv.config({
    path: '.env'
})
connectDB()
    .then(
        app.listen(process.env.PORT || 8000, () => {
            console.log("listening on port : ", process.env.PORT || 8000);
        })
    )
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

    app.on('error', (error) => {
            console.log("Error : " + error);
            throw error
    })
// import express from 'express';

// const app = express()

// ;( async() => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

//         app.listen(process.env.PORT, () => {
//             console.log("Listening on port : ", process.env.PORT)
//         })
//     }
//     catch (e) {
//         console.log("Error : ", e);
//         throw e;
//     }
// })()