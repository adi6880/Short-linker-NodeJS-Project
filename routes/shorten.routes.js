import {Router} from "express";

// import {path} from "path";

import { postshorten,getShortenpage,redirectshoteren} from "../Controler/shortpost.Controler.js";



const router=Router();
// File where shortened links will be saved
// router is use get 
router.get("/",getShortenpage);


// router is use post to form
router.post("/", postshorten);

// handle the short code link and redirect the link 
router.get("/:shortCode",redirectshoteren);

// Default export:
// export default router;

// Name export:


export const shoternedRouter=router;
