export type AlgExpr =
  | { type: "Int"; value: number }
  | { type: "Var"; name: string }
  | { type: "Add"; arg1: AlgExpr; arg2: AlgExpr }
  | { type: "Sub"; arg1: AlgExpr; arg2: AlgExpr }
  | { type: "Mul"; arg1: AlgExpr; arg2: AlgExpr }
  | { type: "Div"; arg1: AlgExpr; arg2: AlgExpr }
  | { type: "Neg"; arg: AlgExpr };

export const renderExpression = (expression: AlgExpr): string => {
  switch (expression.type) {
    case "Int":
      return expression.value.toString();
    case "Var":
      return expression.name;
    case "Add":
      return `(${renderExpression(expression.arg1)} + ${renderExpression(expression.arg2)})`;
    case "Sub":
      return `(${renderExpression(expression.arg1)} - ${renderExpression(expression.arg2)})`;
    case "Mul":
      return `(${renderExpression(expression.arg1)} * ${renderExpression(expression.arg2)})`;
    case "Div":
      return `(${renderExpression(expression.arg1)} / ${renderExpression(expression.arg2)})`;
    case "Neg":
      return `(-${renderExpression(expression.arg)})`;
  }
}

// Render expression to LaTeX format for MathJax
export const renderExpressionLatex = (expression: AlgExpr): string => {
  switch (expression.type) {
    case "Int":
      return expression.value.toString();
    case "Var":
      return expression.name;
    case "Add":
      return `${renderExpressionLatex(expression.arg1)} + ${renderExpressionLatex(expression.arg2)}`;
    case "Sub":
      return `${renderExpressionLatex(expression.arg1)} - ${renderExpressionLatex(expression.arg2)}`;
    case "Mul":
      return `${renderExpressionLatex(expression.arg1)} \\cdot ${renderExpressionLatex(expression.arg2)}`;
    case "Div":
      return `\\frac{${renderExpressionLatex(expression.arg1)}}{${renderExpressionLatex(expression.arg2)}}`;
    case "Neg":
      return `-${renderExpressionLatex(expression.arg)}`;
  }
}

// Tokenizer
type Token = 
  | { type: 'number'; value: number }
  | { type: 'var'; name: string }
  | { type: 'op'; op: '+' | '-' | '*' | '/' }
  | { type: 'lparen' }
  | { type: 'rparen' };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  
  while (i < input.length) {
    const char = input[i];
    
    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    
    // Numbers
    if (/\d/.test(char)) {
      let numStr = '';
      while (i < input.length && /\d/.test(input[i])) {
        numStr += input[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseInt(numStr) });
      continue;
    }
    
    // Variables (letters)
    if (/[a-zA-Z]/.test(char)) {
      let varName = '';
      while (i < input.length && /[a-zA-Z]/.test(input[i])) {
        varName += input[i];
        i++;
      }
      tokens.push({ type: 'var', name: varName });
      continue;
    }
    
    // Operators
    if (char === '+' || char === '-' || char === '*' || char === '/') {
      tokens.push({ type: 'op', op: char });
      i++;
      continue;
    }
    
    // Parentheses
    if (char === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }
    
    if (char === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }
    
    throw new Error(`Unexpected character: ${char}`);
  }
  
  return tokens;
}

// Parser - Recursive descent
class Parser {
  private tokens: Token[];
  private pos: number;
  
  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.pos = 0;
  }
  
  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }
  
  private consume(): Token {
    return this.tokens[this.pos++];
  }
  
  // Parse addition and subtraction (lowest precedence)
  private parseAddSub(): AlgExpr {
    let left = this.parseMulDiv();
    
    while (this.peek()?.type === 'op' && 
           ((this.peek() as any).op === '+' || (this.peek() as any).op === '-')) {
      const op = (this.consume() as any).op;
      const right = this.parseMulDiv();
      
      if (op === '+') {
        left = { type: 'Add', arg1: left, arg2: right };
      } else {
        left = { type: 'Sub', arg1: left, arg2: right };
      }
    }
    
    return left;
  }
  
  // Parse multiplication and division (higher precedence)
  private parseMulDiv(): AlgExpr {
    let left = this.parsePrimary();
    
    while (this.peek()?.type === 'op' && 
           ((this.peek() as any).op === '*' || (this.peek() as any).op === '/')) {
      const op = (this.consume() as any).op;
      const right = this.parsePrimary();
      
      if (op === '*') {
        left = { type: 'Mul', arg1: left, arg2: right };
      } else {
        left = { type: 'Div', arg1: left, arg2: right };
      }
    }
    
    return left;
  }
  
  // Parse primary expressions (numbers, variables, parentheses)
  private parsePrimary(): AlgExpr {
    const token = this.peek();
    
    if (!token) {
      throw new Error('Unexpected end of input');
    }
    
    if (token?.type === 'op' && token.op === '-') {
      this.consume(); // consume '-'
      const expr = this.parsePrimary();
      return { type: 'Neg', arg: expr };
    }

    if (token.type === 'number') {
      this.consume();
      return { type: 'Int', value: token.value };
    }
    
    if (token.type === 'var') {
      this.consume();
      return { type: 'Var', name: token.name };
    }
    
    if (token.type === 'lparen') {
      this.consume(); // consume '('
      const expr = this.parseAddSub();
      
      if (this.peek()?.type !== 'rparen') {
        throw new Error('Expected closing parenthesis');
      }
      this.consume(); // consume ')'
      
      return expr;
    }
    
    throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
  }
  
  parse(): AlgExpr {
    const result = this.parseAddSub();
    
    if (this.pos < this.tokens.length) {
      throw new Error('Unexpected tokens after expression');
    }
    
    return result;
  }
}

