/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Token,
  TokenType,
  ASTNode,
  ASTNodeType,
  SymbolTableEntry,
  SemanticCheckResult,
  TACInstruction,
  OptimizationStep,
  AssemblyLine,
  CompilerResult
} from './types';

let astNodeIdCounter = 0;
function getAstId(prefix: 'ast' | 'ast-err', line: number | string, col: number | string): string {
  return `${prefix}-${line}-${col}-${astNodeIdCounter++}`;
}

// ==========================================
// 1. LEXICAL ANALYZER (LEXER)
// ==========================================

export function tokenize(code: string, language: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split('\n');

  // Regex patterns
  const KEYWORDS_JS = /^(let|const|var|if|else|return|while|for|function|true|false)$/;
  const KEYWORDS_PYTHON = /^(def|if|else|elif|for|while|return|True|False|and|or|not|in)$/;
  const KEYWORDS_C = /^(int|float|double|char|void|if|else|return|while|for|const|true|false)$/;

  const isKeyword = (word: string): boolean => {
    if (language === 'javascript') return KEYWORDS_JS.test(word);
    if (language === 'python') return KEYWORDS_PYTHON.test(word);
    return KEYWORDS_C.test(word);
  };

  let tokenIdCounter = 1;

  for (let lIdx = 0; lIdx < lines.length; lIdx++) {
    const rawLine = lines[lIdx];
    let line = rawLine;
    let colOffset = 0;

    // First, preserve comment if any, but pull it out for matching
    let commentText = '';
    let commentCol = -1;

    const jsCommentIdx = line.indexOf('//');
    const pyCommentIdx = line.indexOf('#');

    if ((language === 'javascript' || language === 'c') && jsCommentIdx !== -1) {
      commentText = line.substring(jsCommentIdx);
      commentCol = jsCommentIdx;
      line = line.substring(0, jsCommentIdx);
    } else if (language === 'python' && pyCommentIdx !== -1) {
      commentText = line.substring(pyCommentIdx);
      commentCol = pyCommentIdx;
      line = line.substring(0, pyCommentIdx);
    }

    let i = 0;
    while (i < line.length) {
      const char = line[i];

      // Whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Numbers
      if (/\d/.test(char)) {
        let val = '';
        const startCol = i;
        while (i < line.length && /[\d\.]/.test(line[i])) {
          val += line[i];
          i++;
        }
        tokens.push({
          id: `t-${tokenIdCounter++}`,
          type: 'NUMBER',
          value: val,
          line: lIdx + 1,
          column: startCol + 1
        });
        continue;
      }

      // Identifiers / Keywords
      if (/[a-zA-Z_]/.test(char)) {
        let val = '';
        const startCol = i;
        while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) {
          val += line[i];
          i++;
        }
        const tokenType = isKeyword(val) ? 'KEYWORD' : 'IDENTIFIER';
        tokens.push({
          id: `t-${tokenIdCounter++}`,
          type: tokenType,
          value: val,
          line: lIdx + 1,
          column: startCol + 1
        });
        continue;
      }

      // String literals
      if (char === '"' || char === "'") {
        const quoteType = char;
        let val = quoteType;
        const startCol = i;
        i++;
        while (i < line.length && line[i] !== quoteType) {
          val += line[i];
          i++;
        }
        if (i < line.length) {
          val += quoteType;
          i++;
        }
        tokens.push({
          id: `t-${tokenIdCounter++}`,
          type: 'STRING',
          value: val,
          line: lIdx + 1,
          column: startCol + 1
        });
        continue;
      }

      // Double-character operators or comparisons
      const doubleChar = line.substring(i, i + 2);
      if (['==', '!=', '<=', '>=', '+=', '-='].includes(doubleChar)) {
        const tokenType: TokenType = doubleChar.endsWith('=') && !['==', '!=', '<=', '>='].includes(doubleChar) 
          ? 'ASSIGN' 
          : 'COMPARISON';
        tokens.push({
          id: `t-${tokenIdCounter++}`,
          type: tokenType,
          value: doubleChar,
          line: lIdx + 1,
          column: i + 1
        });
        i += 2;
        continue;
      }

      // Single-character operators / comparisons
      if (['<', '>'].includes(char)) {
        tokens.push({
          id: `t-${tokenIdCounter++}`,
          type: 'COMPARISON',
          value: char,
          line: lIdx + 1,
          column: i + 1
        });
        i++;
        continue;
      }

      if (char === '=') {
        tokens.push({
          id: `t-${tokenIdCounter++}`,
          type: 'ASSIGN',
          value: char,
          line: lIdx + 1,
          column: i + 1
        });
        i++;
        continue;
      }

      if (['+', '-', '*', '/', '%'].includes(char)) {
        tokens.push({
          id: `t-${tokenIdCounter++}`,
          type: 'OPERATOR',
          value: char,
          line: lIdx + 1,
          column: i + 1
        });
        i++;
        continue;
      }

      // Parentheses & Braces
      if (['(', ')'].includes(char)) {
        tokens.push({
          id: `t-${tokenIdCounter++}`,
          type: 'PAREN',
          value: char,
          line: lIdx + 1,
          column: i + 1
        });
        i++;
        continue;
      }

      if (['{', '}'].includes(char)) {
        tokens.push({
          id: `t-${tokenIdCounter++}`,
          type: 'BRACE',
          value: char,
          line: lIdx + 1,
          column: i + 1
        });
        i++;
        continue;
      }

      // Punctuation
      if ([';', ',', ':', '.'].includes(char)) {
        tokens.push({
          id: `t-${tokenIdCounter++}`,
          type: 'PUNCTUATION',
          value: char,
          line: lIdx + 1,
          column: i + 1
        });
        i++;
        continue;
      }

      // Unknown character fallback
      tokens.push({
        id: `t-${tokenIdCounter++}`,
        type: 'UNKNOWN',
        value: char,
        line: lIdx + 1,
        column: i + 1
      });
      i++;
    }

    // Add comments back as visible tokens so students can see they are scanned
    if (commentText) {
      tokens.push({
        id: `t-${tokenIdCounter++}`,
        type: 'COMMENT',
        value: commentText,
        line: lIdx + 1,
        column: commentCol + 1
      });
    }
  }

  return tokens;
}

