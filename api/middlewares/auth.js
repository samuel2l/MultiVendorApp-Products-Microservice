const { ValidateSignature } = require('../../utils');

auth = async (req,res,next) => {
    console.log("INSIDE THE AUTH MIDDLEWARE")
    console.log(req.user)
    const isAuthorized = await ValidateSignature(req);
    if(isAuthorized){
        return next();
    }
    return res.status(403).json({message: 'Not Authorized'})
}
isSeller=async (req,res,next) => {
    
    const isAuthorized = await ValidateSignature(req);
    
    if(isAuthorized){
console.log('INSIDE IS SELLER MIDDLEWARE')        
        console.log(req.user)
        if (req.user.role=='Seller'){
            return next();

        }

    }
    return res.status(403).json({message: 'Not Authorized'})
}
module.exports={auth,isSeller}