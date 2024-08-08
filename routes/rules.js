const express = require("express");
const router = express.Router();
const Rule = require("../models/RuleSchema");
const AST = require("../models/AST");
const { Node } = require("../models/Node");
const { areBracketsBalanced } = require("../utils/ruleUtils");
const { json } = require("body-parser");

const parseRuleString = (ruleString) => {
  const tokens = tokenize(ruleString);
  return parseExpression(tokens);
};

const tokenize = (str) => {
  const regex =
    /(\()|(\))|(\bAND\b|\bOR\b)|([a-zA-Z_][a-zA-Z0-9_]*\s*(==|!=|>=|<=|>|<|=)\s*('[^']*'|\d+|[a-zA-Z_][a-zA-Z0-9_]*))/gi;
  return str.match(regex).map((token) => {
    return token;
  });
};

const parseExpression = (tokens) => {
  if (!tokens.length) return null;

  const stack = [];
  const operators = [];

  while (tokens.length) {
    const token = tokens.shift();

    if (token === "(") {
      operators.push(token);
    } else if (token === ")") {
      while (operators.length && operators[operators.length - 1] !== "(") {
        const operator = operators.pop();
        const right = stack.pop();
        const left = stack.pop();
        stack.push(new Node("operator", left, right, operator));
      }
      operators.pop();
    } else if (token === "AND" || token === "OR") {
      while (operators.length && operators[operators.length - 1] !== "(") {
        const operator = operators.pop();
        const right = stack.pop();
        const left = stack.pop();
        stack.push(new Node("operator", left, right, operator));
      }
      operators.push(token);
    } else {
      if (
        tokens.length &&
        ["=", ">", "<", "!=", ">=", "<="].includes(tokens[0])
      ) {
        const operator = tokens.shift();
        const value = tokens.shift();
        stack.push(
          new Node("operand", null, null, `${token} ${operator} ${value}`)
        );
      } else {
        stack.push(new Node("operand", null, null, token));
      }
    }
  }

  while (operators.length) {
    const operator = operators.pop();
    const right = stack.pop();
    const left = stack.pop();
    stack.push(new Node("operator", left, right, operator));
  }
  return stack[0];
};

const combineRules = (ruleStrings) => {
  const combinedRuleString = ruleStrings
    .map((rule) => `(${rule})`)
    .join(" AND ");
  const ast = parseRuleString(combinedRuleString);
  return ast;
};

const evaluateRule = (ast, data) => {
  const evaluateNode = (node, data) => {
    if (node.type === "operand") {
      const condition = node.value;
      const match = condition.match(
        /([a-zA-Z_][a-zA-Z0-9_]*)\s*(=|>|<)\s*('[^']*'|\d+)/
      );

      if (!match) {
        console.error(
          `Condition "${condition}" did not match the expected format.`
        );
        return false;
      }

      const [_, attribute, operator, value] = match;
      const parsedValue = isNaN(value)
        ? value.replace(/'/g, "")
        : parseInt(value, 10);

      console.log(
        `Evaluating condition: ${attribute} ${operator} ${value} against data: ${data[attribute]}`
      );

      if (operator === "=") {
        return data[attribute] == parsedValue;
      } else if (operator === ">") {
        return data[attribute] > parsedValue;
      } else if (operator === "<") {
        return data[attribute] < parsedValue;
      }
    } else if (node.type === "operator") {
      const leftResult = evaluateNode(node.left, data);
      const rightResult = evaluateNode(node.right, data);

      console.log(
        `Evaluating operator: ${node.value}, left result: ${leftResult}, right result: ${rightResult}`
      );

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

router.post("/create_rule", async (req, res) => {
  const { ruleString } = req.body;

  if (!ruleString || ruleString.trim().length === 0) {
    return res.status(400).json({ message: "Please enter a valid input" });
  }
  const existingRule = await Rule.findOne({ ruleString });
  if (existingRule) {
    return res.status(400).json({ message: "Rule already exists" });
  }
  if (!areBracketsBalanced(tokenize(ruleString))) {
    return res.status(400).json({ message: "Please enter a valid rule" });
  }
  try {
    const ast = parseRuleString(ruleString);
    const astDoc = new AST({ ast });
    await astDoc.save();
    const newRule = new Rule({ ruleString, ast: astDoc._id });
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
  const { selectedRules } = req.body;
  if (!selectedRules || !Array.isArray(selectedRules)) {
    return res.status(400).json({
      error: "Invalid input. Please provide an array of rule strings.",
    });
  }
  try {
    const ast = combineRules(selectedRules);
    res.json({ ast });
  } catch (error) {
    res.status(500).json({ error: "Failed to combine rules and parse AST." });
  }
});

router.post("/evaluate_rule", (req, res) => {
  const { ast, data } = req.body;
  const result = evaluateRule(ast, data);
  res.json(result);
});

router.get("/get-all-rules", async (req, res) => {
  try {
    const rules = await Rule.find();
    if (!rules) {
      return res.status(404).json({ message: "No AST found" });
    }
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch the latest AST", error });
  }
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
