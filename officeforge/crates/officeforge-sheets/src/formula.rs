use serde::{Deserialize, Serialize};

/// A parsed formula expression (AST node).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum FormulaExpr {
    /// Numeric literal
    Number(f64),
    /// String literal
    Text(String),
    /// Boolean literal
    Boolean(bool),
    /// Cell reference
    CellRef {
        col: u32,
        row: u32,
        abs_col: bool,
        abs_row: bool,
    },
    /// Range reference like A1:B10
    Range {
        start: Box<FormulaExpr>,
        end: Box<FormulaExpr>,
    },
    /// Binary operation
    BinaryOp {
        op: BinaryOp,
        left: Box<FormulaExpr>,
        right: Box<FormulaExpr>,
    },
    /// Unary negation
    Negate(Box<FormulaExpr>),
    /// Function call
    FunctionCall {
        name: String,
        args: Vec<FormulaExpr>,
    },
    /// Parenthesized expression
    Paren(Box<FormulaExpr>),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BinaryOp {
    Add,
    Sub,
    Mul,
    Div,
    Pow,
    Eq,
    NotEq,
    Lt,
    LtEq,
    Gt,
    GtEq,
    Concat,
}

/// Parse a formula string (without leading '=') into an AST.
pub fn parse_formula(input: &str) -> Result<FormulaExpr, String> {
    let tokens = tokenize(input)?;
    let mut parser = Parser::new(&tokens);
    let expr = parser.parse_expression()?;
    if parser.pos < tokens.len() {
        return Err(format!("Unexpected token: {:?}", tokens[parser.pos]));
    }
    Ok(expr)
}

// --- Tokenizer ---

#[derive(Debug, Clone, PartialEq)]
enum Token {
    Number(f64),
    Text(String),
    Ident(String),
    CellRef { col: String, row: String, abs_col: bool, abs_row: bool },
    Plus,
    Minus,
    Star,
    Slash,
    Caret,
    Ampersand,
    Eq,
    NotEq,
    Lt,
    LtEq,
    Gt,
    GtEq,
    LParen,
    RParen,
    Comma,
    Colon,
    Bool(bool),
}

