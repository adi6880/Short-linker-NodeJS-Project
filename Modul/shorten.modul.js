// import path from "path";
// import {readFile,writeFile} from "fs/promises"

// const Data_File = path.join("data", "link.json");

// export const loadlink = async () => {
//     try {
//         const data = await readFile(Data_File, "utf-8"); // Read JSON file
//         return JSON.parse(data); // Convert JSON string to JS object
//     } catch (error) {
//         // If file doesn't exist, create it with empty object
//         if (error.code === "ENOENT") {
//             await writeFile(Data_File, JSON.stringify({}));
//             return {};
//         }
//         throw error; // Throw other errors
//     }
// };

// // Function to save links back into JSON file
// export const saveLinks = async (links) => {
//     await writeFile(Data_File, JSON.stringify(links)); // Save as string
// };

import { dbclient,mysql_db } from "../config/db_client.js";
import { env } from "../config/env.js";

/*const db=dbclient.db(env.MONGODB_DATABASE_NAME);
 const shortenerCollection=db.collection("shorters"); */



export const loadlink=async(id)=>{
    // return await shortenerCollection.find().toArray();
   const[rows]= await mysql_db.execute('select * from links where user_id=?',[id]);
   return rows;
}

export const saveLinks = async (links) => {
    console.log(links)
    // await shortenerCollection.insertOne(links); // Save as string
    await mysql_db.execute('insert into links(short_code,url,user_id) values(?,?,?)',[links.shortcode,links.url,links.userId]);
};

export const getlinkByshortCode=async(shortcode)=>{
    // return await shortenerCollection.findOne({shortcode:shortcode});
    const [rows]=await mysql_db.execute('select * from links where short_code=?',[shortcode]);
    return rows.length>0 ? rows[0] : null;
}



