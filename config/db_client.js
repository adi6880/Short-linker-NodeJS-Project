import mysql from "mysql2/promise";
import {env} from "./env.js"
import { MongoClient } from "mongodb";

export const dbclient=new MongoClient(env.MONGODB_URI)

export const mysql_db=await mysql.createConnection({
    host:env.DATABASE_HOST,
    user:env.DATABASE_USER,
    password:env.DATABASE_PASSWORD,
    database:env.DATABASE_NAME
});

export const register_db=await mysql.createConnection({
    host:env.DATABASE_HOST,
    user:env.DATABASE_USER,
    password:env.DATABASE_PASSWORD,
    database:env.DATABASE_SQL
});


// console.log(await mysql_db.execute('show tables'))