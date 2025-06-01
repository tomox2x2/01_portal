import { encrypt } from './crypt';
import { connectionDB, insertDBSec,deleteDB, disconnectFromMySQL, DBBeginTrans, DBCommit, DBRollback} from './connDB';
import * as mysql from 'mysql2';
import * as util from 'node:util';
import { getComSKEnv } from './sk';

const {
    positionals
} = util.parseArgs({
    allowPositionals: true
});

async function settingMail( arySetting: string[]) {

    let sqlFormatTxt = '';
    let rtnFlg = '0';
    const paramID = 'M0001'
    const paramName = 'MailTransSetting'
    const paramDescnt = 'メール送信設定 1:SMTPサーバ,2:ポート番号,3:Secure設定,4:送信元メルアド,5:送信元メルアドパス';
    const connect = connectionDB();

    try{

        if ( arySetting.length !== 5 ) return rtnFlg = '1';

        const strSMTPServer = arySetting[0]; // SMTPServer
        const strPortNo = arySetting[1]; // PortNo
        const strSecure = arySetting[2]; // SecureSetting
        const strMailAdd = arySetting[3]; // User ( MailAddress )
        const strDecPass = arySetting[4]; // Password
        
        if ( strSecure !== "true" && strSecure !== "false") return rtnFlg = '2';

        await DBBeginTrans(connect);

        // T_PARAMETER から 該当IDデータ削除
        sqlFormatTxt = " delete from T_PARAMETER T1 where T1.PARAMID = ? ";
        await deleteDB(connect, sqlFormatTxt, [paramID]);

        const strEncPass = encrypt(strDecPass, await getComSKEnv());
        
        // データ設定
        sqlFormatTxt = mysql.format(
            "insert into T_PARAMETER values (?, ?, ?, ?, ?, ?, ?, ? ) ", 
            [ paramID,paramName,strSMTPServer,strPortNo,strSecure,strMailAdd,strEncPass,paramDescnt ]);
        await insertDBSec(connect, sqlFormatTxt, []);

        await DBCommit(connect);

        return rtnFlg = '0';

    } catch(error) {
  
        if (connect) await DBRollback(connect);
        console.error('Error:', error);
        return '-1'

    } finally {

        if ( connect) disconnectFromMySQL(connect);
        return rtnFlg;
    }
}


( async () => {

    const rslt = await settingMail(positionals);

    if ( typeof rslt !== 'string' || rslt !== '0') {
        console.log('メール設定が失敗しました');
    } else {
        console.log('メール設定が成功しました');
    }
})();
