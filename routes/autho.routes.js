import { Router } from "express";
import  * as authoControler from "../Controler/autho.controler.js"
const router=Router();

router.route("/register")
.get(authoControler.getRegisterPage)
.post(authoControler.Registerpage)

router.route("/login")
.get(authoControler.getLoginPage)
.post(authoControler.Loginpage)

router.route("/me")
.get(authoControler.getMe);

router.route("/profile")
.get(authoControler.getProfilepage);

router.route("/edit-profile")
.get(authoControler.getEditProfile)
.post(authoControler.postEditProfile);

router.route("/change-password")
.get(authoControler.getChangePassword)
.post(authoControler.postChangePassword);

router.route("/forgot-password")
.get(authoControler.getForgotPassword)

router.route("/email-verify")
.get(authoControler.getEmailVerify);

router.route("/resend-verification")
.post(authoControler.resendVerfication)

router.route("/verify-email-token")
.get(authoControler.verifyEmailToken)

router.route("/logout")
.get(authoControler.getLogout);

router.route("/edit/:id")
.get(authoControler.getUpdateUrl)
.post(authoControler.getUpdated);

export const authoRouter=router;

