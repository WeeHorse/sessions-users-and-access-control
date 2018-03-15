const Schema = mongoose.Schema;
const ACL = mongoose.model('ACL', new Schema({
  path: {type: String, unique: true},
  roles: [String]
}));

/*
  ACL – Access Control List:

path:    roles:         
/admin   [admin, super]
/login   [anonymous] 
/logout  [user] 
/        [*]
/message [user]
*/

/*
// run these for example acl
let a = new ACL({path:'/admin', roles:['admin','super']});
a.save();
let a1 = new ACL({path:'/login', roles:['anonymous']});
a1.save();
let a2 = new ACL({path:'/logout', roles:['user']});
a2.save();
let a3 = new ACL({path:'/', roles:['*']});
a3.save();
let a4 = new ACL({path:'/messages', roles:['user']});
a4.save();
let a5 = new ACL({path:'/user', roles:['user']});
a5.save();
*/

module.exports = async function(req, res, next){
  let roles = ['*']; // everyone has the "*" (all) role
  // pick roles from session uses
  if(req.user._id){
    roles = [...roles, ...req.user.roles]; // concat in the user roles (using spread operator)
    // roles = roles.concat(req.user.roles); // old syntax
  }else{
    // add the non-authenticated role
    roles.push('anonymous');
  }
  // find ACL paths that maches roles
  let paths = await ACL.find({roles: {$in: roles}});
  // now, are we on a valid route or not? Reject or pass?
  let remaining = paths.filter(p => p.path.includes(req.path));
  if(remaining.length > 0){
    // pass!
    next();
  }
  else{ 
    // reject! (we are not allowed here)
    res.status(403);
    res.send('Forbidden');
  }
}