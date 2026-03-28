import crypto from "crypto";
import { loadlink,saveLinks,getlinkByshortCode } from "../Modul/shorten.modul.js";
import { readFile } from "fs/promises";
import path from "path";

export const getShortenpage=async (req,res)=>{
    try {
        if(!req.user) return res.redirect("/login");
       
    //     const file=await readFile(path.join("view","index.ejs"))
        const links = await loadlink(req.user.id);
       

    //     const content=file.toString().replaceAll("{{shortened_urls}}",(links)
    //     .map(({short_code,url})=>
    //         `<li><a href=${short_code} target="_blank">${req.host}/${short_code}</a><br>${url.slice(0,30)}</li>`
    //     ).join("")
    // );
    // let isLogged=req.headers.cookie;
    // isLogged=Boolean(isLogged?.split("=")[1])
    // console.log("Cookie: ",isLogged)
    // let isLogged=req.cookies.isloggedIn;
    // console.log(isLogged)
    // return res.send(content)

    return res.render("index",{links,hosts:req.host})
    
} 
    catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error!")
        }
    }



export const postshorten=async(req, res)=>{
    try {
         const { url, shortcode } = req.body;
        const finalshortcode = shortcode || crypto.randomBytes(4).toString("hex");
        
        const links=await loadlink(req.user.id);
            // Prevent duplicate shortcode
          
            if(links[finalshortcode]){
                return res
                .status(400)
                .send("Short code already exists. Please choose another");
            }
              // Save new shortcode with URL
            await saveLinks({url,shortcode:finalshortcode,userId:req.user.id})
            res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal error");
    }
    

}

export const redirectshoteren=async (req,res)=>{
        
        try {
              const {shortCode} = req.params;
              console.log("link",shortCode)
            // const links=await loadlink();
                const links=await getlinkByshortCode(shortCode);
            
            if (!links) return res.status(404).send("404 error occured");
            return res.redirect(links.url);
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal server error!");
        }
    }



