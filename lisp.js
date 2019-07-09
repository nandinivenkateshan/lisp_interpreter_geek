
const exprParser = input => {
  let parseAll = [numberParse, operatorParse, ifParse, beginParse, identifierParser]
  for (let keyVal of parseAll) {
    let resArr = keyVal(input)
    if (resArr !== null) return resArr
  }
  return null
}

const env = {
  '+': (...operands) => operands.reduce((acc, item) => (acc + item)),
  '-': (...operands) => operands.reduce((acc, item) => (acc - item)),
  '*': (...operands) => operands.reduce((acc, item) => (acc * item)),
  '/': (...operands) => {
    if (operands.length === 1) return 1 / operands[0]
    else return operands.reduce((acc, item) => (acc / item))
  },
  '>': (left, right) => left > right,
  '<': (left, right) => left > right,
  '>=': (left, right) => left >= right,
  '<=': (left, right) => left <= right,
  '=': (left, right) => left === right,
  pi: Math.pi,
  'sqrt': (...operand) => Math.sqrt(operand)
}

// -------------------------------Expression Parser---

const sExpressionParser = expr => {
  expr = expr.trim()
  if (expr.startsWith('(')) {
    expr = expr.slice(1)
    expr = expr.trim()
    if (defineParse(expr) !== null) return defineParse(expr)
    if (expressionParser(expr) !== null) return expressionParser(expr)
  }
  return null
}

// -------------------Number Parser---

const numberParse = numberInput => {
  let zeroNum = /^[-]?0([eE][+-]?[0-9]+)/
  let decimalInfinity = /^[-]?[0-9][0-9]*(\.?[0-9]*([eE][+-]?[0-9]+)?)?/
  // console.log(numberInput)
  if (zeroNum.test(numberInput)) {
    let num = numberInput.match(zeroNum)
    let index = num[0].length
    return [num[0] * 1, numberInput.slice(index)]
  }
  if (decimalInfinity.test(numberInput)) {
    let num = numberInput.match(decimalInfinity)
    let index = num[0].length
    return [num[0] * 1, numberInput.slice(index)]
  } else return null
}

// --------------------------------Identifier Parser---

const identifierParser = string => {
  let alphabets = /^[a-zA-Z]+/
  if (alphabets.test(string)) {
    let match = string.match(alphabets)
    let index = match[0].length
    return [match[0], string.slice(index)]
  } else return null
}

// --------------------------------Operator Parser---

const operatorParse = input => {
  let op = input.slice(0, input.indexOf(' '))
  if (!env[op]) return null
  return [op, input.slice(1)]
}

// --------------------------------Expression Parser---
const expressionParser = expr => {
  let firstVal = expr.slice(0, expr.indexOf(' '))
  if (operatorParse(expr) !== null) return arithmeticExpr(expr)
  if (firstVal === 'begin') {
    return beginParse(expr)
  }
  if (firstVal === 'if') {
    return ifParse(expr)
  } else return null
}

// --------------------------------Arithmetic Expression---

const arithmeticExpr = expr => {
  let resultArr
  let operator
  let opArr = []
  while (!expr.startsWith(')')) {
    expr = expr.trim()
    resultArr = exprParser(expr)
    // console.log(resultArr)
    if (resultArr === null || resultArr === undefined) return null
    if (env.hasOwnProperty(resultArr[0]) && ((typeof env[resultArr[0]]) === 'function')) operator = env[resultArr[0]]
    if (env.hasOwnProperty(resultArr[0]) && ((typeof env[resultArr[0]]) === 'number')) opArr.push(env[resultArr[0]])
    if (!env.hasOwnProperty(resultArr[0])) opArr.push(resultArr[0])
    expr = resultArr[1]
    if (expr === '') return null
    if (expr.startsWith(' ')) {
      expr = expr.slice(1)
      if (expr.startsWith(')')) return null
    }
  }
  return [operator(...opArr), expr.slice(1)]
}
// --------------------------------begin
const beginParse = (expr) => {
  expr = expr.slice(5)
  let arr = []
  while (!expr.startsWith(')')) {
    expr = expr.trim()
    let res = exprParser(expr)
    if (res === null) break
    expr = expr.trim()
    arr.push(res[0])
    expr = res[1]
    if (expr === undefined) return res
  }
  let n = arr.length - 1
  return arr[n]
}
// --------------------------------define
const defineParse = (expr) => {
  expr = expr.slice(1)
  expr = expr.trim()
  let value = expr.slice(0, expr.indexOf(' '))
  if (value !== 'define') return null
  expr = expr.slice(6)
  expr = expr.trim()
  let key
  let res
  let result = identifierParser(expr)
  if (result === null) return null
  key = result[0]
  let val = result[1].trim()
  res = exprParser(val)
  env[key] = res[0]
  while (!expr.startsWith(')')) expr = expr.slice(1)
  expr = expr.slice(1)
  expr = expr.trim()
  return ['Added value in env', expr]
}
// --------------------------------if Parser---
const ifParse = (expr) => {
  expr = expr.slice(2)
  expr = expr.trim()
  let res = exprParser(expr)
  let boolean = res[0]
  let condition = res[1].trim()
  if (!condition.startsWith('(')) {
    let value = exprParser(condition)
    if (boolean === true) return value[0]
    else return ((exprParser(value[1].trim()))[0])
  } else {
    let index
    let openBrac = 0
    let closeBrac = 0
    for (let i = 0; i < condition.length; i++) {
      if (condition[i] === '(') openBrac++
      if (condition[i] === ')') closeBrac++
      if (openBrac === closeBrac) {
        index = i
        break
      }
    }
    let condition1 = condition.slice(0, index + 1)
    let condition2 = condition.slice(index + 2, condition.length - 1)
    if (boolean === true) return exprParser(condition1)
    else return exprParser(condition2)
  }
}

// console.log(sExpressionParser('(define r 23)'))
// console.log(sExpressionParser('(+ r r)'))
// console.log(expressionParser('1456'))
console.log(sExpressionParser('(+ (+ 4 5) (- 16 4))'))
// console.log(expressionParser('(* 1)'))
// console.log(expressionParser('(/ 40)'))
// console.log(expressionParser('(/ 40 400)'))
// console.log(expressionParser('(+ 1 3 4 6 8 9)'))
// console.log(expressionParser('(begin (define r 10)(* pi (* r r)))'))
// console.log(sExpressionParser('(if (> 10 20) (+ 1 1) (+ 3 3))'))
// console.log(expressionParser('(if (< (* 11 11) 120) (* 7 6) oops)'))
// console.log(expressionParser('(begin (define e 1) (+ e 3))'))
// console.log(expressionParser('(begin (begin (define x 12) (define y 1) (+ x y)))'))
// console.log(expressionParser('(begin (define x 12) (define y 1) (if (> x y) (+ (+ x y) (* x y) (* x y)))'))
// console.log(expressionParser('(/ 10 12)'))
// console.log(expressionParser('(* pi 4 3)'))
// console.log(expressionParser('(define define 10)'))
// console.log(expressionParser('(+ define 10)'))
// console.log(expressionParser('(* (+ define 10) 10 2)'))
// console.log(expressionParser('(define length define)'))
// console.log(expressionParser('(+ length (/ 100000 100))'))
// console.log(expressionParser('(+ 10 (sqrt 100))'))
