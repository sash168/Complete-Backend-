import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        //console.log(`connectionInstance : ${connectionInstance.connection.host}`);
    }
    catch (e) {
        console.log("Error in mongo : ", e)
    }
}

export default connectDB;