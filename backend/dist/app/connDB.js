"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBRollback = exports.DBCommit = exports.DBBeginTrans = exports.disconnectFromMySQL = exports.createTempTable = exports.deleteDB = exports.updateDBSec = exports.updateDB = exports.insertDBSec = exports.insertDB = exports.selectDBSec = exports.selectDB = exports.connectionDB = void 0;
const mysql = __importStar(require("mysql2"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// MySQL接続
function connectionDB() {
    try {
        const pHost = process.env.DB_HOST;
        const pPort = Number(process.env.DB_PORT);
        const pUser = process.env.DB_USER;
        const pPass = process.env.DB_PASS;
        const pDBName = process.env.DB_NAME;
        if (typeof pHost === "string" &&
            typeof pPort === "number" &&
            typeof pUser === "string" &&
            typeof pPass === "string" &&
            typeof pDBName === "string") {
            const connection = mysql.createConnection({
                host: pHost,
                port: pPort,
                user: pUser,
                password: pPass,
                database: pDBName
            });
            console.log("Connected DB");
            return connection;
        }
        else {
            throw new Error();
        }
    }
    catch (error) {
        console.error('Error connecting to MySQL: ' + error.stack);
        throw error;
    }
}
exports.connectionDB = connectionDB;
;
function selectDB(con, sqlTxt) {
    console.log(sqlTxt);
    return new Promise((resolve, reject) => {
        con.query(sqlTxt, (error, results, fields) => {
            if (error) {
                console.error('Error fetching data from MySQL:', error);
                reject(error);
            }
            else {
                console.log('Fetched data from MySQL:', results);
                resolve(results);
            }
        });
    });
}
exports.selectDB = selectDB;
;
function selectDBSec(con, sqlTxt) {
    return new Promise((resolve, reject) => {
        con.query(sqlTxt, (error, results, fields) => {
            if (error) {
                console.error('Error fetching data from MySQL:', error);
                reject(error);
            }
            else {
                resolve(results);
            }
        });
    });
}
exports.selectDBSec = selectDBSec;
;
function insertDB(con, sqlTxt, values) {
    console.log(sqlTxt);
    console.log(values);
    return new Promise((resolve, reject) => {
        con.query(sqlTxt, values, (error, results, fields) => {
            if (error) {
                console.error('Error insert data to MySQL:', error);
                reject(error);
            }
            else {
                console.log('inserted data to MySQL');
                resolve();
            }
        });
    });
}
exports.insertDB = insertDB;
;
function insertDBSec(con, sqlTxt, values) {
    return new Promise((resolve, reject) => {
        con.query(sqlTxt, values, (error, results, fields) => {
            if (error) {
                console.error('Error insert data to MySQL:', error);
                reject(error);
            }
            else {
                console.log('inserted data to MySQL');
                resolve();
            }
        });
    });
}
exports.insertDBSec = insertDBSec;
;
function updateDB(con, sqlTxt, values) {
    console.log(sqlTxt);
    console.log(values);
    return new Promise((resolve, reject) => {
        con.query(sqlTxt, values, (error, results, fields) => {
            if (error) {
                console.error('Error update data to MySQL:', error);
                reject(error);
            }
            else {
                console.log('updateed data to MySQL');
                resolve();
            }
        });
    });
}
exports.updateDB = updateDB;
;
function updateDBSec(con, sqlTxt, values) {
    return new Promise((resolve, reject) => {
        con.query(sqlTxt, values, (error, results, fields) => {
            if (error) {
                console.error('Error update data to MySQL:', error);
                reject(error);
            }
            else {
                console.log('updateed data to MySQL');
                resolve();
            }
        });
    });
}
exports.updateDBSec = updateDBSec;
;
function deleteDB(con, sqlTxt, values) {
    console.log(sqlTxt);
    console.log(values);
    return new Promise((resolve, reject) => {
        con.query(sqlTxt, values, (error, results, fields) => {
            if (error) {
                console.error('Error delete data to MySQL:', error);
                reject(error);
            }
            else {
                console.log('delete data to MySQL');
                resolve();
            }
        });
    });
}
exports.deleteDB = deleteDB;
;
function createTempTable(con, createTableName, originalTable) {
    let sqlTxt = ` create temporary table ${createTableName} as select * from ${originalTable}`;
    return new Promise((resolve, reject) => {
        con.query(sqlTxt, null, (error, results, fields) => {
            if (error) {
                console.error('Error create table to MySQL:', error);
                reject(error);
            }
            else {
                console.log(`create temp table: ${createTableName} to MySQL`);
                resolve();
            }
        });
    });
}
exports.createTempTable = createTempTable;
;
function disconnectFromMySQL(con) {
    try {
        // 接続を切断
        con.end();
        console.log('Disconnected from MySQL database');
    }
    catch (error) {
        console.error('Error disconnecting from MySQL:', error);
        throw error;
    }
}
exports.disconnectFromMySQL = disconnectFromMySQL;
;
function DBBeginTrans(con) {
    try {
        con.beginTransaction(err => {
            if (err) {
                throw err;
            }
        });
        console.log('Start Transaction');
    }
    catch (error) {
        console.log('Transaction Started Error');
        throw (error);
    }
}
exports.DBBeginTrans = DBBeginTrans;
;
function DBCommit(con) {
    try {
        con.commit(err => {
            if (err) {
                throw err;
            }
        });
        console.log('Commited');
    }
    catch (error) {
        console.log('Commited Error');
        DBRollback(con);
        throw (error);
    }
}
exports.DBCommit = DBCommit;
;
function DBRollback(con) {
    try {
        con.rollback(err => {
            if (err) {
                throw err;
            }
        });
        console.log('Rollbacked');
    }
    catch (error) {
        console.log('Rollbacked Error');
        throw (error);
    }
}
exports.DBRollback = DBRollback;
;