fn tokenize(input: &str) -> Result<Vec<Token>, String> {
    let mut tokens = Vec::new();
    let chars: Vec<char> = input.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        match chars[i] {
            ' ' | '\t' => { i += 1; }
            '+' => { tokens.push(Token::Plus); i += 1; }
            '-' => { tokens.push(Token::Minus); i += 1; }
            '*' => { tokens.push(Token::Star); i += 1; }
            '/' => { tokens.push(Token::Slash); i += 1; }
            '^' => { tokens.push(Token::Caret); i += 1; }
            '&' => { tokens.push(Token::Ampersand); i += 1; }
            '=' => { tokens.push(Token::Eq); i += 1; }
            '<' => {
                if i + 1 < chars.len() && chars[i + 1] == '=' {
                    tokens.push(Token::LtEq); i += 2;
                } else if i + 1 < chars.len() && chars[i + 1] == '>' {
                    tokens.push(Token::NotEq); i += 2;
                } else {
                    tokens.push(Token::Lt); i += 1;
                }
            }
            '>' => {
                if i + 1 < chars.len() && chars[i + 1] == '=' {
                    tokens.push(Token::GtEq); i += 2;
                } else {
                    tokens.push(Token::Gt); i += 1;
                }
            }
            '(' => { tokens.push(Token::LParen); i += 1; }
            ')' => { tokens.push(Token::RParen); i += 1; }
            ',' => { tokens.push(Token::Comma); i += 1; }
            ':' => { tokens.push(Token::Colon); i += 1; }
            '"' => {
                i += 1;
                let mut s = String::new();
                while i < chars.len() && chars[i] != '"' {
                    s.push(chars[i]);
                    i += 1;
                }
                if i < chars.len() && chars[i] == '"' {
                    i += 1;
                }
                tokens.push(Token::Text(s));
            }
            c if c == '$' || c.is_ascii_alphabetic() => {
                // Could be a cell reference, function name, or TRUE/FALSE
                let start = i;
                let mut abs_col = false;
                let mut abs_row = false;

                if chars[i] == '$' {
                    abs_col = true;
                    i += 1;
                }

                let col_start = i;
                while i < chars.len() && chars[i].is_ascii_alphabetic() {
                    i += 1;
                }
                let letters = &input[col_start..i];

                if i < chars.len() && chars[i] == '$' {
                    abs_row = true;
                    i += 1;
                }

                let row_start = i;
                while i < chars.len() && chars[i].is_ascii_digit() {
                    i += 1;
                }
                let digits = &input[row_start..i];

                if !digits.is_empty() && !letters.is_empty() {
                    // This is a cell reference
                    tokens.push(Token::CellRef {
                        col: letters.to_uppercase(),
                        row: digits.to_string(),
                        abs_col,
                        abs_row,
                    });
                } else if !letters.is_empty() {
                    let upper = letters.to_uppercase();
                    match upper.as_str() {
                        "TRUE" => tokens.push(Token::Bool(true)),
                        "FALSE" => tokens.push(Token::Bool(false)),
                        _ => tokens.push(Token::Ident(upper)),
                    }
                } else {
                    return Err(format!("Unexpected character at position {start}"));
                }
            }
            c if c.is_ascii_digit() || c == '.' => {
                let start = i;
                while i < chars.len() && (chars[i].is_ascii_digit() || chars[i] == '.') {
                    i += 1;
                }
                let num_str = &input[start..i];
                let n: f64 = num_str.parse().map_err(|_| format!("Invalid number: {num_str}"))?;
                tokens.push(Token::Number(n));
            }
            c => return Err(format!("Unexpected character: '{c}'")),
        }
    }
    Ok(tokens)
}

// --- Parser ---

struct Parser<'a> {
    tokens: &'a [Token],
    pos: usize,
}

impl<'a> Parser<'a> {
    fn new(tokens: &'a [Token]) -> Self {
        Self { tokens, pos: 0 }
    }

    fn peek(&self) -> Option<&Token> {
        self.tokens.get(self.pos)
    }

    fn advance(&mut self) -> Option<&Token> {
        let tok = self.tokens.get(self.pos);
        self.pos += 1;
        tok
    }

    fn expect(&mut self, expected: &Token) -> Result<(), String> {
        match self.advance() {
            Some(tok) if tok == expected => Ok(()),
            Some(tok) => Err(format!("Expected {expected:?}, got {tok:?}")),
            None => Err(format!("Expected {expected:?}, got end of input")),
        }
    }

    fn parse_expression(&mut self) -> Result<FormulaExpr, String> {
        self.parse_comparison()
    }

    fn parse_comparison(&mut self) -> Result<FormulaExpr, String> {
        let mut left = self.parse_concat()?;
        loop {
            let op = match self.peek() {
                Some(Token::Eq) => BinaryOp::Eq,
                Some(Token::NotEq) => BinaryOp::NotEq,
                Some(Token::Lt) => BinaryOp::Lt,
                Some(Token::LtEq) => BinaryOp::LtEq,
                Some(Token::Gt) => BinaryOp::Gt,
                Some(Token::GtEq) => BinaryOp::GtEq,
                _ => break,
            };
            self.advance();
            let right = self.parse_concat()?;
            left = FormulaExpr::BinaryOp {
                op,
                left: Box::new(left),
                right: Box::new(right),
            };
        }
        Ok(left)
    }

    fn parse_concat(&mut self) -> Result<FormulaExpr, String> {
        let mut left = self.parse_additive()?;
        while let Some(Token::Ampersand) = self.peek() {
            self.advance();
            let right = self.parse_additive()?;
            left = FormulaExpr::BinaryOp {
                op: BinaryOp::Concat,
                left: Box::new(left),
                right: Box::new(right),
            };
        }
        Ok(left)
    }

