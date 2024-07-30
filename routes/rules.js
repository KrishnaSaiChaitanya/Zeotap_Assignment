const express = require("express");
const router = express.Router();
const Rule = require("../models/RuleSchema");
const AST = require("../models/AST");
const { Node } = require("./customParser");

const combineRules = (asts) => {
  const combinedAst = new Node("operator", null, null, "AND");
  combinedAst.left = asts[0];
  combinedAst.right = asts[1];
  return combinedAst;
};

const evaluateRule = (ast, data) => {
  const evaluateNode = (node, data) => {
    if (node.type === "operand") {
      const condition = node.value;
      const [attribute, operator, value] = condition
        .split(/([><=])/)
        .map((s) => s.trim());
      const parsedValue = isNaN(value)
        ? value.replace(/'/g, "")
        : parseInt(value, 10);

      if (operator === ">") {
        return data[attribute] > parsedValue;
      } else if (operator === "<") {
        return data[attribute] < parsedValue;
      } else if (operator === "=") {
        return data[attribute] == parsedValue;
      }
    } else if (node.type === "operator") {
      const leftResult = evaluateNode(node.left, data);
      const rightResult = evaluateNode(node.right, data);

      if (node.value === "AND") {
        return leftResult && rightResult;
      } else if (node.value === "OR") {
        return leftResult || rightResult;
      }
    }
    return false;
  };
  return evaluateNode(ast, data);
};

const tokenize = (ruleString) => {
  const regex = /\(|\)|AND|OR|>|<|=|\w+|\'[^\']*\'|\d+/g;
  return ruleString.match(regex);
};

const parseExpression = (tokens) => {
  if (!tokens.length) return null;

  const token = tokens.shift();

  if (token === "(") {
    const left = parseExpression(tokens);
    const operator = tokens.shift();
    const right = parseExpression(tokens);
    tokens.shift(); // Remove the closing parenthesis
    return new Node("operator", left, right, operator);
  } else if (token === "AND" || token === "OR") {
    return new Node("operator", null, null, token);
  } else {
    if (tokens.length && [">", "<", "=", "!="].includes(tokens[0])) {
      const operator = tokens.shift();
      const value = tokens.shift();
      return new Node("operand", null, null, `${token} ${operator} ${value}`);
    } else {
      return new Node("operand", null, null, token);
    }
  }
};

const parseRuleString = (ruleString) => {
  const tokens = tokenize(ruleString);
  return parseExpression(tokens);
};

router.post("/create_rule", async (req, res) => {
  const { ruleString } = req.body;
  if (!ruleString || ruleString.trim().length === 0) {
    return res.status(400).json({ message: "Please enter a valid input" });
  }
  const existingRule = await Rule.findOne({ ruleString });
  if (existingRule) {
    return res.status(400).json({ message: "Rule already exists" });
  }

  try {
    const ast = parseRuleString(ruleString);
    const astDoc = new AST({ ast });
    await astDoc.save();
    const newRule = new Rule({ ruleString, ast: ast });
    await newRule.save();
    res.json({ ast });
  } catch (error) {
    res.status(500).json({
      message: "Failed to parse rule or save to database",
      errors: error,
    });
  }
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

router.get("/latest_ast", async (req, res) => {
  try {
    const latestAST = await AST.findOne().sort({ createdAt: -1 }).exec();
    if (!latestAST) {
      return res.status(404).json({ message: "No AST found" });
    }
    res.json(latestAST);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch the latest AST", error });
  }
});

module.exports = router;
