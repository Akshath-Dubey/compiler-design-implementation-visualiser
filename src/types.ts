/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'OPERATOR'
  | 'COMPARISON'
  | 'ASSIGN'
  | 'PUNCTUATION'
  | 'PAREN'
  | 'BRACE'
  | 'COMMENT'
  | 'UNKNOWN';

export interface Token {
  id: string;
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export type ASTNodeType =
  | 'Program'
  | 'VariableDeclaration'
  | 'Assignment'
  | 'BinaryExpression'
  | 'IfStatement'
  | 'Identifier'
  | 'Literal'
  | 'ErrorNode';

export interface ASTNode {
  type: ASTNodeType;
  id: string;
  name?: string;
  value?: any;
  operator?: string;
  dataType?: string; // e.g. 'int', 'float', 'string', 'boolean'
  left?: ASTNode;
  right?: ASTNode;
  test?: ASTNode;
  consequent?: ASTNode[];
  alternate?: ASTNode[];
  line?: number;
  errorMessage?: string;
}

export interface SymbolTableEntry {
  name: string;
  type: string; // 'number' | 'string' | 'boolean' | 'unknown'
  declarationType: 'let' | 'const' | 'var' | 'int' | 'float' | 'implicit';
  scope: string; // 'global' | 'if-block'
  line: number;
  value?: any;
  isConstant: boolean;
  isMutated: boolean;
  references: number;
}

export interface SemanticCheckResult {
  passed: boolean;
  errors: Array<{ line: number; message: string; severity: 'error' | 'warning' }>;
  symbolTable: SymbolTableEntry[];
}

export interface TACInstruction {
  id: string;
  op?: string;          // e.g. '+', '*', '=', 'goto', 'ifFalse'
  arg1?: string;        // first operand or identifier
  arg2?: string;        // second operand
  result?: string;      // result variable / temporary or label
  annotation?: string;  // description of the compiler step
}

export interface OptimizationStep {
  type: string;        // e.g., "Constant Folding", "Dead Code Elimination", "Algebraic Simplification"
  before: string;
  after: string;
  explanation: string;
}

export interface AssemblyLine {
  label?: string;
  instruction?: string;
  operands?: string;
  comment?: string;
}

export interface CompilerResult {
  tokens: Token[];
  ast: ASTNode;
  semantic: SemanticCheckResult;
  tac: TACInstruction[];
  optimizedTac: TACInstruction[];
  optimizations: OptimizationStep[];
  assembly: AssemblyLine[];
}

export const LANGUAGE_EXAMPLES: Record<string, string> = {
  javascript: `// A simple budget calculation
let total = 0;
let rate = 15;
const count = 5;

if (rate > 10) {
  total = count * rate + 2;
}`,
  python: `# A simple budget calculation
total = 0
rate = 15
count = 5

if rate > 10:
    total = count * rate + 2`,
  c: `// A simple budget calculation
int total = 0;
int rate = 15;
const int count = 5;

if (rate > 10) {
    total = count * rate + 2;
}`
};
