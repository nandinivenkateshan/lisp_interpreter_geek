
const globalObj = {
  '+': (...operands) => operands.reduce((acc, item) => (acc + item)),
  '-': (...operands) => operands.reduce((acc, item) => (acc - item)),
  '*': (...operands) => operands.reduce((acc, item) => (acc * item)),
  '/': (...operands) => {
    if (operands.length === 1) return 1 / operands[0]
    return operands.reduce((acc, item) => (acc / item))
  },
  '>': (left, right) => left > right,
  '<': (left, right) => left < right,
  '>=': (left, right) => left >= right,
  '<=': (left, right) => left <= right,
  '=': (left, right) => left === right,
  pi: Math.PI,
  'print': (x) => console.log(x),
  'sqrt': (...operand) => Math.sqrt(operand)
}

const booleanParse = input => {
  if (input.startsWith('true')) return [true, input.slice(4)]
  if (input.startsWith('false')) return [false, input.slice(5)]
  return null
}

const numberParse = input => {
  let zeroNum = /^[-]?0([eE][+-]?[0-9]+)/
  let decimalInfinity = /^[-]?[0-9][0-9]*(\.?[0-9]*([eE][+-]?[0-9]+)?)?/
  if (zeroNum.test(input)) {
    let num = input.match(zeroNum)
    let index = num[0].length
    return [num[0] * 1, input.slice(index)]
  }
  if (decimalInfinity.test(input)) {
    let num = input.match(decimalInfinity)
    let index = num[0].length
    return [num[0] * 1, input.slice(index)]
  }
  return null
}

const evaluater = expr => {
  let count1 = 0
  let count2 = 0
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') count1++
    if (expr[i] === ')') count2++
  }
  if (count1 !== count2) return null
  let result = sExpression(expr, globalObj)
  return (result === null) ? null : result[0]
}

const sExpression = (expr, env = globalObj) => {
  expr = expr.trim()
  if (expr.startsWith('(')) {
    let result = specialFormParser(expr, env) || expressionParse(expr, env)
    return (result !== null) ? result : null
  }
  return null
}

const expressionParse = (expr, env = globalObj) => {
  expr = expr.trim()
  expr = expr.slice(1)
  let firstVal = expr.slice(0, expr.indexOf(' '))
  if (globalObj[firstVal]) return evaluateExpr(expr, env)
  if (firstVal === 'begin') return beginParse(expr, env)
  if (firstVal === 'if') return ifParser(expr, env)
  return null
}

const specialFormParser = (expr, env = globalObj) => {
  expr = expr.trim()
  expr = expr.slice(1)
  let firstVal = expr.slice(0, expr.indexOf(' '))
  if (firstVal === 'define') return defineParser(expr, env)
  if (firstVal === 'lambda') return lambdaParser(expr, env)
  return null
}

const exprParser = (input, env) => {
  let parser = [booleanParse, numberParse, symbolParse, operatorParse, identifierParser]
  for (let parserFunc of parser) {
    let result = parserFunc(input, env)
    if (result !== null) return result
  }
  return null
}

const operatorParse = input => {
  let op = input.slice(0, input.indexOf(' '))
  if (!globalObj[op]) return null
  return [op, input.slice(op.length)]
}

const identifierParser = string => {
  let alphabets = /^[a-zA-Z]+[-]?[a-zA-z]*/
  if (alphabets.test(string)) {
    let match = string.match(alphabets)
    let index = match[0].length
    return [match[0], string.slice(index)]
  }
  return null
}

const defineParser = (expr, env = globalObj) => {
  expr = expr.slice(6)
  expr = expr.trim()
  let key
  let res
  let result = identifierParser(expr)
  if (result === null) return null
  key = result[0]
  let val = result[1].trim()
  res = sExpression(val, env) || exprParser(val, env) || expressionParse(val, env)
  if (res === null) return null
  if (res[0] === 'define') return [env['define']]
  env[key] = env[res[0]] || res[0]
  expr = res[1]
  while (!expr.startsWith(')')) expr = expr.slice(1)
  expr = expr.slice(1)
  expr = expr.trim()
  return ['Added value in env', expr]
}

const lambdaParser = (expr, env = globalObj) => {
  expr = expr.slice(6).trim()
  let localObj = {}
  if (expr.startsWith('(')) expr = expr.slice(1)
  while (!expr.startsWith(')')) {
    let result = identifierParser(expr)
    localObj[result[0]] = null
    expr = result[1]
  }
  expr = expr.slice(1).trim()
  localObj.expression = expr
  localObj.parent = env
  return [localObj, localObj.expression]
}

const evaluateExpr = (expr, env) => {
  let resultArr
  let operator
  let opArr = []
  while (!expr.startsWith(')')) {
    expr = expr.trim()
    resultArr = sExpression(expr, env) || exprParser(expr, env)
    if (resultArr === null || resultArr === undefined) return null
    if (globalObj[resultArr[0]] && (typeof globalObj[resultArr[0]] === 'object')) {
      return lambdaEval(resultArr, env)
    }
    if (globalObj[resultArr[0]] && ((typeof globalObj[resultArr[0]]) === 'function')) operator = globalObj[resultArr[0]]
    if (globalObj[resultArr[0]] && ((typeof globalObj[resultArr[0]]) === 'number')) opArr.push(globalObj[resultArr[0]])
    if (!globalObj[resultArr[0]]) opArr.push(resultArr[0])
    expr = resultArr[1]
    if (expr === '') return null
    if (expr.startsWith(' ')) {
      expr = expr.slice(1)
      if (expr.startsWith(')')) return null
    }
  }
  if (!operator) return [...opArr, expr.slice(1)]
  if (typeof operator === 'function') return [operator(...opArr), expr.slice(1)]
}

