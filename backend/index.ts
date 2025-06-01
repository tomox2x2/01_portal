import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./src/router";

const app: Express = express();
const port = process.env.PORT;
const frontPass = process.env.FRONTPASS;

const corsOption: cors.CorsOptions = {
  //フロントエンド側のポート番号を設定する
  origin: frontPass,
  //認証情報の通信をするために true に設定。
  credentials: true,
}

//app.use(bodyParser.json());

app.use(cors(corsOption));

// URLの中でエンコードされた文字を読み取れるようにする
app.use(express.urlencoded({ extended: true}));
// リクエストされたJSONオブジェクトを読み取れるようにする。
app.use(express.json());
// リクエストされた cookie を読み取れるようにする。
app.use(cookieParser());

app.use("/", router);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

