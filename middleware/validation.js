const {body}=require("express-validator");




const validateNewUser = ()=>{
    return [
        body("email")
            .trim()
            .isEmail().withMessage("Please enter valid email"),
        body("password").trim()
            .isLength({min:6}).withMessage("Password must be at least 6 characters")
            .isLength({max:20}).withMessage("Password must be at most 20 characters"),
        body("name").trim()
            .isLength({min:6}).withMessage("Name must be at least 2 characters"),
        body("surname").trim()
            .isLength({min:6}).withMessage("Surname must be at least 2 characters"),
        body("repassword").custom((value,{req})=> {
            if(value!== req.body.password){
                throw new Error("PASSWORDS ARE NOT THE SAME");
            }
            return true;
        })
            
        
    ]
}

module.exports={
    validateNewUser
}