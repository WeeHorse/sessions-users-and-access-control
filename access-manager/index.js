const cookieParser = require('cookie-parser')();
const Session = new require('./session.js')
const Acl = new require('./acl.js')

module.exports = class AccessManager{
  constructor(options){
    this.options = options;
    this.mongoose = options.mongoose;
    this.selectSchemas();
    this.makeModels();
    let session = new Session({model: this.models.session, userModel: this.models.user});
    let acl = new Acl({model: this.models.acl});
    let app = options.expressApp;
    app.use(cookieParser);
    app.use(session);
    app.use(acl);
  }

  defaultSchemas(){
    return {
      session: {
        loggedIn: {type:Boolean, default:false},
        data: this.mongoose.Schema.Types.Mixed
      },
      acl: {
        path: {type: String, unique: true},
        roles: [String]
      },
      user: {
        email: {type: String, required:true, unique:true},
        password: {type: String, required:true},
        roles: [String]
      }
    }
  }

  selectSchemas(){
    this.schemas = this.defaultSchemas();
    if(this.options.userSchema){
      this.schemas.user = this.options.userSchema;
    }
    if(this.options.sessionSchema){
      this.schemas.session = this.options.sessionSchema;
    }
    if(this.options.aclSchema){
      this.schemas.acl = this.options.aclSchema;
    }
  }

  makeModels(options){
    this.models = {
      user: this.mongoose.model('User', new this.mongoose.Schema(this.schemas.user)),
      session: this.mongoose.model('Session', new this.mongoose.Schema(this.schemas.session)),
      acl: this.mongoose.model('Acl', new this.mongoose.Schema(this.schemas.acl))
    };
  }

}