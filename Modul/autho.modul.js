import  argon2 from "argon2";
import { register_db,mysql_db } from "../config/db_client.js";
import 'dotenv/config';
import jwt from "jsonwebtoken";
import crypto from "crypto"

export const saveData=async(data)=>{
    const {name,email,cyptePassword}=data;
  await register_db.execute('insert into register_user(name,email,password) values(?,?,?)',[name,email,cyptePassword]);
  // console.log(await register_db.execute('select * from register_user'));
  return;
}

export const findData=async (email)=>{
    const [rows]= await register_db.execute('select * from register_user where email=?',[email])
    return rows[0];
}
export const findShortLinkByid=async(id)=>{
  const [rows]=await mysql_db.execute('select * from links where user_id=?',[id]);
  return rows;
}

export const updateShortLinkByid=async(url,shortcode,id)=>{
    // console.log(await mysql_db.execute("select * from links"))
   return await mysql_db.execute('update links set short_code=?, url=? where id=?',[shortcode,url,id]);
    
  }



export const hashPassword=async (password)=>{
  return await argon2.hash(password);
}

export const hashCompare=async (password,hash)=>{
  try {
     return await argon2.verify(hash,password)
  } catch (error) {
    console.log("hashCompare",error)
  }
 
}

// export const generateToken=({id,name,email})=>{
//   return jwt.sign({id,name,email},process.env.JWT_SECERT,{
//     expiresIn:"30d",
//   });
// }


export const createSenssion=async (userId,{ip,user_agent})=>{
   await register_db.execute('insert into sension(user_id,user_agent,ip)values(?,?,?)',[userId,user_agent,ip]);
   const rows=await register_db.execute('select last_insert_id()');
    return rows[0];
};

export const findbySenssionid=async (senssionId)=>{
  const [rows]=await register_db.execute("select * from sension where id=?",[senssionId])
  return rows[0];
}

export const findbyuserId=async (userId)=>{
  const [rows]=await register_db.execute("select * from register_user where id=?",[userId]);
  return rows[0];
}

export const findbyPassword=async(userId)=>{
 const [rows]=await register_db.execute("select id,password from register_user where id=?",[userId]);
 return rows[0]
}

export const clearSenssion=async(senssionId)=>{
  await register_db.execute("delete from sension where id=?",[senssionId]);
}

export const createAccessToken=({id,name,email,senssionId})=>{
  return jwt.sign({id,name,email,senssionId},
    process.env.JWT_SECERT,{
      expiresIn:"15m",
    });
};

export const createRefreshToken=(senssionId)=>{
  return jwt.sign({senssionId},process.env.JWT_SECERT,
    {
      expiresIn:"1w",
    });
};

export const verifyToken=(token)=>{
  return jwt.verify(token,process.env.JWT_SECERT);
}

export const refreshTokens=async (refreshToken)=>{
  try {
    const decodedToken=verifyToken(refreshToken)
    // console.log("refresh Token: ",decodedToken)
    const currentSenssion=await findbySenssionid(decodedToken.senssionId)
    
    if(!currentSenssion || !currentSenssion.valid){
      throw new Error("Invalid senssion");
    }

    const userId=await findbyuserId(currentSenssion.user_id)
    console.log(userId)
    if(!userId) throw new Error("Invalid user id");

    const userinfo={
      id:userId.id,
      name:userId.name,
      email:userId.email,
      senssionId:currentSenssion.senssionId
    }

    const newAccessToken=createAccessToken(userId);
    const newRefreshToken=createRefreshToken(userId.senssionId)

    return {
      newAccessToken,
      newRefreshToken,
      user:userinfo
    }
  } catch (error) {
    console.log(error.message)
  }
}

export const generateRandomToken=(digit=8)=>{
  const min=10 ** (digit-1) // 10000000
  const max=10 ** digit  // 100000000

  return crypto.randomInt(min,max).toString();
}

export const insertVerifyEmailToken=async ({userId,token})=>{

  await register_db.beginTransaction(); // Transaction in DBMS (ACID)

  try {

    await register_db.execute("delete from email_verify where expired_at < current_timestamp")
    await register_db.execute("insert into email_verify(user_id,token)values(?,?)",[userId,token]);
    await register_db.commit();

  } catch (error) {

    await register_db.rollback();
    console.log("insertVerifyEmailToken() is error: ",error);
  }
  return;
}

export const findVerificationEmailToken=async({token,email})=>{

  // Use Inner Join in Mysql
    const [tokenData]=await register_db.execute(
    'select user_id,email,token,expired_at from email_verify inner join register_user on email_verify.user_id=register_user.id where token=? and expired_at>current_timestamp()',[token])
    
    if(!tokenData.length) return null;

    console.log(tokenData)
   return {
    userId:tokenData[0].user_id,
    email:tokenData[0].email,
    token:tokenData[0].token,
    expired:tokenData[0].expired_at
   }
  };
   
export const verifyUserEmailUpdate=async(email)=>{
  return await register_db.execute('update register_user set is_email_valid=true where email=?',[email])
}

export const clearVerifyEmailToken=async(userId)=>{
    await register_db.execute('delete from email_verify where user_id=?',[userId]);
}

export const updateUserbyName=async(user_id,name)=>{
  try {
    await register_db.execute("update register_user set name=? where id=?",[name,user_id]);
  } catch (error) {
    console.log(error.message)
  }
}

export const createVerifyEmailLink=async ({email,token})=>{
    // const uriEncodedEmail=encodeURIComponent(email);
    // return `${process.env.FRONTENT_URL}/verify-email-token?token=${token}&email=${uriEncodedEmail}`

    const url=new URL(`${process.env.FRONTENT_URL}/verify-email-token`);
    url.searchParams.append("token",token);
    url.searchParams.append("email",email);
    return url.toString();
}

export const updatePassword=async(password,id)=>{
  try {
     await register_db.execute("update register_user set password=?,updateAt=current_timestamp  where id=?",[password,id])
  } catch (error) {
    console.log(error)
  }
 
}