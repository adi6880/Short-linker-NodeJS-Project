import z, { email } from "zod";

const nameSchema=z
    .string()
    .trim()
    .min(3,{message:"name must be at least 3 characters long."})
    .max(100,{message:"Name must be no more than 100 words"});

export const loginUserSchema=z.object({
    email:z
    .string()
    .trim()
    .email({message:"Please enter valid email"})
    .max(100,{message:"email must be no more than 100 characters"}),

    password:z
    .string()
    .min(4,{message:"Passwod must be least 6 characters long."})
    .max(50,{message:"Password must be no more than 100 characters."}),
});


export const registerUserSchema=loginUserSchema.extend({
    name: nameSchema,
});

export const verifyEmailSchema=z.object({
    token:z.string().trim().length(8),
    email:z.string().trim().email({message:"email is invalid"}),
})

export const verifyUserSchema=z.object({
    name:nameSchema
});

export const passowrdUserSchema=z.object({
    current_password:z 
    .string()
    .min(1,{message:"Passwod must be least 6 characters long."}),

    new_password:z 
    .string()
    .min(6,{message:"Passwod must be least 6 characters long."})
    .max(100,{message:"Password must be no more than 100 characters."}),

    confirm_password:z 
    .string()
    .min(1,{message:"Passwod must be least 6 characters long."})
    .max(100,{message:"Password must be no more than 100 characters."}),
}).refine((data)=>data.new_password===data.confirm_password,{
    message:"Password don't match",
    path:["confirm_password"]
});