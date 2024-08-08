// const mongoose = require("mongoose");

// const nodeSchema = new mongoose.Schema({
//   type: { type: String, required: true },
//   left: { type: mongoose.Schema.Types.Mixed, default: null },
//   right: { type: mongoose.Schema.Types.Mixed, default: null },
//   value: { type: String, default: null },
// });

// const ruleSchema = new mongoose.Schema({
//   ruleString: { type: String, required: true, unique: true },
//   ast: { type: nodeSchema, required: true },
// });

// const Rule = mongoose.model("Rule", ruleSchema);

// module.exports = Rule;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ruleSchema = new Schema({
  ruleString: { type: String, required: true, unique: true },
  ast: { type: Schema.Types.ObjectId, ref: "AST", required: true },
});

module.exports = mongoose.model("Rule", ruleSchema);