const symbolParse = (input, obj) => {
  let res = identifierParser(input)
  if (res !== null) {
    if (typeof globalObj[res[0]] === 'object') return res
    if (obj.parent === undefined) return null
    let key = Object.keys(obj)[0]
    res[0] = obj[key]
    return [res[0], res[1]]
  }
  return null
}

const lambdaEval = (input, env) => {
  let result
  let expression
  if (globalObj[input[0]]) {
    let obj = globalObj[input[0]]
    result = sExpression(input[1].trim(), env) || exprParser(input[1].trim(), env) || expressionParse(input[1].trim(), env)
    let arg = Object.keys(obj)[0]
    obj[arg] = result[0]
    expression = obj[Object.keys(obj)[1]]
    return sExpression(expression, obj)
  }
  return null
}

const beginParse = (expr, env = globalObj) => {
  expr = expr.slice(5)
  let arr = []
  while (!expr.startsWith(')')) {
    expr = expr.trim()
    let res = sExpression(expr, env)
    if (res === null) break
    expr = expr.trim()
    arr.push(res[0])
    expr = res[1]
    if (expr === undefined) return res
  }
  let n = arr.length - 1
  return [arr[n]]
}

const ifParser = (expr, env = globalObj) => {
  expr = expr.slice(2)
  expr = expr.trim()
  let x
  let res
  let count1 = 1
  let count2 = 0
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') count1++
    if (expr[i] === ')') count2++
    if (count1 === count2) {
      x = i
    }
  }
  res = expressionParse(expr, env) || exprParser(expr, env)
  let val = res[0]
  let condition = res[1].trim()
  if (!condition.startsWith('(')) {
    let value = exprParser(condition, env)
    let value2
    if (val === true) return [value[0], expr.slice(x)]
    value2 = expressionParse(value[1].trim(), env) || exprParser(value[1].trim(), env)
    return [value2[0], expr.slice(x)]
  }
  let index
  let openBrac = 0
  let closeBrac = 0
  let value2
  for (let i = 0; i < condition.length; i++) {
    if (condition[i] === '(') openBrac++
    if (condition[i] === ')') closeBrac++
    if (openBrac === closeBrac) {
      index = i
      break
    }
  }
  let condition1 = condition.slice(0, index + 1)
  let condition2 = condition.slice(index + 2, condition.length)
  if (val === true) return [expressionParse(condition1, env), expr.slice(x)]
  value2 = expressionParse(condition2.trim(), env) || exprParser(condition2.trim(), env)
  return [value2[0], expr.slice(x)]
}

console.log(evaluater('(+ 1)'))
console.log(evaluater('(/ 40)'))
console.log(evaluater('(/ 40 400)'))
console.log(evaluater('(+ 1 3 4 6 8 9)'))
console.log(evaluater('(/ 10 12)'))
console.log(evaluater('(+ (+ 4 5) (- 16 4))'))
console.log(evaluater('(* pi 4 3)'))
console.log(evaluater('(+ 10 (sqrt 100))'))

console.log(evaluater('(begin (* 1 2) (* 3 7))'))
console.log(evaluater('(begin (begin (+ 1 2) (+ 3 7)))'))

console.log(evaluater('(begin (define r 10) (* pi (* r r)))'))
console.log(evaluater('(begin (define e 1) (+ e 3))'))
console.log(evaluater('(define plus +)'))
console.log(evaluater('(plus 10 20)'))

console.log(evaluater('(if (<= 3 7) 1 oops)'))
console.log(evaluater('(if (< 10 20) (+ 1 1) (+ 3 3))'))
console.log(evaluater('(if (< (* 11 11) 120) (* 7 6) oops)'))
console.log(evaluater('(+ (if (+ 1 1) 2 (+ 3 4)) 5)'))
console.log(evaluater('(if (> 4 3) (+ 1 1) (+ 5 5))'))
console.log(evaluater('(if (> 3 4) 5 7)'))
console.log(evaluater('(+ (if true 1 2) 5)'))
console.log(evaluater('(begin (begin (define x 12) (define y 1) (+ x y)))'))
console.log(evaluater('(begin (define x 12) (define y 1) (if (< x y) (+ (+ x y) (* x y)) (* x y)))'))
console.log(evaluater('(define define 10)'))
console.log(evaluater('(define define define)'))
console.log(evaluater('(define r 23)'))
console.log(evaluater('(+ r r)'))

console.log(evaluater('(define twice (lambda (x) (+ (* 2 x) (+ 2 x))))'))
console.log(evaluater('(twice 5)'))
console.log(evaluater('(define twice (lambda (x) (* 2 x)))'))
console.log(evaluater('(twice 5)'))

console.log(evaluater('(define circle-area (lambda (r) (* pi (* r r))))'))
console.log(evaluater('(circle-area 10)'))
console.log(evaluater('(define circle-area (lambda (r) (* pi (* r r))))'))
console.log(evaluater('(circle-area (* (+ 5 15) (- 14 10)))'))

console.log(evaluater('(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))'))
console.log(evaluater('(fact 3)'))
console.log(evaluater('(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))'))
console.log(evaluater('(fact (fact 3))'))
