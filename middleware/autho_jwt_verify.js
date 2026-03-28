import { de } from "zod/v4/locales";
import { refreshTokens, verifyToken } from "../Modul/autho.modul.js";
// export const middleVerifyJwt=(req,res,next)=>{
//     const token=req.cookies.access_token;

//     if(!token){
//         req.user=null;
//         return next();
//     }
//     try {
//        const decodedToken=verifyToken(token);
//        req.user=decodedToken;
//        console.log("req User:- ",req.user);
//     } catch (error) {
//         req.user=null;
//     }
//     return next();
// }

export const middleVerifyJwt = async (req, res, next) => {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accessToken && !refreshToken) {
        req.user = null;
        return next();
    }

    if (accessToken) {
        const decodedToken = verifyToken(accessToken);
        req.user = decodedToken;
        return next();
    }

    if (refreshToken) {
        try {
            const { newAccessToken, newRefreshToken, user } = await refreshTokens(refreshToken)
            req.user = user;

            const baseConfig = { httpOnly: true, secure: true }

            res.cookie("access_token", newAccessToken, {
                ...baseConfig,
                maxAge: 900000,
            });


            res.cookie("refresh_token", newRefreshToken, {
                ...baseConfig,
                maxAge: 604800000,
            });

            return next();
        } catch (error) {
            console.log("Error!:", error.message)
        }
    }

    return next();

};