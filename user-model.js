const Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({
  email: {type: String, required:true, unique:true},
  password: {type: String, required:true},
  roles: [String]
}));
