// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const nodeSchema = new Schema({
//   type: { type: String, required: true },
//   left: { type: Schema.Types.Mixed, default: null },
//   right: { type: Schema.Types.Mixed, default: null },
//   value: { type: String, required: true },
// });

// const astSchema = new Schema({
//   ast: { type: nodeSchema, required: true },
// });

// module.exports = mongoose.model("AST", astSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nodeSchema = new Schema({
  type: { type: String, required: true },
  left: { type: Schema.Types.Mixed, default: null },
  right: { type: Schema.Types.Mixed, default: null },
  value: { type: String, required: true },
});

const astSchema = new Schema(
  {
    ast: { type: nodeSchema, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("AST", astSchema);