// ==========================================
// 2. SYNTAX ANALYZER (PARSER)
// ==========================================

class TokenStream {
  private tokens: Token[];
  private index: number = 0;

  constructor(tokens: Token[]) {
    // Exclude comments and unknowns for main parsing process
    this.tokens = tokens.filter((t) => t.type !== 'COMMENT' && t.type !== 'UNKNOWN');
  }

  peek(): Token | null {
    if (this.index >= this.tokens.length) return null;
    return this.tokens[this.index];
  }

  next(): Token | null {
    if (this.index >= this.tokens.length) return null;
    return this.tokens[this.index++];
  }

  backup(count = 1) {
    this.index = Math.max(0, this.index - count);
  }

  consume(expectedType: TokenType, expectedValue?: string): Token | null {
    const t = this.peek();
    if (!t) return null;
    if (t.type !== expectedType) return null;
    if (expectedValue !== undefined && t.value !== expectedValue) return null;
    return this.next();
  }
}

/**
 * Parses binary expression using simple Recursive Descent.
 * High Precedence: Multiplicative (*, /, %)
 * Low Precedence: Additive (+, -)
 */
function parseExpression(stream: TokenStream): ASTNode {
  return parseAdditiveExpression(stream);
}

function parseAdditiveExpression(stream: TokenStream): ASTNode {
  let node = parseMultiplicativeExpression(stream);

  let next = stream.peek();
  while (next && next.type === 'OPERATOR' && ['+', '-'].includes(next.value)) {
    const opToken = stream.next()!;
    const right = parseMultiplicativeExpression(stream);
    const prevId = node.id;
    node = {
      type: 'BinaryExpression',
      id: getAstId('ast', opToken.line, opToken.column),
      operator: opToken.value,
      left: node,
      right: right,
      line: opToken.line
    };
    next = stream.peek();
  }

  return node;
}

function parseMultiplicativeExpression(stream: TokenStream): ASTNode {
  let node = parsePrimaryExpression(stream);

  let next = stream.peek();
  while (next && next.type === 'OPERATOR' && ['*', '/', '%'].includes(next.value)) {
    const opToken = stream.next()!;
    const right = parsePrimaryExpression(stream);
    node = {
      type: 'BinaryExpression',
      id: getAstId('ast', opToken.line, opToken.column),
      operator: opToken.value,
      left: node,
      right: right,
      line: opToken.line
    };
    next = stream.peek();
  }

  return node;
}

