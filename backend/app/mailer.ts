import { decrypt } from './crypt';
import nodemailer from 'nodemailer';
import { selectDBSec } from './connDB';
import mysql from 'mysql2';
import { getComSKEnv } from './sk';

interface intMailOpton {
  from: string,
  to: string,
  subject: string,
  text: string  
}

let strSubject :  string;
let strMainText :  string;
let transporter: nodemailer.Transporter;
let mailOption : intMailOpton ;

async function setMailText (connect : mysql.Connection, mailID: string, setValue: string[]) {

  let sqlFormatTxt: string = '';

  const format = (str: string, ...args: unknown[]): string => {
    for (const [i, arg] of args.entries()) {
      const regExp = new RegExp(`\\{${i}\\}`, 'g')
      str = str.replace(regExp, arg as string)
    }
    return str
  }

  sqlFormatTxt = mysql.format(
      "select * from T_MAILVAR T1 " + 
      "where T1.MAILID = ?  "
      , [mailID ]);
  let data1 = await selectDBSec(connect, sqlFormatTxt);
  let aryValue : string[] = [];

  if (data1.length != setValue.length) throw new Error('システムエラー：設定値の数が不正です。')

  for ( let i = 0 ; i < data1.length ; i++) {
    aryValue.push(setValue[i]);
  };
  
  sqlFormatTxt = mysql.format(
    "select * from T_MAILMST T1 " + 
    "where T1.MAILID = ?  "
    , [mailID ]);
  data1 = await selectDBSec(connect, sqlFormatTxt);
  strSubject = data1[0].SUBJECT;
  let strText = data1[0].TEXT;

  strMainText = format(strText, aryValue)

  return ;
}


export async function sendMail (connect: mysql.Connection | undefined, userName:string, mailID: string, settingWord:string[]) {

    const getSetting = async ( pUserName : string )  => {
        
      const paramID = 'M0001';

      if (!connect) throw new Error('システムエラー：connection が設定されていません');

      let sqlFormatTxt: string = '';

        // transport 設定
        sqlFormatTxt = mysql.format(
          "select * from T_PARAMETER T1 " + 
          "where T1.PARAMID = ?  "
          , [paramID ]);
        let data1 = await selectDBSec(connect, sqlFormatTxt);

        const pHost = data1[0].PARAM1.toString();
        const pPort = Number(data1[0].PARAM2.toString());
        const pSecure = Boolean(data1[0].PARAM3.toString());
        const pUser = data1[0].PARAM4.toString();
        const pPass = decrypt(data1[0].PARAM5.toString(),await getComSKEnv());

        sqlFormatTxt = mysql.format(
          "select T1.MAILADD from T_USERS T1 " + 
          "where T1.USERNAME = ?  "
          , [pUserName ]);
        data1 = await selectDBSec(connect, sqlFormatTxt);

        const pToAdd = data1[0].MAILADD;

        transporter = nodemailer.createTransport({
          host: pHost,      // DB.T_PARAMETER から取得
          port: pPort,      // DB.T_PARAMETER から取得
          secure: pSecure,  // DB.T_PARAMETER から取得
          auth: {
              user:pUser,   // DB.T_PARAMETER から取得
              pass:pPass    // DB.T_PARAMETER から取得( enc したものを dec して設定)
          },
          tls: {
            rejectUnauthorized: false, // 証明書検証を無効化
          },
        });
  
        // メール文面取得・編集
        await setMailText(connect, mailID, settingWord);
        strMainText = strMainText.replace(/\{userName\}/g, userName);
        strMainText = strMainText.replace(/\{mailAdd\}/g, pUser);

        mailOption  = {
          from: pUser,   // DB.T_PARAMETER から取得
          to: pToAdd,    // DB.T_USERS から取得
          subject: strSubject,       // DB.T_MAILMST / T_MAILVAR から取得
          text: strMainText          // DB.T_MAILMST / T_MAILVAR から取得
        }

    }  

    try {

        await getSetting(userName);
        const info = await transporter.sendMail(mailOption);
        console.log('メール送信成功：%s', info.messageId)

    } catch(error) {
        console.error('メール送信エラー', error);
        throw error
    }
}