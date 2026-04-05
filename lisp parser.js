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
        value: token.substring(1, token.length - 1)
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
      .split(/("(?:.|\\\\|\\")*(?<!\\)"|.*?)\s+/)
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

  evaluate (ast, funcs = {}) {
    if (ast instanceof Array) {
      const func = funcs[ast[0].value];
      const params = [];
      for (let index = 1; index < ast.length; index++) {
        params.push(ast[index]);
      }
      return func([this.evaluate, funcs], ...params);
    }
    return ast.value;
  }

  evaluateCode (code, funcs = {}) {
    const ast = this.parse(code);
    return this.evaluate(ast, funcs);
  }
}