const Schema = mongoose.Schema;

module.exports = mongoose.model('ACL', new Schema({
  path: {type: String, unique: true},
  roles: [String]
}));

