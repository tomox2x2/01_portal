"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const router_1 = __importDefault(require("./router"));
const app = (0, express_1.default)();
const port = 3001;
const corsOption = {
    //フロントエンド側のポート番号を設定する
    origin: "http://localhost:3000",
    //認証情報の通信をするために true に設定。
    credentials: true,
};
//app.use(bodyParser.json());
app.use((0, cors_1.default)(corsOption));
// URLの中でエンコードされた文字を読み取れるようにする
app.use(express_1.default.urlencoded({ extended: true }));
// リクエストされたJSONオブジェクトを読み取れるようにする。
app.use(express_1.default.json());
// リクエストされた cookie を読み取れるようにする。
app.use((0, cookie_parser_1.default)());
app.use("/", router_1.default);
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
