class Node {
  constructor(type, left = null, right = null, value = null) {
    this.type = type;
    this.left = left;
    this.right = right;
    this.value = value;
  }
}

const operators = {
  AND: (a, b) => new Node("operator", a, b, "AND"),
  OR: (a, b) => new Node("operator", a, b, "OR"),
  ">": (a, b) => new Node("operator", a, b, ">"),
  "<": (a, b) => new Node("operator", a, b, "<"),
  "==": (a, b) => new Node("operator", a, b, "=="),
  "!=": (a, b) => new Node("operator", a, b, "!="),
  ">=": (a, b) => new Node("operator", a, b, ">="),
  "<=": (a, b) => new Node("operator", a, b, "<="),
};

const parseExpression = (tokens) => {
  const stack = [];
  const output = [];

  while (tokens.length > 0) {
    const token = tokens.shift();

    if (token === "(") {
      stack.push(token);
    } else if (token === ")") {
      while (stack.length && stack[stack.length - 1] !== "(") {
        output.push(stack.pop());
      }
      stack.pop();
    } else if (token in operators) {
      while (stack.length && operators[token]) {
        output.push(stack.pop());
      }
      stack.push(token);
    } else {
      output.push(token);
    }
  }

  while (stack.length) {
    output.push(stack.pop());
  }

  return buildAst(output);
};

const buildAst = (tokens) => {
  const stack = [];

  while (tokens.length > 0) {
    const token = tokens.shift();

    if (token instanceof Node || !operators[token]) {
      stack.push(new Node("operand", null, null, token));
    } else {
      const right = stack.pop();
      const left = stack.pop();
      stack.push(operators[token](left, right));
    }
  }

  return stack[0];
};

const tokenize = (str) => {
  const regex =
    /(\()|(\))|(\band\b|\bor\b|>=|<=|!=|==|>|<)|(\d+|'[^']*'|[a-zA-Z_][a-zA-Z0-9_]*)/gi;
  return str.match(regex).map((token) => {
    if (token.toLowerCase() === "and") return "AND";
    if (token.toLowerCase() === "or") return "OR";
    return token;
  });
};

const parseRuleString = (ruleString) => {
  const tokens = tokenize(ruleString);
  return parseExpression(tokens);
};

module.exports = { Node, parseRuleString };
