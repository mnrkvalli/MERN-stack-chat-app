import jwt from "jsonwebtoken"

export const generateToken = (userId, response) =>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    response.cookie('jwt', token, {
        maxAge: 7*24*60*60*1000, 
        httpOnly: true, //prevents XSS attacks cross-site scriptig attacks
        sameSite: 'strict', //CSRF attacks cross-site request forgery attacksf
        secure: process.env.NODE_ENV !== "development"
    });

    return token;
}