global.mongoose = require('mongoose'); 
mongoose.connect('mongodb://localhost/session_auth_and_acl');
mongoose.connection.on('error', (e)=>{ console.error(e); });
mongoose.connection.once('open', ()=>{ console.info('db connected');});

// Access Control List-data:
const ACL = require('./acl-model.js');

let entries = [
  new ACL({path:'/admin', roles:['admin','super']}),
  new ACL({path:'/login', roles:['anonymous']}),
  new ACL({path:'/logout', roles:['user']}),
  new ACL({path:'/', roles:['*']}),
  new ACL({path:'/messages', roles:['user']}),
  new ACL({path:'/user', roles:['user']}),
  new ACL({path:'/register', roles:['anonymous']})
];

// save to the db
let i = 0;
for(let entry of entries){
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
