Run with `npm install; npm run dev`.

# Algebra

## Setup
This repo contains boilerplate for an abstract syntax, called AlgExpr.
This is a representation of algebraic expressions formed of the following atoms:
- Integers (eg. 1, 5, 20);
- Variables (eg. x, y, z);

These are composed with the following operations:
- Addition "+" (eg. 1 + 4);
- Subtraction "-" (eg. 15 - 4);
- Multiplication "*" (eg. 14 * 5);
- Division "/" (eg. 16 / 4);

As we are only operating over non-negative integers, we can represent certain expressions, but cannot represent others:
Examples of expressions and how to express them in AlgExpr:
- 1 + 3       // In AlgExpr, simply 1 + 3.
- -5          // AlgExpr currently has no negative numbers!
- 0.4         // AlgExpr cannot represent this directly, but we can use the rational expression: ( 2 / 5 ) 
- pi          // Irrationals cannot be expressed in AlgExpr--we can only express rational expressions.

## Objective 1
- Implement minus, enabling AlgExpr to express negative numbers also.

## Objective 2
- Implement an algebraic reducer able to evaluate expressions, a function eval which is AlgExpr -> AlgExpr which can simplify expressions, similar to "equals".
- Suppose this function is denoted "=".
Eg.
- 1 + 10 = 11         // Addition
- 5 - 9 = -4          // Negative numbers
- 4 / 2 = 2           // Rational simplification
- 4 / 3 = 4 / 3       // We are restricted to precise rational representations.
- 4 + x + 1 = 5 + x   // Interaction with variables
