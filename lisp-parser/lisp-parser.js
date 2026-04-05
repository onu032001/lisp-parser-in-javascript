class LispParser {
  readToken (token) {
    if (token === '(') {
      return {
        type: 'OPENING_PARENS'
      };
    } else if (token === ')') {
      return {
        type: 'CLOSING_PARENS'
      };
    } else if (token.match(/^-?\d+(?:\.\d*)?$/)) {
      return {
        type: 'NUMBER',
        value: parseFloat(token)
      };
    } else if (token.match(/^"(?:.|\\\\|\\")*(?<!\\)"$/)) {
      return {
        type: 'STRING',
        value: eval(token)
      }
    } else {
      return {
        type: 'SYMBOL',
        value: token
      };
    }
  }

  tokenize (expression) {
    return expression
      .replace(/\(/g, ' ( ')
      .replace(/\)/g, ' ) ')
      .trim()
      .split(/("(?:.|\\\\|\\")*?(?<!\\)"|.*?)\s+/)
      .filter(listItem => listItem !== '')
      .map(this.readToken);
  }

  buildAST (tokens) {
    return tokens.reduce((ast, token) => {
      if (token.type === 'OPENING_PARENS') {
        ast.push([]);
      } else if (token.type === 'CLOSING_PARENS') {
        const current_expression = ast.pop();
        ast[ast.length - 1].push(current_expression);
      } else {
        const current_expression = ast.pop();
        current_expression.push(token);
        ast.push(current_expression);
      }
      return ast;
    }, [[]])[0][0];
  }

  parse (expression) {
    return this.buildAST(this.tokenize(expression));
  }

  evaluate (ast, functionsList = {}) {
    if (ast instanceof Array) {
      const targetFunction = functionsList[ast[0].value];
      const functionParameters = [];
      for (let parameterIndex = 1; parameterIndex < ast.length; parameterIndex++) {
        functionParameters.push(ast[parameterIndex]);
      }
      return targetFunction({
        evalAST: astInput => this.evaluate(astInput, functionsList),
        funcs: functionsList
      }, ...functionParameters);
    }
    return ast.value;
  }

  evaluateCode (codeInput, functionsList = {}) {
    const astResult = this.parse(codeInput);
    return this.evaluate(astResult, functionsList);
  }
}
const lpjs = new LispParser();
