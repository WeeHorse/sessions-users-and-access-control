global.mongoose = require('mongoose'); 
mongoose.connect('mongodb://localhost/session_auth_and_acl');
mongoose.connection.on('error', (e)=>{ console.error(e); });
mongoose.connection.once('open', ()=>{ console.info('db connected');});

// Access Control List-data:
const ACL = require('./acl-model.js');

let entries = [
  new ACL({path:'/admin', roles:[ {role: 'admin', methods: ['ALL']}, {role: 'super', methods: ['ALL']} ]}),
  new ACL({path:'/login', roles:[ {role: 'anonymous', methods: ['POST']} ]}),
  new ACL({path:'/logout', roles:[ {role: 'user', methods: ['GET','POST']} ]}),
  new ACL({path:'/', roles:[ {role: '*', methods: ['GET']} ]}),
  new ACL({path:'/messages', roles:[ {role: 'user', methods: ['GET','POST','DELETE']} ]}),
  new ACL({path:'/user', roles:[ {role: 'user', methods: ['GET']} ]}),
  new ACL({path:'/register', roles:[ {role: 'anonymous', methods: ['POST']}, {role: 'super', methods: ['POST']} ]})
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
