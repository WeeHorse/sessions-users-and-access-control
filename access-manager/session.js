module.exports = class Session{

  constructor(settings){
    this.SessionModel = settings.model;
    this.UserModel = settings.userModel;
    return async(...args) => await this.session(...args);
  }

  async session(req, res, next){
    let mySession;
    if(!req.cookies.session){
      // set a cookie for a session if it doesn't exist
      mySession = new this.SessionModel();
      res.cookie('session', mySession._id, {
        path: '/',
        httpOnly: true
      });
      // save our new cookie to our new session
      mySession.save();
      req.session = mySession;
    }
    else {
      // Retrieve a stored session from our cookie session id
      //let sessions = await this.SessionModel.find({_id:req.cookies.session});
      mySession = await this.SessionModel.findOne({_id:req.cookies.session}).populate('user').exec();
      if(mySession){
        req.session = mySession;
        // is there a user saved on the session and are they logged in?
        if(req.session.user && req.session.loggedIn){
          req.user = req.session.user;
        //   let users = await this.UserModel.find({_id: req.session.data.userId});
        //   if(users[0]){
        //     req.user = users[0]; // apply the user object
        //   }
        }
      }else{
        delete(req.cookies.session);
        return await this.session(req, res, next);
      }
    }
    if(!req.user){
      req.user = {'roles':['anonymous']}; // anonymous user
    }
    next();
  }

}