    fn parse_additive(&mut self) -> Result<FormulaExpr, String> {
        let mut left = self.parse_multiplicative()?;
        loop {
            let op = match self.peek() {
                Some(Token::Plus) => BinaryOp::Add,
                Some(Token::Minus) => BinaryOp::Sub,
                _ => break,
            };
            self.advance();
            let right = self.parse_multiplicative()?;
            left = FormulaExpr::BinaryOp {
                op,
                left: Box::new(left),
                right: Box::new(right),
            };
        }
        Ok(left)
    }

    fn parse_multiplicative(&mut self) -> Result<FormulaExpr, String> {
        let mut left = self.parse_power()?;
        loop {
            let op = match self.peek() {
                Some(Token::Star) => BinaryOp::Mul,
                Some(Token::Slash) => BinaryOp::Div,
                _ => break,
            };
            self.advance();
            let right = self.parse_power()?;
            left = FormulaExpr::BinaryOp {
                op,
                left: Box::new(left),
                right: Box::new(right),
            };
        }
        Ok(left)
    }

    fn parse_power(&mut self) -> Result<FormulaExpr, String> {
        let base = self.parse_unary()?;
        if let Some(Token::Caret) = self.peek() {
            self.advance();
            let exp = self.parse_unary()?;
            Ok(FormulaExpr::BinaryOp {
                op: BinaryOp::Pow,
                left: Box::new(base),
                right: Box::new(exp),
            })
        } else {
            Ok(base)
        }
    }

    fn parse_unary(&mut self) -> Result<FormulaExpr, String> {
        if let Some(Token::Minus) = self.peek() {
            self.advance();
            let expr = self.parse_primary()?;
            Ok(FormulaExpr::Negate(Box::new(expr)))
        } else {
            self.parse_primary()
        }
    }

