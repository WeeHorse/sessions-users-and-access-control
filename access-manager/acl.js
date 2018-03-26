module.exports = class Acl{

  constructor(settings){
    this.AclModel = settings.model;
    return async (...args) => await this.acl(...args);
  }

  async acl(req, res, next){
    let roles = ['*']; // everyone always has the "*" (all) role
    // pick roles from session uses
    if(req.user._id){
      roles = [...roles, ...req.user.roles]; // concat in the user roles (using spread operator)
      // roles = roles.concat(req.user.roles); // old syntax
    }else{
      // add the non-authenticated role
      roles.push('anonymous');
    }
    // find ACL paths that maches roles
    let paths = await this.AclModel.find({roles: {$in: roles}});
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

}