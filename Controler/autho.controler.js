import { saveData,findData,hashPassword,
    hashCompare,createSenssion,findShortLinkByid,
    createAccessToken,createRefreshToken,
    updateShortLinkByid,
    clearSenssion,
    findbyuserId,
    generateRandomToken,
    insertVerifyEmailToken,
    createVerifyEmailLink,
    findVerificationEmailToken,
    verifyUserEmailUpdate,
    clearVerifyEmailToken,
    updateUserbyName,
    findbyPassword,
    updatePassword,
   } from "../Modul/autho.modul.js";
import { loginUserSchema, passowrdUserSchema, registerUserSchema, verifyEmailSchema, verifyUserSchema } from "../validator/autho-validate.js";
import z from "zod";
// import { sendEmail } from "../lib/nodemailer.js";
import { sendEmail } from "../lib/send-email.js";
import  fs  from "fs/promises";
import path from "path";
import ejs from "ejs"
import mjml2html from "mjml";


export const getRegisterPage=(req,res)=>{
    return res.render("../views/autho/register.ejs");
}

export const Registerpage=async (req,res)=>{

   const {data,error}=registerUserSchema.safeParse(req.body)
   if(error){
    console.log("ERROR!",error)
    res.redirect("/register");
   }
   const {name,email,password}=data;
    const dataEmail=await findData(email);
    if(dataEmail){
    return res.redirect("/");
    }
    // use hash password
    const cyptePassword=await hashPassword(password);
    console.log("password",cyptePassword)
    await saveData({name,email,cyptePassword});
    return res.redirect("/")
}

// Login get method
export const getLoginPage=(req,res)=>{
    
    return res.render("../views/autho/login.ejs");

}

// Edit Profile get method

export const getEditProfile=async(req,res)=>{
    if(!req.user) return res.redirect("/login");

    const user=await findbyuserId(req.user.id)

    if(!user) return res.status(404).send("User not found")

    return res.render("autho/profile-edit",{
        name:user.name
    })
}

// Edit Profile post method
export const postEditProfile=async(req,res)=>{
    if(!req.user) return res.redirect("/login");

    const {data,error}=verifyUserSchema.safeParse(req.body)

    if(error) return res.redirect("/edit-profile")

    await updateUserbyName(req.user.id,data.name)

    return res.redirect("/profile");

}

// Profile page
export const getProfilepage=async (req,res)=>{
    if(!req.user) res.send("Not login In");
    
    const user=await findbyuserId(req.user.id)
   
    if(!user) return res.redirect("/login");

    const UserbyLinks=await findShortLinkByid(user.id)
    // console.log(user)
   return res.render("../views/autho/profile",{
    user:{
        id:user.id,
        name:user.name,
        email:user.email,
        valid:user.is_email_valid,
        createdAt:user.createAt,
        links:UserbyLinks
    }
   });
}


// Email Verify method

export const getEmailVerify=(req,res)=>{
    if(!req.user || req.user.valid) return res.redirect("/");

    res.render("autho/email_verify",{
        email:req.user.email
    });
}

// Resend Verification

export const resendVerfication=async(req,res)=>{
     if(!req.user || req.user.valid) return res.redirect("/");

     const randomToken=generateRandomToken();

     await insertVerifyEmailToken({userId:req.user.id,token:randomToken});

     const verifyEmailLink=await createVerifyEmailLink({
        email:req.user.email,
        token:randomToken
     });

     // to get file
     const mjmlTemplate=await fs.readFile(
        path.join(import.meta.dirname,"..","email","verify_email.mjml"),"utf-8"
    );
    
    //to replace the placeholder with actual values
    const filedtemplate=ejs.render(mjmlTemplate,{
        code:randomToken,
        link:verifyEmailLink
    })

    // convert mjml to html
    const htmlOutput=mjml2html(filedtemplate).html


     sendEmail({
        to:req.user.email,
        subject:"Verify your email",
        html:htmlOutput,

     }).catch((error)=>console.log("Error! ",error.message))

     res.redirect("/verify-email");
};

