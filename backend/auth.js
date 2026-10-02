const jwt=require('jsonwebtoken');
const secret=process.env.JWT_SECRET || 'dev_only_change_me';
function createToken(user){return jwt.sign({id:user.id,email:user.email,role:user.role},secret,{expiresIn:'1d'});}
function authenticate(req,res,next){
  const header=req.headers.authorization;
  if(!header) return res.status(401).json({error:'Authentication required'});
  const [scheme,token]=header.split(' ');
  if(scheme!=='Bearer'||!token) return res.status(401).json({error:'Invalid authorization format'});
  try{req.user=jwt.verify(token,secret);next();}catch(e){return res.status(401).json({error:'Invalid or expired token'});}
}
function requireRole(...roles){return (req,res,next)=>{if(!req.user)return res.status(401).json({error:'Authentication required'});if(!roles.includes(req.user.role))return res.status(403).json({error:'You do not have permission for this action'});next();};}
module.exports={createToken,authenticate,requireRole};
