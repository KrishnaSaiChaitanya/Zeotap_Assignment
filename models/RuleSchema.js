const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nodeSchema = new Schema({
  type: String,
  left: { type: Schema.Types.Mixed, default: null },
  right: { type: Schema.Types.Mixed, default: null },
  value: { type: String, default: null },
});

const ruleSchema = new Schema({
  ruleString: String,
  ast: nodeSchema,
});

module.exports = mongoose.model("Rule", ruleSchema);
