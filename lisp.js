
const env = {
  '+': (...operands) => operands.reduce((acc, item) => (acc + item)),
  '-': (...operands) => operands.reduce((acc, item) => (acc - item)),
  '*': (...operands) => operands.reduce((acc, item) => (acc * item)),
  '/': (...operands) => {
    if (operands.length === 1) return 1 / operands[0]
    else return operands.reduce((acc, item) => (acc / item))
  },
  '>': (left, right) => left > right,
  '<': (left, right) => left < right,
  '>=': (left, right) => left >= right,
  '<=': (left, right) => left <= right,
  '=': (left, right) => left === right,
  pi: Math.PI,
  'sqrt': (...operand) => Math.sqrt(operand)
}

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
const evaluater = expr => {
  let result = sExpression(expr)
  return result
}
const sExpression = expr => {
  expr = expr.trim()
  if (expr.startsWith('(')) {
    let result = specialFormParser(expr) || expressionParse(expr)
    return (result !== null) ? result : null
  } else return null
}

const expressionParse = expr => {
  expr = expr.trim()
  expr = expr.slice(1)
  let firstVal = expr.slice(0, expr.indexOf(' '))
  if (env.hasOwnProperty(firstVal)) return arithmeticParser(expr)
  if (firstVal === 'begin') return beginParse(expr)
  if (firstVal === 'if') return ifParser(expr)
  else return null
}

const specialFormParser = expr => {
  expr = expr.trim()
  expr = expr.slice(1)
  let firstVal = expr.slice(0, expr.indexOf(' '))
  if (firstVal === 'define') return defineParser(expr)
  if (firstVal === 'lambda') return lambdaParser(expr)
  else return null
}
const exprParser = input => {
  let parser = [numberParse, expressionParse, operatorParse, identifierParser]
  for (let parserFunc of parser) {
    let result = parserFunc(input)
    if (result !== null) return result
  }
  return null
}
const operatorParse = input => {
  let op = input.slice(0, input.indexOf(' '))
  if (!env[op]) return null
  return [op, input.slice(op.length)]
}

const identifierParser = string => {
  let alphabets = /^[a-zA-Z]+/
  if (alphabets.test(string)) {
    let match = string.match(alphabets)
    let index = match[0].length
    return [match[0], string.slice(index)]
  } else return null
}

const defineParser = expr => {
  expr = expr.slice(6)
  expr = expr.trim()
  let key
  let res
  let result = identifierParser(expr)
  if (result === null) return null
  key = result[0]
  let val = result[1].trim()
  if (val.startsWith('(')) res = sExpression(val)
  else res = exprParser(val)
  if (res[0] === 'define') return env['define']
  env[key] = res[0]
  expr = res[1]
  while (!expr.startsWith(')')) expr = expr.slice(1)
  expr = expr.slice(1)
  expr = expr.trim()
  return ['Added value in env', expr]
}
const lambdaParser = expr => {
  expr = expr.slice(6).trim()
  let local = {}
  local.obj = {}
  local.obj.parent = env
  if (expr.startsWith('(')) expr = expr.slice(1)
  while (!expr.startsWith(')')) {
    let result = identifierParser(expr)
    local.obj[result[0]] = null
    expr = result[1]
  }
  expr = expr.slice(1).trim()
  local.obj.expression = expr
  return [local, local.obj.expression]
}
const arithmeticParser = expr => {
  let resultArr
  let operator
  let opArr = []
  while (!expr.startsWith(')')) {
    expr = expr.trim()
    resultArr = exprParser(expr)
    if (resultArr === null || resultArr === undefined) return null
    if (env.hasOwnProperty(resultArr[0]) && ((typeof env[resultArr[0]]) === 'function')) operator = env[resultArr[0]]
    if (env.hasOwnProperty(resultArr[0]) && ((typeof env[resultArr[0]]) === 'number')) opArr.push(env[resultArr[0]])
    if (env.hasOwnProperty(resultArr[0]) && ((typeof env[resultArr[0]]) === 'object')) operator = env[resultArr[0]]
    if (!env.hasOwnProperty(resultArr[0])) opArr.push(resultArr[0])
    expr = resultArr[1]
    if (expr === '') return null
    if (expr.startsWith(' ')) {
      expr = expr.slice(1)
      if (expr.startsWith(')')) return null
    }
  }
  if (!operator) return [...opArr, expr.slice(1)]
  if (typeof operator === 'object') {
    console.log(operator)
  }
  if (typeof operator === 'function') return [operator(...opArr), expr.slice(1)]
}

const beginParse = (expr) => {
  expr = expr.slice(5)
  let arr = []
  while (!expr.startsWith(')')) {
    expr = expr.trim()
    let res = sExpression(expr)
    if (res === null) break
    expr = expr.trim()
    arr.push(res[0])
    expr = res[1]
    if (expr === undefined) return res
  }
  let n = arr.length - 1
  return arr[n]
}

const ifParser = (expr) => {
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
console.log(evaluater('(define twice (lambda (x) (* 2 x)))'))
console.log(evaluater('(twice 5)'))
