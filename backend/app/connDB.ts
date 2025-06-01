import * as mysql from 'mysql2';
import * as dotenv from 'dotenv';

dotenv.config();

// MySQL接続
export function connectionDB(): mysql.Connection {

  try {

    const pHost = process.env.DB_HOST;
    const pPort = Number(process.env.DB_PORT);
    const pUser = process.env.DB_USER;
    const pPass = process.env.DB_PASS;
    const pDBName = process.env.DB_NAME;

  if ( typeof pHost === "string" &&
         typeof pPort === "number" &&
         typeof pUser === "string" &&
         typeof pPass === "string" &&
         typeof pDBName === "string" 
         
    ) {

      const connection = mysql.createConnection({
        host: pHost,
        port: pPort,
        user: pUser,
        password: pPass,
        database: pDBName
      });
      console.log("Connected DB");
      return connection;
    } else {
      throw new Error();
    }
  } catch( error : any ) {
    console.error('Error connecting to MySQL: ' + error.stack);
    throw error;
  }
};

export function selectDB( con: mysql.Connection, sqlTxt: string) : Promise<mysql.RowDataPacket[] > {

  console.log(sqlTxt);

  return new Promise((resolve, reject) => {
    con.query(sqlTxt, (error, results: mysql.RowDataPacket[], fields) => {
      if ( error ) {
        console.error('Error fetching data from MySQL:', error);
        reject(error);
      } else {
        console.log('Fetched data from MySQL:', results);
        resolve(results);
      }
    })
  })
};


export function selectDBSec( con: mysql.Connection, sqlTxt: string) : Promise<mysql.RowDataPacket[] > {

  return new Promise((resolve, reject) => {
    con.query(sqlTxt, (error, results: mysql.RowDataPacket[], fields) => {
      if ( error ) {
        console.error('Error fetching data from MySQL:', error);
        reject(error);
      } else {
        resolve(results);
      }
    })
  })
};

export function insertDB( con: mysql.Connection, sqlTxt: string, values: any[]) : Promise<void> {

  console.log(sqlTxt);
  console.log(values);
  
  return new Promise<void>((resolve, reject) => {
    con.query(sqlTxt, values, (error, results, fields) => {
      if ( error ) {
        console.error('Error insert data to MySQL:', error);
        reject(error);
      } else {
        console.log('inserted data to MySQL');
        resolve();
      }
    })
  })
};

export function insertDBSec( con: mysql.Connection, sqlTxt: string, values: any[]) : Promise<void> {

  return new Promise<void>((resolve, reject) => {
    con.query(sqlTxt, values, (error, results, fields) => {
      if ( error ) {
        console.error('Error insert data to MySQL:', error);
        reject(error);
      } else {
        console.log('inserted data to MySQL');
        resolve();
      }
    })
  })
};


export function updateDB( con: mysql.Connection, sqlTxt: string, values: any[]) : Promise<void> {

  console.log(sqlTxt);
  console.log(values);

  return new Promise<void>((resolve, reject) => {
    con.query(sqlTxt, values, (error, results, fields) => {
      if ( error ) {
        console.error('Error update data to MySQL:', error);
        reject(error);
      } else {
        console.log('updateed data to MySQL');
        resolve();
      }
    })
  })
};

export function updateDBSec( con: mysql.Connection, sqlTxt: string, values: any[]) : Promise<void> {

  return new Promise<void>((resolve, reject) => {
    con.query(sqlTxt, values, (error, results, fields) => {
      if ( error ) {
        console.error('Error update data to MySQL:', error);
        reject(error);
      } else {
        console.log('updateed data to MySQL');
        resolve();
      }
    })
  })
};


export function deleteDB( con: mysql.Connection, sqlTxt: string, values: any[]) : Promise<void> {

  console.log(sqlTxt);
  console.log(values);

  return new Promise<void>((resolve, reject) => {
    con.query(sqlTxt, values, (error, results, fields) => {
      if ( error ) {
        console.error('Error delete data to MySQL:', error);
        reject(error);
      } else {
        console.log('delete data to MySQL');
        resolve();
      }
    })
  })
};

export function createTempTable( con: mysql.Connection, createTableName: string, originalTable: string) : Promise<void> {

  let sqlTxt: string = ` create temporary table ${createTableName} as select * from ${originalTable}`

  return new Promise<void>((resolve, reject) => {
    con.query(sqlTxt, null, (error, results, fields) => {
      if ( error ) {
        console.error('Error create table to MySQL:', error);
        reject(error);
      } else {
        console.log(`create temp table: ${createTableName} to MySQL`);
        resolve();
      }
    })
  })
};


export function disconnectFromMySQL(con: mysql.Connection) {
  try {
    // 接続を切断
    con.end();
    console.log('Disconnected from MySQL database');
  } catch (error) {
    console.error('Error disconnecting from MySQL:', error);
    throw error; 
  }
};

export function DBBeginTrans( con:mysql.Connection) {
  try {
    con.beginTransaction(err => {
      if (err) {
        throw err;
      }
    });
    console.log('Start Transaction');
  } catch(error) {
    console.log('Transaction Started Error');
    throw(error);
  }
};

export function DBCommit( con:mysql.Connection) {
  try {
    con.commit(err => {
      if (err) {
        throw err;
      }
    });
    console.log('Commited');
  } catch(error) {
    console.log('Commited Error');
    DBRollback(con);
    throw(error);
  }
};

export function DBRollback( con:mysql.Connection) {
  try {
    con.rollback(err => {
      if (err) {
        throw err;
      }
    });
    console.log('Rollbacked');
  } catch(error) {
    console.log('Rollbacked Error');
    throw(error);
  }
};