export const parseExpression = (expression: string): AlgExpr => {
  const tokens = tokenize(expression);
  const parser = new Parser(tokens);
  return parser.parse();
}


// Objective 2

const isNumber = (expr: AlgExpr): boolean => {
  return expr.type === "Int" || (expr.type === "Neg" && expr.arg.type === "Int");
}

const getValue = (expr: AlgExpr): number => {
  if (expr.type === "Neg" && expr.arg.type === "Int") {
    return -expr.arg.value;
  }
  if (expr.type === "Int") {
    return expr.value;
  }
  throw new Error("Expression is not a number");
}

const standardizeNumber = (n: number): AlgExpr => {
  if (n < 0) {
    return { type: "Neg", arg: { type: "Int", value: -n } };
  }
  return { type: "Int", value: n };
}

export const evaluateExpression = (expression: AlgExpr): AlgExpr => {
  // Add, Sub, Mul
  if(expression.type === "Add" || expression.type === "Sub" || expression.type === "Mul") {
    let left = evaluateExpression(expression.arg1);
    let right = evaluateExpression(expression.arg2);
    
    if(isNumber(left) && isNumber(right)) {
      let val: number;
      switch(expression.type) {
        case "Add":
          val = getValue(left) + getValue(right);
          break;
        case "Sub":
          val = getValue(left) - getValue(right);
          break;
        case "Mul":
          val = getValue(left) * getValue(right);
          break;
        }
      return standardizeNumber(val);
    }
    else {
      return { type: expression.type, arg1: left, arg2: right };
    }
  }

  //Div
  if(expression.type === "Div") {
    let left = evaluateExpression(expression.arg1);
    let right = evaluateExpression(expression.arg2);
    
    if(isNumber(left) && isNumber(right) && getValue(right) !== 0 && getValue(left) % getValue(right) === 0) {
        let val = getValue(left) / getValue(right);
        return standardizeNumber(val);
    }
    else {
      return { type: expression.type, arg1: left, arg2: right };
    }
  }

  // Neg
  if(expression.type === "Neg") {
    const argEval = evaluateExpression(expression.arg);
    if (argEval.type === "Neg") {
      return argEval.arg;
    }
    return { type: "Neg", arg: argEval };
  }

  // otherwise, return as is for Neg, Int, Var types
  return expression;
}


// Objective 3

// Extracts unique variable names from an AlgExpr
const getVariablesSet = (expr: AlgExpr): Set<string> => {
  const vars = new Set<string>();
  
  const traverse = (e: AlgExpr): void => {
    if(e.type === "Var") {
      vars.add(e.name);
    }
    else if(e.type === "Neg") {
      traverse(e.arg);
    }
    else if(e.type === "Add" || e.type === "Sub" || e.type === "Mul" || e.type === "Div") {
      traverse(e.arg1);
      traverse(e.arg2);
    }
  }

  traverse(expr);
  return vars;
}

// Substitutes variables in an expression with random integers
const substituteVariables = (varMap: Map<string, number>, expr: AlgExpr): AlgExpr => {
  if(expr.type === "Var") {
     return { type: "Int", value: varMap.get(expr.name)!};
  }
  if(expr.type === "Neg") {
    return { type: "Neg", arg: substituteVariables(varMap, expr.arg) };
  }
  if(expr.type === "Add" || expr.type === "Sub" || expr.type === "Mul" || expr.type === "Div") {
    return { type: expr.type, arg1: substituteVariables(varMap, expr.arg1), arg2: substituteVariables(varMap, expr.arg2) };
  }
  return expr; // Int
}

// get the float value
const getComputedValue = (expr: AlgExpr): number => {
  switch (expr.type) {
    case "Int": return expr.value;
    case "Neg": return -getComputedValue(expr.arg);
    case "Add": return getComputedValue(expr.arg1) + getComputedValue(expr.arg2);
    case "Sub": return getComputedValue(expr.arg1) - getComputedValue(expr.arg2);
    case "Mul": return getComputedValue(expr.arg1) * getComputedValue(expr.arg2);
    case "Div": {
      const denom = getComputedValue(expr.arg2);
      if (denom === 0) return NaN; 
      return getComputedValue(expr.arg1) / denom;
    }
    case "Var": return NaN; // Should not happen if substitution worked
  }
};

// function take two algExpr and return boolean indicating whether two expressions are algebraically (semantically) equivalent. 
export const areExpressionsEquivalent = (expr1: AlgExpr, expr2: AlgExpr): boolean => {

  const vars1 = getVariablesSet(expr1);
  const vars2 = getVariablesSet(expr2); 
  const vars = new Set<string>([...Array.from(vars1), ...Array.from(vars2)]);

  // if(vars.size !== vars1.size || vars.size !== vars2.size) {
  //   return false;
  // }


  const iterations  = 10;
  const range = 100;
  for(let i = 0; i < iterations; i++) {
      const varMap = new Map<string, number>();
      vars.forEach(v => {
        varMap.set(v, Math.floor(Math.random() * range) - range/2);
      });

      const substitutedExpr1 = substituteVariables(varMap, expr1);
      const substitutedExpr2 = substituteVariables(varMap, expr2);

      const evaluatedExpr1 = evaluateExpression(substitutedExpr1);
      const evaluatedExpr2 = evaluateExpression(substitutedExpr2);

      const val1 = getComputedValue(evaluatedExpr1);
      const val2 = getComputedValue(evaluatedExpr2);

      // they don't match
     if (!isNaN(val1) && !isNaN(val2)) {
       if (Math.abs(val1 - val2) > 0.0001) {
         return false;
       }
     }
    }

  return true;   
}