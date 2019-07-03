
let booleanVal = true
let beginresult
const allParser = allParserInput => {
  let parseAll = [numberParse, evaluateParse, operatorParse, stringParser]
  for (let keyVal of parseAll) {
    let resArr = keyVal(allParserInput)
    if (resArr !== null) return resArr
  }
  return null
}

const obj = {
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

const stringParser = string => {
  let alphabets = /^[a-zA-Z]+/
  if (alphabets.test(string)) {
    let match = string.match(alphabets)
    let index = match[0].length
    return [match[0], string.slice(index)]
  }
}

const operatorParse = op => {
  let symbol
  if (op[1] !== ' ') {
    symbol = op[0] + op[1]
    op = op.slice(2)
    if (obj.hasOwnProperty(symbol)) return [symbol, op]
  }
  if (obj.hasOwnProperty(op[0])) return [op[0], op.slice(1)]
  else return null
}
const evaluateParse = expr => {
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

const expressionParse = expr => {
  let resultArr
  let operator
  let opArr = []
  while (!expr.startsWith(')')) {
    expr = expr.trim()
    resultArr = allParser(expr)
    if (resultArr === null) return null
    if (obj.hasOwnProperty(resultArr[0]) && ((typeof obj[resultArr[0]]) === 'function')) operator = obj[resultArr[0]]
    if (obj.hasOwnProperty(resultArr[0]) && ((typeof obj[resultArr[0]]) === 'number')) opArr.push(obj[resultArr[0]])
    if (!obj.hasOwnProperty(resultArr[0])) opArr.push(resultArr[0])
    expr = resultArr[1]
    if (expr === '') return ['Invalid']
    if (expr.startsWith(' ')) {
      expr = expr.slice(1)
      if (expr.startsWith(')')) return null
    }
  }
  return [operator(opArr), expr.slice(1)]
}

const beginParse = (expr) => {
  let rs
  expr = expr.slice(5)
  while (!expr.startsWith(')')) {
    expr = expr.trim()
    let res = allParser(expr)
    if (res[1] === undefined) return beginresult
    if (res[1].startsWith(')')) {
      rs = res[0]
    }
    expr = res[1]
  }
  return rs
}

const defineParse = (expr) => {
  expr = expr.slice(6)
  expr = expr.trim()
  let key
  let res
  let r = allParser(expr)
  key = r[0]
  let val = r[1].trim()
  res = allParser(val)
  obj[key] = res[0]
  while (!expr.startsWith(')')) expr = expr.slice(1)
  expr = expr.slice(1)
  expr = expr.trim()
  return ['Added value in obj', expr]
}

const ifParse = (expr) => {
  expr = expr.slice(2)
  expr = expr.trim()
  let res = evaluateParse(expr)
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
console.log(evaluateParse('(if (< 3 2) (begin (+ 12 2) (- 30 23)) (begin (+ 1 1) (+ 2 12)))'))
