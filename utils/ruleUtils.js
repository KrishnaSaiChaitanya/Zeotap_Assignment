// utils.js

const areBracketsBalanced = (tokens) => {
  let temp = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === "(" || tokens[i] === ")") {
      if (temp.length === 0) {
        temp.push(tokens[i]);
      } else if (temp[temp.length - 1] === "(" && tokens[i] === ")") {
        temp.pop();
      } else {
        temp.push(tokens[i]);
      }
    }
  }
  return temp.length === 0;
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

module.exports = { areBracketsBalanced, parseExpression };
