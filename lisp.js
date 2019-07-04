
let booleanVal = true
let beginresult
const allParser = allParserInput => {
  let parseAll = [numberParse, specialFormParser, operatorParse, stringParser]
  for (let keyVal of parseAll) {
    let resArr = keyVal(allParserInput)
    if (resArr !== null) return resArr
  }
  return null
}
const env = {
  '+': function (operands) { return operands.reduce((acc, item) => (acc + item)) },
  '-': function (operands) { return operands.reduce((acc, item) => (acc - item)) },
  '*': function (operands) { return operands.reduce((acc, item) => (acc * item)) },
  '/': function (operands) { return operands.reduce((acc, item) => (acc / item)) },
  '>': function (operands) { return (operands[0] > operands[1]) ? booleanVal : !booleanVal },
  '<': function (operands) { return (operands[0] < operands[1]) ? booleanVal : !booleanVal },
  '>=': function (operands) { return (operands[0] >= operands[1]) ? booleanVal : !booleanVal },
  '<=': function (operands) { return (operands[0] <= operands[1]) ? booleanVal : !booleanVal },
  '=': function (operands) { return (operands[0] === operands[1]) ? booleanVal : !booleanVal },
  pi: 3.141592653589793
}

// --------------------------------S-Expression---

const sExpression = expr => {
  expr = expr.trim()
  if (expr.startsWith('(')) return specialFormParser(expr)
  if (numberParse(expr) !== null) return numberParse(expr)
  if (stringParser(expr) !== null) return stringParser(expr)
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

const stringParser = string => {
  let alphabets = /^[a-zA-Z]+/
  if (alphabets.test(string)) {
    let match = string.match(alphabets)
    let index = match[0].length
    return [match[0], string.slice(index)]
  } else return null
}

// --------------------------------Operator Parser---

const operatorParse = op => {
  let symbol
  if (op[1] !== ' ') {
    symbol = op[0] + op[1]
    op = op.slice(2)
    if (env.hasOwnProperty(symbol)) return [symbol, op]
  }
  if (env.hasOwnProperty(op[0])) return [op[0], op.slice(1)]
  else return null
}

// --------------------------------Special Form Parser---

const specialFormParser = expr => {
  if (expr.startsWith('(')) {
    expr = expr.trim()
    expr = expr.slice(1)
    if (expr.startsWith('begin')) {
      beginresult = beginParse(expr)
      return beginresult
    }
    if (expr.startsWith('define')) {
      return defineParse(expr)
    }
    if (expr.startsWith('if')) {
      return ifParse(expr)
    } else {
      return expressionParse(expr)
    }
  } else return null
}

// --------------------------------Arithmaetic Expression---

const expressionParse = expr => {
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
  return [operator(opArr), expr.slice(1)]
}
// --------------------------------begin parser---
const beginParse = (expr) => {
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
// --------------------------------define parser---
const defineParse = (expr) => {
  expr = expr.slice(6)
  expr = expr.trim()
  let key
  let res
  let r = allParser(expr)
  key = r[0]
  let val = r[1].trim()
  res = allParser(val)
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
console.log(sExpression('(begin (define r 10) (if (< r 20) (+ r r) (- r r)) '))
