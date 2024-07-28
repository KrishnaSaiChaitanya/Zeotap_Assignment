const express = require("express");
const router = express.Router();
const Rule = require("../models/RuleSchema");
const { Node, parseRuleString } = require("./customParser");

const combineRules = (asts) => {
  const combinedAst = new Node("operator", null, null, "AND");
  combinedAst.left = asts[0];
  combinedAst.right = asts[1];
  return combinedAst;
};

const evaluateRule = (ast, data) => {
  const evaluateNode = (node, data) => {
    if (node.type === "operand") {
      return eval(node.value.replace(/(\w+)/g, (match) => `data.${match}`));
    } else if (node.type === "operator") {
      const leftResult = evaluateNode(node.left, data);
      const rightResult = evaluateNode(node.right, data);
      return node.value === "AND"
        ? leftResult && rightResult
        : leftResult || rightResult;
    }
  };
  return evaluateNode(ast, data);
};

router.post("/create_rule", async (req, res) => {
  const { ruleString } = req.body;
  const existingRule = await Rule.findOne({ ruleString });
  if (existingRule) {
    return res.status(400).json({ message: "Rule already exists" });
  }
  const ast = parseRuleString(ruleString);
  const newRule = new Rule({ ruleString, ast });
  await newRule.save();
  res.json(ast);
});

router.post("/combine_rules", async (req, res) => {
  const { ruleStrings } = req.body;
  const rules = await Rule.find({ ruleString: { $in: ruleStrings } });
  const asts = rules.map((rule) => rule.ast);
  const combinedAst = combineRules(asts);
  res.json(combinedAst);
});

router.post("/evaluate_rule", (req, res) => {
  const { ast, data } = req.body;
  const result = evaluateRule(ast, data);
  res.json(result);
});

module.exports = router;
