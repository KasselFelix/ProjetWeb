

const sqlite3 = require('sqlite3').verbose();

const path = require('path');
const api = require('./api.js');
const Datastore = require('nedb')
var cors = require('cors')
// Détermine le répertoire de base
const basedir = path.normalize(path.dirname(__dirname));
console.debug(`Base directory: ${basedir}`);

express = require('express');
const app = express()
api_1 = require("./api.js");
const session = require("express-session");

app.use(cors());

app.use(session({
    secret: "technoweb rocks"
}));

let db = new sqlite3.Database(':memory:');

//app.use('/api', api.default(db));

msg_db = new Datastore(/*{filename : 'messages'}*/);
msg_db.loadDatabase();
app.use('/api',api.default(db,msg_db));
// Démarre le serveur
app.on('close', () => {
});


exports.default = app;