// Verify Email Token

export const verifyEmailToken=async(req,res)=>{
    const {data,error}=verifyEmailSchema.safeParse(req.query)

    if(error)  return res.send("Verification link invalid or expired!")

    // find token and expired date check or user Id
    const token=await findVerificationEmailToken(data)

    if(!token) return res.send("Verification link invalid or expired!")

    await verifyUserEmailUpdate(token.email)

    clearVerifyEmailToken(token.userId).catch(error)

    return res.redirect("/profile");
}

// Login Post method
export const Loginpage=async (req,res)=>{

    const {data,error}=loginUserSchema.safeParse(req.body);

    if(error){
        console.log("ERROR!: ",error);
        res.redirect("/login");
    }

    const {email,password}=data;
    const user=await findData(email);
    console.log("User:",user)
    if(!user) return res.redirect("/register");

    const validPassword=await hashCompare(password,user.password)
    console.log(validPassword)

    if(!validPassword) return res.redirect("/login");
    // console.log(req.headers)

    //we need create senssion
    let senssion=await createSenssion(user.id,{
        ip:req.clientIp,
        user_agent:req.headers["user-agent"]
    })
     senssion=senssion[0]
     const senssionId=senssion["last_insert_id()"]
    console.log("senssion:",senssionId)

    const accessToken=createAccessToken({
        id:user.id,
        name:user.name,
        email:user.email,
        senssionId
    })

    const refreshToken=createRefreshToken(senssionId);

    const baseConfig={httpOnly:true,secure:true}

    res.cookie("access_token",accessToken,{
        ...baseConfig,
        maxAge:900000,
    });

     
    res.cookie("refresh_token",refreshToken,{
        ...baseConfig,
        maxAge:604800000,
    });
    res.redirect("/");


}

export const getMe=(req,res)=>{
    if(!req.user) return res.send("Not logged in");

    return res.send(`<h1>Hey ${req.user.name}-${req.user.email} </h1>`)
}

export const getLogout=async (req,res)=>{
        console.log("logout",req.user)
        await clearSenssion(req.user.senssionId)
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        return res.redirect("/");
    
};

export const getUpdateUrl=async(req,res)=>{
    if(!req.user) return("/login");
    const {data:id,error}=z.coerce.number().int().safeParse(req.params.id);

    try {
        const shortLink=await findShortLinkByid(id);
        if(!shortLink) return res.redirect("/404");

        return res.render("edit-shortlink",{
            id:shortLink.id,
            short_code: shortLink.short_code,
            url:shortLink.url
        });

    } catch (error) {
        console.log("ERR! ",error)
        console.log("Id is:",id);
    }
}

export const getChangePassword=async(req,res)=>{
    if(!req.user) return res.redirect("/login");

    return res.render("autho/change-pass");
}

export const postChangePassword=async(req,res)=>{
     if(!req.user) return res.redirect("/");

     const {data,error}=passowrdUserSchema.safeParse(req.body);

     if(error) return res.send(`password error ${error}`)

    console.log("data",data)
    const {id,password}=await findbyPassword(req.user.id);
   const validPassword=await hashCompare(data.current_password,password);

   if(!validPassword){
    return res.render("autho/change-pass");
   }

  const argonPassword=await hashPassword(data.new_password);

   await updatePassword(argonPassword,id)

    return res.redirect("/profile");

}

export const getForgotPassword=(req,res)=>{
    if(!req.user) return res.render("autho/forgot");

    // return res.render("autho/forgot");
}

export const getUpdated=async (req,res)=>{
    const {url,shortcode}=req.body;
   const {data:id ,error}=z.coerce.number().int().safeParse(req.params.id);
   console.log(id)

    try {
        const upadteLink=await updateShortLinkByid(url,shortcode,id);
        // if(!upadteLink){return res.send("Not found")}
        return res.redirect("/");
    } catch (error) {
        console.log(error);
    }
}