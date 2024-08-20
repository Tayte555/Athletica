/**
 * Database Initialisation
 */
require('dotenv').config()
var express = require("express");
var MongoClient = require("mongodb").MongoClient;
var cors = require("cors");
const multer = require("multer");

var app = express();
app.use(cors());

const uri = process.env.MONGODB_URI;
const db_name = process.env.DATABASENAME;
var database;

app.listen(5038, ()=> {
    MongoClient.connect(uri,(error,client)=>{
        database = client.db(db_name);
        console.log("Athletica Database Connection Successful");
    })
})