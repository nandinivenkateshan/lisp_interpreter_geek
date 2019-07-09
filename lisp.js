
const allParser = allParserInput => {
  let parseAll = [numberParse, sExpression, operatorParse, identifierParser]
  for (let keyVal of parseAll) {
    let resArr = keyVal(allParserInput)
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
  pi: Math.PI,
  'sqrt': (...operand) => Math.sqrt(operand)
}

// -------------------------------Expression Parser---

const expressionParser = expr => {
  expr = expr.trim()
  if (expr.startsWith('(')) return sExpression(expr)
  else return null
}

// -------------------Number Parser---

const numberParse = numberInput => {
  let zeroNum = /^[-]?0([eE][+-]?[0-9]+)/
  let decimalInfinity = /^[-]?[0-9][0-9]*(\.?[0-9]*([eE][+-]?[0-9]+)?)?/

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

// --------------------------------String Parser---

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
  return [op, input.slice(op.length)]
}

// --------------------------------Special Form Parser---

const sExpression = expr => {
  if (expr.startsWith('(')) {
    expr = expr.trim()
    expr = expr.slice(1)
    let firstVal = expr.slice(0, expr.indexOf(' '))
    if (firstVal === 'begin') return beginParse(expr)
    if (firstVal === 'define') return defineParse(expr)
    if (firstVal === 'if') return ifParse(expr)
    if (env.hasOwnProperty(firstVal)) return arithmeticExpr(expr)
    else return null
  } else return null
}

// --------------------------------Arithmetic Expression---

const arithmeticExpr = expr => {
  let resultArr
  let operator
  let opArr = []
  while (!expr.startsWith(')')) {
    expr = expr.trim()
    resultArr = allParser(expr)
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
  if (!operator) return [...opArr, expr.slice(1)]
  return [operator(...opArr), expr.slice(1)]
}
// --------------------------------begin
const beginParse = expr => {
  expr = expr.slice(5)
  let arr = []
  while (!expr.startsWith(')')) {
    expr = expr.trim()
    let res = allParser(expr)
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
const defineParse = expr => {
  expr = expr.slice(6)
  expr = expr.trim()
  let key
  let res
  let r = identifierParser(expr)
  if (r === null && env['define']) return env['define']
  key = r[0]
  let val = r[1].trim()
  if (val.startsWith('(')) res = allParser(val)
  res = arithmeticExpr(val)
  env[key] = res[0]
  while (!expr.startsWith(')')) expr = expr.slice(1)
  expr = expr.slice(1)
  expr = expr.trim()
  return ['Added value in env', expr]
}

// --------------------------------if Parser---
const ifParse = expr => {
  expr = expr.slice(2)
  expr = expr.trim()
  let res = allParser(expr)
  let boolean = res[0]
  let condition = res[1].trim()
  if (!condition.startsWith('(')) {
    let value = allParser(condition)
    if (boolean === true) return value[0]
    else return ((allParser(value[1].trim()))[0])
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
    if (boolean === true) return allParser(condition1)
    else return allParser(condition2)
  }
}
console.log(expressionParser('(begin (define define 10))'))
console.log(expressionParser('(define)'))
console.log(expressionParser('(x)'))
console.log(expressionParser('(+ (+ 4 5) (- 16 4))'))
console.log(expressionParser('(* 1)'))
console.log(expressionParser('(/ 10)'))
console.log(expressionParser('(/ 40 40)'))
console.log(expressionParser('(+ 1 3 4 6 8 9)'))
console.log(expressionParser('(begin (define r 10)(* pi (* r r)))'))
console.log(expressionParser('(if (> 10 20) (+ 1 1) (+ 3 3))'))
console.log(expressionParser('(if (< (* 11 11) 120) (* 7 6) oops)'))
console.log(expressionParser('(begin (define e 1) (+ e 3))'))
console.log(expressionParser('(begin (begin (define x 12) (define y 1) (+ x y)))'))
console.log(expressionParser('(begin (define x 12) (define y 1) (if (> x y) (+ (+ x y) (* x y) (* x y)))'))
console.log(expressionParser('(define define 10)'))
console.log(expressionParser('(+ define 10)'))
console.log(expressionParser('(define length define)'))
console.log(expressionParser('(+ length (/ 100 100))'))
console.log(expressionParser('(+ 10 (sqrt 100))'))
