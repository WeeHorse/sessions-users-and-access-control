const Schema = mongoose.Schema;

module.exports = mongoose.model('Session', new Schema({
  loggedIn: {type:Boolean, default:false},
  data: Schema.Types.Mixed
}));