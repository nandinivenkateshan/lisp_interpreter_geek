
let val = true
let allParser = allParserInput => {
  let parseAll = [numberParse, operatorParse, expressionParse]
  for (let key of parseAll) {
    let resArr = key(allParserInput)
    if (resArr !== null) return resArr
  }
  return null
}

const obj = {
  '+': function (operands) { return operands.reduce((item, acc) => item + acc) },
  '-': function (operands) { return operands.reduce((item, acc) => (item - acc)) },
  '*': function (operands) { return operands.reduce((item, acc) => (item * acc)) },
  '/': function (operands) { return operands.reduce((item, acc) => (item / acc)) },
  '>': function (operands) { return (operands[0] > operands[1]) ? val : !val },
  '<': function (operands) { return (operands[0] < operands[1]) ? val : !val },
  '>=': function (operands) { return (operands[0] >= operands[1]) ? val : !val },
  '<=': function (operands) { return (operands[0] <= operands[1]) ? val : !val }
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

const expressionParse = expr => {
  let resultArr
  let operator
  let opArr = []
  expr = expr.trim()
  if (expr.startsWith('(')) {
    expr = expr.slice(1)
    while (expr[0] !== ')') {
      expr = expr.trim()
      resultArr = allParser(expr)
      if (resultArr === null) return null
      if (obj.hasOwnProperty(resultArr[0])) operator = obj[resultArr[0]]
      else opArr.push(resultArr[0])
      expr = resultArr[1].trim()
      if (expr[0] === ' ') {
        resultArr = expr.slice(1)
        expr = resultArr.trim()
        if (expr.startsWith(')')) return null
      }
    }
    return [operator(opArr), expr.slice(1)]
  } else return null
}

console.log(expressionParse('(+ (+ 1 2)(* 1 2))'))
