const cookieParser = require('cookie-parser')();
const Session = new require('./session.js');
const Acl = new require('./acl.js');
const aclExampleFile = './example-acl.json';

module.exports = class AccessManager{
  constructor(options){
    this.options = options;
    this.mongoose = options.mongoose;
    this.selectSchemas();
    this.makeModels();
    if(options.aclImport.run){ // import will shut down app when done
      this.importAcl();
    }else{
      let session = new Session({model: this.models.session, userModel: this.models.user});
      let acl = new Acl({model: this.models.acl});
      let app = options.expressApp;
      app.use(cookieParser);
      app.use(session);
      app.use(acl);
    }
  }

  defaultSchemas(){
    return {
      session: {
        loggedIn: {type:Boolean, default:false},
        user: { type: this.mongoose.Schema.Types.ObjectId, ref: 'User' }
      },
      acl: {
        path: {type: String, unique: true},
        /*
          Below, an array of a child role schema so on any given path we can assign atomic rights like: 
          path: 'news/*'
          roles: [
            {role: 'commenter', methods: 'POST'},
            {role: 'user', methods: 'GET'}
          ]
        */
        roles: [
          new this.mongoose.Schema({
            role: String,
            methods: [{type: String, enum: ['GET', 'POST', 'PUT', 'DELETE', 'ALL']}]
          })
        ]
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

  importAcl(){
    let jsonFile = this.options.aclImport.file || aclExampleFile;
    let entries = require(jsonFile);
    // save to the db
    let i = 0;
    for(let entry of entries){
      entry = new this.models.acl(entry);
      entry.save(()=>{
        i++;
        if(i == entries.length){ // shutdown when we are done importing
          mongoose.connection.close(()=>{
            console.log('Import done, mongoose connection closed');
            process.exit(0);
          });
        }
      });
    }
  }

}