function parsePrimaryExpression(stream: TokenStream): ASTNode {
  const token = stream.peek();
  if (!token) {
    return {
      type: 'ErrorNode',
      id: getAstId('ast-err', 'eof', 0),
      errorMessage: 'Unexpected end of input expression'
    };
  }

  if (token.type === 'PAREN' && token.value === '(') {
    stream.next(); // Consume '('
    const innerNode = parseExpression(stream);
    const closing = stream.consume('PAREN', ')');
    if (!closing) {
      return {
        type: 'ErrorNode',
        id: getAstId('ast-err', token.line, token.column),
        errorMessage: "Missing matching closing parenthesis ')'",
        line: token.line
      };
    }
    return innerNode;
  }

  if (token.type === 'IDENTIFIER') {
    stream.next();
    return {
      type: 'Identifier',
      id: getAstId('ast', token.line, token.column),
      name: token.value,
      line: token.line
    };
  }

  if (token.type === 'NUMBER') {
    stream.next();
    const isFloat = token.value.includes('.');
    return {
      type: 'Literal',
      id: getAstId('ast', token.line, token.column),
      value: isFloat ? parseFloat(token.value) : parseInt(token.value, 10),
      dataType: isFloat ? 'float' : 'int',
      line: token.line
    };
  }

  if (token.type === 'STRING') {
    stream.next();
    return {
      type: 'Literal',
      id: getAstId('ast', token.line, token.column),
      value: token.value.replace(/^['"]|['"]$/g, ''),
      dataType: 'string',
      line: token.line
    };
  }

  if (token.type === 'KEYWORD' && ['true', 'false', 'True', 'False'].includes(token.value)) {
    stream.next();
    return {
      type: 'Literal',
      id: getAstId('ast', token.line, token.column),
      value: token.value.toLowerCase() === 'true',
      dataType: 'boolean',
      line: token.line
    };
  }

  stream.next();
  return {
    type: 'ErrorNode',
    id: getAstId('ast-err', token.line, token.column),
    errorMessage: `Unexpected token '${token.value}' in expression`,
    line: token.line
  };
}

export function parseProgram(tokens: Token[], language: string): ASTNode {
  astNodeIdCounter = 0;
  const stream = new TokenStream(tokens);
  const statements: ASTNode[] = [];

  while (stream.peek() !== null) {
    const token = stream.peek()!;

    // 1. VARIABLE DECLARATION / TYPE SPECS (JS: let/const/var, C: int/float, Const, Python: direct assigns)
    if (
      token.type === 'KEYWORD' &&
      ['let', 'const', 'var', 'int', 'float', 'double', 'char'].includes(token.value)
    ) {
      const decToken = stream.next()!; // Consume key
      let varType = decToken.value;

      // In C/C++, check for 'const int'
      let isConst = decToken.value === 'const';
      if (isConst) {
        const nextType = stream.peek();
        if (nextType && nextType.type === 'KEYWORD' && ['int', 'float', 'double', 'char'].includes(nextType.value)) {
          stream.next(); // Consume type specifier e.g 'int'
          varType = `const ${nextType.value}`;
        }
      }

      const idToken = stream.consume('IDENTIFIER');
      if (!idToken) {
        statements.push({
          type: 'ErrorNode',
          id: getAstId('ast-err', decToken.line, decToken.column),
          errorMessage: 'Expected identifier after type specifier',
          line: decToken.line
        });
        // Skip until next line or semicolon to recover
        while (stream.peek() && stream.peek()?.line === decToken.line) stream.next();
        continue;
      }

      // Check for assignment symbol '='
      const assignToken = stream.consume('ASSIGN', '=');
      if (assignToken) {
        const expr = parseExpression(stream);

        // Consume trailing semicolon
        stream.consume('PUNCTUATION', ';');

        statements.push({
          type: 'VariableDeclaration',
          id: getAstId('ast', decToken.line, decToken.column),
          name: idToken.value,
          dataType: varType.includes('int') ? 'int' : varType.includes('float') ? 'float' : 'unknown',
          left: {
            type: 'Identifier',
            id: getAstId('ast', idToken.line, idToken.column),
            name: idToken.value,
            line: idToken.line
          },
          right: expr,
          line: decToken.line
        });
      } else {
        // Declaration without direct assignment, e.g. 'int x;'
        stream.consume('PUNCTUATION', ';');
        statements.push({
          type: 'VariableDeclaration',
          id: getAstId('ast', decToken.line, decToken.column),
          name: idToken.value,
          dataType: varType,
          left: {
            type: 'Identifier',
            id: getAstId('ast', idToken.line, idToken.column),
            name: idToken.value,
            line: idToken.line
          },
          line: decToken.line
        });
      }
      continue;
    }

    // 2. IF STATEMENTS (if (test) { body } else { body })
    if (token.type === 'KEYWORD' && token.value === 'if') {
      const ifToken = stream.next()!; // Consume 'if'

      // Check for brackets in JS / C e.g., 'if (x > 10)'
      const hasParen = stream.consume('PAREN', '(') !== null;
      const testExpr = parseAdditiveExpression(stream); // e.g: x > 10

      // Let's check comparison operator
      let testFinal = testExpr;
      const maybeComp = stream.peek();
      if (maybeComp && maybeComp.type === 'COMPARISON') {
        const compTok = stream.next()!;
        const rightExpr = parseAdditiveExpression(stream);
        testFinal = {
          type: 'BinaryExpression',
          id: getAstId('ast', compTok.line, compTok.column),
          operator: compTok.value,
          left: testExpr,
          right: rightExpr,
          line: compTok.line
        };
      }

      if (hasParen) {
        const closingParen = stream.consume('PAREN', ')');
        if (!closingParen) {
          statements.push({
            type: 'ErrorNode',
            id: getAstId('ast-err', ifToken.line, 'paren-1'),
            errorMessage: 'Missing closing parenthesis after if condition',
            line: ifToken.line
          });
        }
      }

      // Python delimiter ':'
      stream.consume('PUNCTUATION', ':');

      // Parse the consequent block
      const consequentBlock: ASTNode[] = [];
      const hasBrace = stream.consume('BRACE', '{') !== null;

      if (hasBrace) {
        // Parse until ending brace
        while (stream.peek() && !(stream.peek()?.type === 'BRACE' && stream.peek()?.value === '}')) {
          // Parse statement recursively
          const nested = parseSingleStatement(stream, language);
          if (nested) consequentBlock.push(nested);
          else stream.next(); // avoid infinite loops
        }
        stream.consume('BRACE', '}');
      } else {
        // Single statement, or Python's indentation-based statements (simulated by line matching)
        // We parse statements on the same scope level or just the next line statement
        const nested = parseSingleStatement(stream, language);
        if (nested) consequentBlock.push(nested);
      }

      // Check for optional Else block
      const elseBlock: ASTNode[] = [];
      const maybeElse = stream.peek();
      if (maybeElse && maybeElse.type === 'KEYWORD' && maybeElse.value === 'else') {
        stream.next(); // Consume 'else'
        stream.consume('PUNCTUATION', ':'); // Python

        const elseHasBrace = stream.consume('BRACE', '{') !== null;
        if (elseHasBrace) {
          while (stream.peek() && !(stream.peek()?.type === 'BRACE' && stream.peek()?.value === '}')) {
            const nested = parseSingleStatement(stream, language);
            if (nested) elseBlock.push(nested);
            else stream.next();
          }
          stream.consume('BRACE', '}');
        } else {
          const nested = parseSingleStatement(stream, language);
          if (nested) elseBlock.push(nested);
        }
      }

      statements.push({
        type: 'IfStatement',
        id: getAstId('ast', ifToken.line, ifToken.column),
        test: testFinal,
        consequent: consequentBlock,
        alternate: elseBlock.length > 0 ? elseBlock : undefined,
        line: ifToken.line
      });
      continue;
    }

    // 3. REGULAR ASSIGNMENT (e.g. total = count * rate + 2;) OR STANDALONE EXPRESSION
    if (token.type === 'IDENTIFIER') {
      const idToken = stream.next()!;
      const assignToken = stream.peek();

      if (assignToken && (assignToken.type === 'ASSIGN')) {
        stream.next(); // Consume assignment
        const expr = parseExpression(stream);
        stream.consume('PUNCTUATION', ';');

        statements.push({
          type: 'Assignment',
          id: getAstId('ast', idToken.line, idToken.column),
          name: idToken.value,
          left: {
            type: 'Identifier',
            id: getAstId('ast', idToken.line, idToken.column),
            name: idToken.value,
            line: idToken.line
          },
          right: expr,
          line: idToken.line
        });
      } else {
        // Standalone identifier or expression, back up and parse
        stream.backup();
        const expr = parseExpression(stream);
        stream.consume('PUNCTUATION', ';');
        statements.push(expr);
      }
      continue;
    }

    // Fallback consume token
    const unhandled = stream.next();
    if (unhandled) {
      statements.push({
        type: 'ErrorNode',
        id: getAstId('ast-err', unhandled.line, unhandled.column),
        errorMessage: `Parsing failed: Unhandled compiler expression or statement syntax at symbol '${unhandled.value}'`,
        line: unhandled.line
      });
    }
  }

  return {
    type: 'Program',
    id: 'ast-root',
    consequent: statements
  };
}

/**
 * Parses a single statement within nested levels (like if-blocks)
 */
function parseSingleStatement(stream: TokenStream, language: string): ASTNode | null {
  const token = stream.peek();
  if (!token) return null;

  // Let's support variable declaration inside if-block
  if (
    token.type === 'KEYWORD' &&
    ['let', 'const', 'var', 'int', 'float', 'double', 'char'].includes(token.value)
  ) {
    const decToken = stream.next()!;
    let varType = decToken.value;
    const idToken = stream.consume('IDENTIFIER');
    if (!idToken) return null;

    const assignToken = stream.consume('ASSIGN', '=');
    if (assignToken) {
      const expr = parseExpression(stream);
      stream.consume('PUNCTUATION', ';');
      return {
        type: 'VariableDeclaration',
        id: getAstId('ast', decToken.line, decToken.column),
        name: idToken.value,
        dataType: varType.includes('int') ? 'int' : varType.includes('float') ? 'float' : 'unknown',
        left: {
          type: 'Identifier',
          id: getAstId('ast', idToken.line, idToken.column),
          name: idToken.value,
          line: idToken.line
        },
        right: expr,
        line: decToken.line
      };
    }
    stream.consume('PUNCTUATION', ';');
    return null;
  }

  if (token.type === 'IDENTIFIER') {
    const idToken = stream.next()!;
    const assignToken = stream.peek();

    if (assignToken && assignToken.type === 'ASSIGN') {
      stream.next(); // Consume '='
      const expr = parseExpression(stream);
      stream.consume('PUNCTUATION', ';');
      return {
        type: 'Assignment',
        id: getAstId('ast', idToken.line, idToken.column),
        name: idToken.value,
        left: {
          type: 'Identifier',
          id: getAstId('ast', idToken.line, idToken.column),
          name: idToken.value,
          line: idToken.line
        },
        right: expr,
        line: idToken.line
      };
    } else {
      stream.backup();
      const expr = parseExpression(stream);
      stream.consume('PUNCTUATION', ';');
      return expr;
    }
  }

  // Handle return or nested expr
  if (token.type === 'KEYWORD' && token.value === 'return') {
    const returnTok = stream.next()!;
    const expr = parseExpression(stream);
    stream.consume('PUNCTUATION', ';');
    return {
      type: 'Assignment', // Treat as returning assignment
      id: getAstId('ast', returnTok.line, returnTok.column),
      name: 'return_val',
      right: expr,
      line: returnTok.line
    };
  }

  // Skips unrecognized and moves stream forward
  stream.next();
  return null;
}

// ==========================================
// 3. SEMANTIC ANALYZER
// ==========================================

export function analyzeSemantics(ast: ASTNode, language: string): SemanticCheckResult {
  const errors: Array<{ line: number; message: string; severity: 'error' | 'warning' }> = [];
  const symbols: Map<string, SymbolTableEntry> = new Map();

  // Pre-populate compiler definitions or constant presets if wanted
  // Traverse AST
  const traverse = (node: ASTNode, scope: string = 'global') => {
    if (!node) return;

    if (node.type === 'Program' && node.consequent) {
      node.consequent.forEach((item) => traverse(item, scope));
    }

    else if (node.type === 'VariableDeclaration') {
      const name = node.name || '';
      const line = node.line || 0;
      const isConstVal = node.dataType?.includes('const') || node.dataType === 'const';

      if (symbols.has(name)) {
        errors.push({
          line,
          severity: 'error',
          message: `Semantic Error: Redeclaration of variable '${name}' within the current ${scope} scope (originally declared on line ${symbols.get(name)?.line}).`
        });
      } else {
        // Evaluate type based on expression
        let deducedType = 'number';
        let initialVal: any = undefined;

        if (node.right) {
          evaluateExpressionTypeAndValue(node.right, symbols, errors);
          if (node.right.type === 'Literal') {
            deducedType = node.right.dataType || 'number';
            initialVal = node.right.value;
          }
        }

        symbols.set(name, {
          name,
          type: deducedType,
          declarationType: isConstVal ? 'const' : 'let',
          scope,
          line,
          value: initialVal,
          isConstant: isConstVal,
          isMutated: false,
          references: 0
        });
      }

      if (node.right) {
        traverse(node.right, scope);
      }
    }

    else if (node.type === 'Assignment') {
      const name = node.name || '';
      const line = node.line || 0;

      if (!symbols.has(name)) {
        if (language === 'python') {
          // Implicit declaration in Python
          let initialVal: any = undefined;
          if (node.right && node.right.type === 'Literal') {
            initialVal = node.right.value;
          }
          symbols.set(name, {
            name,
            type: 'number',
            declarationType: 'implicit',
            scope,
            line,
            value: initialVal,
            isConstant: false,
            isMutated: true,
            references: 0
          });
        } else {
          // Warning/Error in statically scoped JS or C
          errors.push({
            line,
            severity: 'error',
            message: `Semantic Error: Assignment to undeclared variable '${name}'. All variables must be declared using 'let', 'const', or 'int' before use.`
          });
        }
      } else {
        const symbol = symbols.get(name)!;
        if (symbol.isConstant) {
          errors.push({
            line,
            severity: 'error',
            message: `Semantic Error: Reassignment to constant variable '${name}' is forbidden.`
          });
        }
        symbol.isMutated = true;
      }

      if (node.right) {
        traverse(node.right, scope);
      }
    }

    else if (node.type === 'Identifier') {
      const name = node.name || '';
      const line = node.line || 0;

      if (!symbols.has(name)) {
        errors.push({
          line,
          severity: 'error',
          message: `Semantic Error: Variable '${name}' is read but not declared anywhere in scope.`
        });
      } else {
        const sym = symbols.get(name)!;
        sym.references++;
      }
    }

    else if (node.type === 'BinaryExpression') {
      if (node.left) traverse(node.left, scope);
      if (node.right) traverse(node.right, scope);

      // Perform type check for operators
      if (node.left && node.right) {
        const typeL = getExpressionType(node.left, symbols);
        const typeR = getExpressionType(node.right, symbols);
        
        if (typeL !== 'unknown' && typeR !== 'unknown' && typeL !== typeR) {
          errors.push({
            line: node.line || 0,
            severity: 'warning',
            message: `Type Warning: Implicit conversion between left operand type (${typeL}) and right operand type (${typeR}) for operation '${node.operator}'.`
          });
        }
      }
    }

    else if (node.type === 'IfStatement') {
      if (node.test) traverse(node.test, scope);
      if (node.consequent) {
        node.consequent.forEach((child) => traverse(child, 'if-block'));
      }
      if (node.alternate) {
        node.alternate.forEach((child) => traverse(child, 'else-block'));
      }
    }

    else if (node.type === 'ErrorNode') {
      errors.push({
        line: node.line || 0,
        severity: 'error',
        message: node.errorMessage || 'Parsing structural syntax error.'
      });
    }
  };

  traverse(ast);

  // Catch unused variables and add warning flags
  symbols.forEach((sym) => {
    if (sym.references === 0 && sym.name !== 'return_val') {
      errors.push({
        line: sym.line,
        severity: 'warning',
        message: `Optimization Advisory: Declared variable '${sym.name}' is never read or referenced. It can be safely removed by the dead code pruning pass.`
      });
    }
  });

  return {
    passed: !errors.some((e) => e.severity === 'error'),
    errors,
    symbolTable: Array.from(symbols.values())
  };
}

function getExpressionType(node: ASTNode, symbols: Map<string, SymbolTableEntry>): string {
  if (node.type === 'Literal') {
    return node.dataType || 'number';
  }
  if (node.type === 'Identifier') {
    const sym = symbols.get(node.name || '');
    return sym ? sym.type : 'unknown';
  }
  if (node.type === 'BinaryExpression') {
    if (['>', '<', '==', '!=', '<=', '>='].includes(node.operator || '')) {
      return 'boolean';
    }
    // Deep solve
    return 'number';
  }
  return 'unknown';
}

function evaluateExpressionTypeAndValue(
  node: ASTNode,
  symbols: Map<string, SymbolTableEntry>,
  errors: any[]
): any {
  if (node.type === 'Literal') return node.value;
  if (node.type === 'Identifier') {
    const sym = symbols.get(node.name || '');
    return sym ? sym.value : undefined;
  }
  if (node.type === 'BinaryExpression' && node.left && node.right) {
    const lVal = evaluateExpressionTypeAndValue(node.left, symbols, errors);
    const rVal = evaluateExpressionTypeAndValue(node.right, symbols, errors);

    if (lVal !== undefined && rVal !== undefined) {
      switch (node.operator) {
        case '+': return lVal + rVal;
        case '-': return lVal - rVal;
        case '*': return lVal * rVal;
        case '/': return rVal !== 0 ? lVal / rVal : 0;
        case '>': return lVal > rVal;
        case '<': return lVal < rVal;
        case '==': return lVal === rVal;
        default: return undefined;
      }
    }
  }
  return undefined;
}

// ==========================================
// 4. INTERMEDIATE CODE GENERATOR (TAC)
// ==========================================

export function generateIntermediateCode(ast: ASTNode): TACInstruction[] {
  const instructions: TACInstruction[] = [];
  let tempCounter = 0;
  let labelCounter = 1;

  const nextTemp = (): string => `t${tempCounter++}`;
  const nextLabel = (): string => `L${labelCounter++}`;

  const traverseExpr = (exprNode: ASTNode): string => {
    if (exprNode.type === 'Literal') {
      return exprNode.value?.toString() ?? '0';
    }
    if (exprNode.type === 'Identifier') {
      return exprNode.name || '';
    }
    if (exprNode.type === 'BinaryExpression' && exprNode.left && exprNode.right) {
      const isCompar = ['>', '<', '==', '!=', '<=', '>='].includes(exprNode.operator || '');
      const leftTemp = traverseExpr(exprNode.left);
      const rightTemp = traverseExpr(exprNode.right);
      const tmp = nextTemp();

      instructions.push({
        id: `tac-${Math.random()}`,
        op: exprNode.operator,
        arg1: leftTemp,
        arg2: rightTemp,
        result: tmp,
        annotation: isCompar 
          ? `Compare operation: Evaluate if '${leftTemp}' ${exprNode.operator} '${rightTemp}' and store result in ${tmp}`
          : `Arithmetic operation: Compute '${leftTemp} ${exprNode.operator} ${rightTemp}' and store temporary in ${tmp}`
      });

      return tmp;
    }
    return '0';
  };

  const traverseStatement = (stmt: ASTNode) => {
    if (!stmt) return;

    if (stmt.type === 'VariableDeclaration') {
      if (stmt.right) {
        const rhsTemp = traverseExpr(stmt.right);
        instructions.push({
          id: `tac-${Math.random()}`,
          op: '=',
          arg1: rhsTemp,
          result: stmt.name,
          annotation: `Initialize variable: Assign initial computed value '${rhsTemp}' to local storage '${stmt.name}'`
        });
      } else {
        instructions.push({
          id: `tac-${Math.random()}`,
          op: 'declare',
          arg1: stmt.dataType,
          result: stmt.name,
          annotation: `Declare uninitialized variable: Allocate memory slot for '${stmt.name}' of type '${stmt.dataType}'`
        });
      }
    }

    else if (stmt.type === 'Assignment') {
      if (stmt.right) {
        const rhsTemp = traverseExpr(stmt.right);
        instructions.push({
          id: `tac-${Math.random()}`,
          op: '=',
          arg1: rhsTemp,
          result: stmt.name,
          annotation: `Store statement: Update variable '${stmt.name}' value with expression result [${rhsTemp}]`
        });
      }
    }

    else if (stmt.type === 'IfStatement') {
      // 1. Evaluate condition
      const condResult = stmt.test ? traverseExpr(stmt.test) : 'true';
      const falseLabel = nextLabel();

      // 2. Branch instruction if false
      instructions.push({
        id: `tac-${Math.random()}`,
        op: 'iffalse',
        arg1: condResult,
        result: falseLabel,
        annotation: `Conditional jump: If condition [${condResult}] is False, skip if-body and branch to label ${falseLabel}`
      });

      // 3. Consequent block
      if (stmt.consequent) {
        stmt.consequent.forEach((blockStmt) => traverseStatement(blockStmt));
      }

      // 4. Label boundary
      instructions.push({
        id: `tac-${Math.random()}`,
        op: 'label',
        result: falseLabel,
        annotation: `Label marker: End of conditional 'if' branch target code block`
      });
    }
  };

  if (ast.type === 'Program' && ast.consequent) {
    ast.consequent.forEach((stmt) => traverseStatement(stmt));
  }

  return instructions;
}

// ==========================================
// 5. CODE OPTIMIZER
// ==========================================

export function optimizeIntermediateCode(
  tac: TACInstruction[]
): { optimized: TACInstruction[]; steps: OptimizationStep[] } {
  const steps: OptimizationStep[] = [];
  let currentTac = JSON.parse(JSON.stringify(tac)) as TACInstruction[];

  // 1. CONSTANT POOLING & CONSTANT FOLDING
  // Scan for instructions like: result = arg1 op arg2 where arg1 and arg2 are fully numbers
  let foldFound = true;
  while (foldFound) {
    foldFound = false;
    for (let i = 0; i < currentTac.length; i++) {
      const inst = currentTac[i];
      if (inst.op && ['+', '-', '*', '/'].includes(inst.op) && inst.arg1 && inst.arg2 && inst.result) {
        const isNum1 = /^-?\d+(\.\d+)?$/.test(inst.arg1);
        const isNum2 = /^-?\d+(\.\d+)?$/.test(inst.arg2);

        if (isNum1 && isNum2) {
          const n1 = parseFloat(inst.arg1);
          const n2 = parseFloat(inst.arg2);
          let foldVal = 0;

          if (inst.op === '+') foldVal = n1 + n2;
          else if (inst.op === '-') foldVal = n1 - n2;
          else if (inst.op === '*') foldVal = n1 * n2;
          else if (inst.op === '/' && n2 !== 0) foldVal = n1 / n2;

          const beforeText = `${inst.result} = ${inst.arg1} ${inst.op} ${inst.arg2}`;
          const afterText = `${inst.result} = ${foldVal}`;
          
          steps.push({
            type: 'Constant Folding',
            before: beforeText,
            after: afterText,
            explanation: `Pitched-calculation folded: Resolved compile-time numeric operation '${inst.arg1} ${inst.op} ${inst.arg2}' into static literal '${foldVal}' directly saving CPU cycle checks.`
          });

          // Convert instruction into constant assignment
          inst.op = '=';
          inst.arg1 = foldVal.toString();
          inst.arg2 = undefined;
          inst.annotation = `Optimized constant folded initialization: Assigned compiled static folded total '${foldVal}'`;
          foldFound = true;
        }
      }
    }
  }

  // 2. CONSTANT PROPAGATION
  // Track constants stored in variables or temporaries that never change
  // Replace references with static folded totals!
  const varConstants: Map<string, string> = new Map();
  const modifiedVars: Set<string> = new Set();

  // Find variables/temporaries mutated during the loop
  currentTac.forEach((inst) => {
    // If a non-temporary variable is assigned more than once, note it as mutated
    if (inst.op === '=' && inst.result && !inst.result.startsWith('t')) {
      if (varConstants.has(inst.result)) {
        modifiedVars.add(inst.result);
      } else {
        varConstants.set(inst.result, inst.arg1 || '0');
      }
    }
  });

  // Keep track of final immutable map
  const finalConstants: Map<string, string> = new Map();
  currentTac.forEach((inst) => {
    if (inst.op === '=' && inst.result && inst.arg1) {
      const isValLiteral = /^-?\d+(\.\d+)?$/.test(inst.arg1);
      if (isValLiteral && !modifiedVars.has(inst.result)) {
        finalConstants.set(inst.result, inst.arg1);
      }
    }
  });

  // Perform substitution
  let propFound = false;
  for (let i = 0; i < currentTac.length; i++) {
    const inst = currentTac[i];

    // Don't replace the constant's own assignment definition
    const skipResultCheck = inst.result;

    if (inst.arg1 && finalConstants.has(inst.arg1) && inst.arg1 !== skipResultCheck) {
      const repl = finalConstants.get(inst.arg1)!;
      const before = `${inst.result || ''} = ${inst.arg1} ${inst.op || ''} ${inst.arg2 || ''}`;
      
      inst.arg1 = repl;
      propFound = true;

      const after = `${inst.result || ''} = ${inst.arg1} ${inst.op || ''} ${inst.arg2 || ''}`;
      steps.push({
        type: 'Constant Propagation',
        before,
        after,
        explanation: `Substitute constant: Propagated immutable visual constant variable '${skipResultCheck}' binding value of '${repl}' directly into downstream equation.`
      });
    }

    if (inst.arg2 && finalConstants.has(inst.arg2)) {
      const repl = finalConstants.get(inst.arg2)!;
      const before = `${inst.result || ''} = ${inst.arg1 || ''} ${inst.op || ''} ${inst.arg2}`;
      
      inst.arg2 = repl;
      propFound = true;

      const after = `${inst.result || ''} = ${inst.arg1 || ''} ${inst.op || ''} ${inst.arg2}`;
      steps.push({
        type: 'Constant Propagation',
        before,
        after,
        explanation: `Substitute constant: Propagated constant operand value of '${repl}' directly to replace referenced identifier '${inst.arg2}' inside expression.`
      });
    }
  }

  // Re-run Constant Folding on propagated constants
  foldFound = true;
  while (foldFound) {
    foldFound = false;
    for (let i = 0; i < currentTac.length; i++) {
      const inst = currentTac[i];
      if (inst.op && ['+', '-', '*', '/'].includes(inst.op) && inst.arg1 && inst.arg2 && inst.result) {
        const isNum1 = /^-?\d+(\.\d+)?$/.test(inst.arg1);
        const isNum2 = /^-?\d+(\.\d+)?$/.test(inst.arg2);

        if (isNum1 && isNum2) {
          const n1 = parseFloat(inst.arg1);
          const n2 = parseFloat(inst.arg2);
          let foldVal = 0;

          if (inst.op === '+') foldVal = n1 + n2;
          else if (inst.op === '-') foldVal = n1 - n2;
          else if (inst.op === '*') foldVal = n1 * n2;
          else if (inst.op === '/' && n2 !== 0) foldVal = n1 / n2;

          const beforeText = `${inst.result} = ${inst.arg1} ${inst.op} ${inst.arg2}`;
          const afterText = `${inst.result} = ${foldVal}`;
          
          steps.push({
            type: 'Constant Folding (Post-Propagation)',
            before: beforeText,
            after: afterText,
            explanation: `Folded secondary math block: Solved nested equation '${inst.arg1} ${inst.op} ${inst.arg2}' into '${foldVal}' after substituting propagated constant symbols.`
          });

          inst.op = '=';
          inst.arg1 = foldVal.toString();
          inst.arg2 = undefined;
          inst.annotation = `Post-propagation folded static: Assigned calculated static visual ${foldVal}`;
          foldFound = true;
        }
      }
    }
  }

  // 3. DEAD CODE STORAGE ELIMINATION
  // If we assigned a temporary 'tX' but it's never requested or used in succeeding nodes, drop it
  const referencedTemps: Set<string> = new Set();
  currentTac.forEach((inst) => {
    // Collect reading references
    if (inst.op !== 'iffalse' && inst.arg1 && inst.arg1.startsWith('t')) {
      referencedTemps.add(inst.arg1);
    }
    if (inst.arg2 && inst.arg2.startsWith('t')) {
      referencedTemps.add(inst.arg2);
    }
    if (inst.op === 'iffalse' && inst.arg1 && inst.arg1.startsWith('t')) {
       referencedTemps.add(inst.arg1);
    }
  });

  const liveTac: TACInstruction[] = [];
  currentTac.forEach((inst) => {
    if (inst.result && inst.result.startsWith('t') && inst.op === '=' && !referencedTemps.has(inst.result)) {
      steps.push({
        type: 'Dead Code Elimination',
        before: `${inst.result} = ${inst.arg1 || '0'}`,
        after: `(Pruned / Deleted)`,
        explanation: `Pruned dead code: Removed unused compiler temporary registry instruction assigning to '${inst.result}', reducing active visual cache overhead.`
      });
    } else {
      liveTac.push(inst);
    }
  });

  return {
    optimized: liveTac,
    steps
  };
}

// ==========================================
// 6. TARGET CODE GENERATOR (ASSEMBLY)
// ==========================================

export function generateAssembly(optimizedTac: TACInstruction[]): AssemblyLine[] {
  const assembly: AssemblyLine[] = [];

  // Start segment headers
  assembly.push({
    comment: '---------------------------------------------------'
  });
  assembly.push({
    comment: ' Intel x86-64 Target Assembly Generated Dynamically'
  });
  assembly.push({
    comment: '---------------------------------------------------'
  });
  assembly.push({
    instruction: '.intel_syntax noprefix'
  });
  assembly.push({
    instruction: '.global main'
  });
  assembly.push({
    instruction: '.data'
  });

  // Find and register storage symbols
  const variables: Set<string> = new Set();
  optimizedTac.forEach((inst) => {
    if (inst.result && !inst.result.startsWith('t') && inst.op !== 'label') {
      variables.add(inst.result);
    }
    if (inst.arg1 && !inst.arg1.startsWith('t') && isNaN(Number(inst.arg1)) && inst.op !== 'iffalse' && inst.op !== 'label') {
      variables.add(inst.arg1);
    }
  });

  variables.delete('return_val');

  variables.forEach((variable) => {
    assembly.push({
      label: variable,
      instruction: '.dd',
      operands: '0',
      comment: `Reserve 32-bit (double word) size in RAM initialization`
    });
  });

  assembly.push({
    instruction: '.text'
  });
  assembly.push({
    label: 'main',
    comment: 'Function main entry point'
  });

  // Stack frame prologue
  assembly.push({
    instruction: 'push',
    operands: 'rbp',
    comment: 'Save base pointer register to call stack'
  });
  assembly.push({
    instruction: 'mov',
    operands: 'rbp, rsp',
    comment: 'Align stack frame base pointer'
  });

  // Simple compiler register allocator (assigning temp registers rax, rbx, rcx, rdx)
  const tempToReg: Map<string, string> = new Map();
  const availableRegs = ['eax', 'ebx', 'ecx', 'edx'];
  let regIndex = 0;

  const getRegister = (tempSymbol: string): string => {
    if (tempToReg.has(tempSymbol)) {
      return tempToReg.get(tempSymbol)!;
    }
    const reg = availableRegs[regIndex % availableRegs.length];
    regIndex++;
    tempToReg.set(tempSymbol, reg);
    return reg;
  };

  optimizedTac.forEach((inst) => {
    if (!inst.op) return;

    // Assignment operation (=)
    if (inst.op === '=') {
      const isNum = !isNaN(Number(inst.arg1));
      
      if (inst.result && inst.result.startsWith('t')) {
        // Assign to registers
        const reg = getRegister(inst.result);
        if (isNum) {
          assembly.push({
            instruction: 'mov',
            operands: `${reg}, ${inst.arg1}`,
            comment: `Load numerical immediate literal value ${inst.arg1} into register ${reg}`
          });
        } else {
          // Arg1 is a memory variable
          assembly.push({
            instruction: 'mov',
            operands: `${reg}, [${inst.arg1}]`,
            comment: `Copy value from memory [${inst.arg1}] into auxiliary register ${reg}`
          });
        }
      } else {
        // Assigning to a user variable in data scope
        if (isNum) {
          assembly.push({
            instruction: 'mov',
            operands: `DWORD PTR [${inst.result}], ${inst.arg1}`,
            comment: `Directly store literal ${inst.arg1} into RAM memory address [${inst.result}]`
          });
        } else {
          // Arg1 is a register or another variable
          const source = inst.arg1?.startsWith('t') ? getRegister(inst.arg1) : `DWORD PTR [${inst.arg1}]`;
          
          if (inst.arg1?.startsWith('t')) {
            assembly.push({
              instruction: 'mov',
              operands: `[${inst.result}], ${source}`,
              comment: `Move computed register content ${source} to static target RAM variable [${inst.result}]`
            });
          } else {
            // Memory to memory transfer requires register mediator
            assembly.push({
              instruction: 'mov',
              operands: `eax, [${inst.arg1}]`,
              comment: `Stage memory value [${inst.arg1}] into temporary register eax`
            });
            assembly.push({
              instruction: 'mov',
              operands: `[${inst.result}], eax`,
              comment: `Verify store target: move staged eax register to [${inst.result}]`
            });
          }
        }
      }
    }

    // Mathematical Operations
    else if (['+', '-', '*'].includes(inst.op)) {
      const destReg = getRegister(inst.result!);
      const isArg1Num = !isNaN(Number(inst.arg1));
      const isArg2Num = !isNaN(Number(inst.arg2));

      // 1. Move left operand to register
      if (isArg1Num) {
        assembly.push({
          instruction: 'mov',
          operands: `${destReg}, ${inst.arg1}`,
          comment: `Load immediate left calculation value ${inst.arg1} into assembly register ${destReg}`
        });
      } else {
        const sourceVal = inst.arg1?.startsWith('t') ? getRegister(inst.arg1) : `[${inst.arg1}]`;
        assembly.push({
          instruction: 'mov',
          operands: `${destReg}, ${sourceVal}`,
          comment: `Load operand variable '${inst.arg1}' into execution register ${destReg}`
        });
      }

      // 2. Perform math operator
      const rightOperand = isArg2Num 
        ? inst.arg2 
        : (inst.arg2?.startsWith('t') ? getRegister(inst.arg2) : `[${inst.arg2}]`);

      if (inst.op === '+') {
        assembly.push({
          instruction: 'add',
          operands: `${destReg}, ${rightOperand}`,
          comment: `Add value [${rightOperand}] to calculation register ${destReg}`
        });
      } else if (inst.op === '-') {
        assembly.push({
          instruction: 'sub',
          operands: `${destReg}, ${rightOperand}`,
          comment: `Subtract value [${rightOperand}] from calculation register ${destReg}`
        });
      } else if (inst.op === '*') {
        if (isArg2Num) {
          assembly.push({
            instruction: 'imul',
            operands: `${destReg}, ${destReg}, ${rightOperand}`,
            comment: `Multiply contents of ${destReg} with literal ${rightOperand}`
          });
        } else {
          assembly.push({
            instruction: 'imul',
            operands: `${destReg}, ${rightOperand}`,
            comment: `Intel integer multiply: scale ${destReg} by memory reference [${rightOperand}]`
          });
        }
      }
    }

    // Comparison Block
    else if (['>', '<', '==', '!=', '<=', '>='].includes(inst.op)) {
      const destReg = getRegister(inst.result!);
      const isArg1Num = !isNaN(Number(inst.arg1));
      const isArg2Num = !isNaN(Number(inst.arg2));

      const leftVal = isArg1Num ? inst.arg1 : (inst.arg1?.startsWith('t') ? getRegister(inst.arg1) : `[${inst.arg1}]`);
      const rightVal = isArg2Num ? inst.arg2 : (inst.arg2?.startsWith('t') ? getRegister(inst.arg2) : `[${inst.arg2}]`);

      // We need a register for cmp if leftVal is memory address
      let cmpLeft = leftVal;
      if (!inst.arg1?.startsWith('t') && !isArg1Num) {
        assembly.push({
          instruction: 'mov',
          operands: `esi, [${inst.arg1}]`,
          comment: `Prepare memory operand for logic compare comparison`
        });
        cmpLeft = 'esi';
      }

      assembly.push({
        instruction: 'cmp',
        operands: `${cmpLeft}, ${rightVal}`,
        comment: `CPU comparison instruction: subtraction evaluation check of operands ${cmpLeft} vs ${rightVal}`
      });

      // Set boolean result according to conditional instruction flags
      let setInstr = 'sete';
      if (inst.op === '>') setInstr = 'setg';
      else if (inst.op === '<') setInstr = 'setl';
      else if (inst.op === '!=') setInstr = 'setne';
      else if (inst.op === '<=') setInstr = 'setle';
      else if (inst.op === '>=') setInstr = 'setge';

      // Zero-extend register first to clear higher bytes
      assembly.push({
        instruction: 'xor',
        operands: `${destReg}, ${destReg}`,
        comment: `Reset destination register ${destReg} bits for boolean result`
      });

      // Low 8-bit registers corresponding to the dest regs
      const byteReg = destReg === 'eax' ? 'al' : (destReg === 'ebx' ? 'bl' : (destReg === 'ecx' ? 'cl' : 'dl'));
      assembly.push({
        instruction: setInstr,
        operands: byteReg,
        comment: `Set lower 8-bit register byte [${byteReg}] to true (1) if logical condition met`
      });
    }

    // Conditional branches check
    else if (inst.op === 'iffalse') {
      const condReg = getRegister(inst.arg1!);
      assembly.push({
        instruction: 'test',
        operands: `${condReg}, ${condReg}`,
        comment: `Perform logical AND block test of ${condReg} variable value`
      });
      assembly.push({
        instruction: 'jz',
        operands: inst.result,
        comment: `Jump if zero (False result flag): Skip execution to alternate section '${inst.result}'`
      });
    }

    // Label declaration
    else if (inst.op === 'label') {
      assembly.push({
        label: inst.result,
        comment: `Assembly jump reference label boundary marker`
      });
    }
  });

  // Stack frame cleanup register pop
  assembly.push({
    instruction: 'mov',
    operands: 'eax, 0',
    comment: 'Return static success 0 exit status code'
  });
  assembly.push({
    instruction: 'mov',
    operands: 'rsp, rbp',
    comment: 'Destroy standard stack frame variables bounds'
  });
  assembly.push({
    instruction: 'pop',
    operands: 'rbp',
    comment: 'Restore stack pointer memory'
  });
  assembly.push({
    instruction: 'ret',
    comment: 'Return command return control pointer to parent OS program'
  });

  return assembly;
}

// ==========================================
// ORCHESTRATION PIPELINE
// ==========================================

export function compileCodePipeline(code: string, language: string): CompilerResult {
  const tokens = tokenize(code, language);
  const ast = parseProgram(tokens, language);
  const semantic = analyzeSemantics(ast, language);
  const tac = generateIntermediateCode(ast);
  const { optimized, steps: optimizations } = optimizeIntermediateCode(tac);
  const assembly = generateAssembly(optimized);

  return {
    tokens,
    ast,
    semantic,
    tac,
    optimizedTac: optimized,
    optimizations,
    assembly
  };
}
