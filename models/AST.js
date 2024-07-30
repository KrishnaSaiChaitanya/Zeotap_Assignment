const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Node schema for AST
const nodeSchema = new Schema({
  type: { type: String, required: true },
  left: { type: Schema.Types.Mixed, default: null },
  right: { type: Schema.Types.Mixed, default: null },
  value: { type: String, default: null },
});

// Define the AST schema
const astSchema = new Schema(
  {
    ast: { type: nodeSchema, required: true },
  },
  { timestamps: true }
); // Optionally add timestamps

const AST = mongoose.model("AST", astSchema);

module.exports = AST;