    fn parse_primary(&mut self) -> Result<FormulaExpr, String> {
        match self.advance() {
            Some(Token::Number(n)) => {
                let n = *n;
                Ok(FormulaExpr::Number(n))
            }
            Some(Token::Text(s)) => {
                let s = s.clone();
                Ok(FormulaExpr::Text(s))
            }
            Some(Token::Bool(b)) => {
                let b = *b;
                Ok(FormulaExpr::Boolean(b))
            }
            Some(Token::CellRef { col, row, abs_col, abs_row }) => {
                let col_str = col.clone();
                let row_str = row.clone();
                let abs_col = *abs_col;
                let abs_row = *abs_row;
                let col_idx = crate::cell::col_from_letters(&col_str)
                    .ok_or_else(|| format!("Invalid column: {col_str}"))?;
                let row_idx: u32 = row_str.parse::<u32>()
                    .map_err(|_| format!("Invalid row: {row_str}"))?
                    .checked_sub(1)
                    .ok_or("Row must be >= 1")?;

                let cell_ref = FormulaExpr::CellRef { col: col_idx, row: row_idx, abs_col, abs_row };

                // Check for range
                if let Some(Token::Colon) = self.peek() {
                    self.advance();
                    let end = self.parse_primary()?;
                    Ok(FormulaExpr::Range {
                        start: Box::new(cell_ref),
                        end: Box::new(end),
                    })
                } else {
                    Ok(cell_ref)
                }
            }
            Some(Token::Ident(name)) => {
                let name = name.clone();
                // Function call
                self.expect(&Token::LParen)?;
                let mut args = Vec::new();
                if self.peek() != Some(&Token::RParen) {
                    args.push(self.parse_expression()?);
                    while let Some(Token::Comma) = self.peek() {
                        self.advance();
                        args.push(self.parse_expression()?);
                    }
                }
                self.expect(&Token::RParen)?;
                Ok(FormulaExpr::FunctionCall { name, args })
            }
            Some(Token::LParen) => {
                let expr = self.parse_expression()?;
                self.expect(&Token::RParen)?;
                Ok(FormulaExpr::Paren(Box::new(expr)))
            }
            Some(tok) => Err(format!("Unexpected token: {tok:?}")),
            None => Err("Unexpected end of formula".into()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_number() {
        let expr = parse_formula("42").unwrap();
        assert_eq!(expr, FormulaExpr::Number(42.0));
    }

    #[test]
    fn test_parse_addition() {
        let expr = parse_formula("1+2").unwrap();
        assert_eq!(expr, FormulaExpr::BinaryOp {
            op: BinaryOp::Add,
            left: Box::new(FormulaExpr::Number(1.0)),
            right: Box::new(FormulaExpr::Number(2.0)),
        });
    }

    #[test]
    fn test_operator_precedence() {
        // 1 + 2 * 3 should parse as 1 + (2 * 3)
        let expr = parse_formula("1+2*3").unwrap();
        match expr {
            FormulaExpr::BinaryOp { op: BinaryOp::Add, right, .. } => {
                match *right {
                    FormulaExpr::BinaryOp { op: BinaryOp::Mul, .. } => {}
                    _ => panic!("Expected multiplication on right"),
                }
            }
            _ => panic!("Expected addition at top"),
        }
    }

    #[test]
    fn test_parse_cell_ref() {
        let expr = parse_formula("A1").unwrap();
        assert_eq!(expr, FormulaExpr::CellRef { col: 0, row: 0, abs_col: false, abs_row: false });
    }

    #[test]
    fn test_parse_absolute_ref() {
        let expr = parse_formula("$A$1").unwrap();
        assert_eq!(expr, FormulaExpr::CellRef { col: 0, row: 0, abs_col: true, abs_row: true });
    }

    #[test]
    fn test_parse_range() {
        let expr = parse_formula("A1:B10").unwrap();
        match expr {
            FormulaExpr::Range { start, end } => {
                assert_eq!(*start, FormulaExpr::CellRef { col: 0, row: 0, abs_col: false, abs_row: false });
                assert_eq!(*end, FormulaExpr::CellRef { col: 1, row: 9, abs_col: false, abs_row: false });
            }
            _ => panic!("Expected Range"),
        }
    }

    #[test]
    fn test_parse_function() {
        let expr = parse_formula("SUM(A1:A10)").unwrap();
        match expr {
            FormulaExpr::FunctionCall { name, args } => {
                assert_eq!(name, "SUM");
                assert_eq!(args.len(), 1);
            }
            _ => panic!("Expected FunctionCall"),
        }
    }

    #[test]
    fn test_parse_nested_function() {
        let expr = parse_formula("IF(A1>0,SUM(B1:B10),0)").unwrap();
        match expr {
            FormulaExpr::FunctionCall { name, args } => {
                assert_eq!(name, "IF");
                assert_eq!(args.len(), 3);
            }
            _ => panic!("Expected IF FunctionCall"),
        }
    }

    #[test]
    fn test_parse_negation() {
        let expr = parse_formula("-A1").unwrap();
        match expr {
            FormulaExpr::Negate(_) => {}
            _ => panic!("Expected Negate"),
        }
    }

    #[test]
    fn test_parse_string() {
        let expr = parse_formula("\"hello\"").unwrap();
        assert_eq!(expr, FormulaExpr::Text("hello".into()));
    }

    #[test]
    fn test_parse_boolean() {
        assert_eq!(parse_formula("TRUE").unwrap(), FormulaExpr::Boolean(true));
        assert_eq!(parse_formula("FALSE").unwrap(), FormulaExpr::Boolean(false));
    }

    #[test]
    fn test_parse_comparison() {
        let expr = parse_formula("A1>=10").unwrap();
        match expr {
            FormulaExpr::BinaryOp { op: BinaryOp::GtEq, .. } => {}
            _ => panic!("Expected GtEq"),
        }
    }
}
