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
    // let entries = await this.AclModel.find({roles: {$in: roles}});
    console.log('req.path', req.path, 'req.method', req.method, 'roles', roles);
    let entries = await this.AclModel.find({ 
      path: req.path,
      'roles.role':{$in: roles}
    });
    console.log('entries', entries);
    // now, do we have the proper method in any of our matched role(s)
    let remaining = [];
    for(let entry of entries){
      let remRoles = entry.roles.filter(role => role.methods.includes(req.method));
      if(remRoles.length > 0){
        remaining.push(entry);
      }
    }
    // let remaining = entries.filter(entry => {
    //   entry.roles.filter(role => role.methods.includes(req.method))
    // });
    console.log('remaining', remaining);
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