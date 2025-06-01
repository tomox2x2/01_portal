import * as express from "express";
import chkLogin from "./chkLogin";
import newAc from "./newAC";
import logout from "./logout";
import Words from "./Words";
import diary from './diary';
import todo from './todo';
import format from './format';
import userChg from './userChg';
import tokenVenification from './tokenVerification';
import com from './common';

const router = express.Router();

router.use("/chkLogin",chkLogin);
router.use("/NewAC",newAc);
router.use("/logout", logout);
router.use("/Words", Words);
router.use("/diary", diary);
router.use("/todo", todo);
router.use("/format", format);
router.use("/tokenVerification", tokenVenification);
router.use("/userChg", userChg);
router.use("/common", com);

export default router;