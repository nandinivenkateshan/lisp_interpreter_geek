
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
let localObject

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
  } else return null
}
const evaluater = expr => {
  let result = sExpression(expr)
  return result[0]
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
  if (env.hasOwnProperty(firstVal)) return evaluateExpr(expr)
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
  let parser = [booleanParse, numberParse, symbolParse, operatorParse, identifierParser]
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
  let alphabets = /^[a-zA-Z]+[-]?[a-zA-z]*/
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
  else res = exprParser(val) || expressionParse(val)
  if (res[0] === 'define') return [env['define']]
  env[key] = env[res[0]] || res[0]
  expr = res[1]
  while (!expr.startsWith(')')) expr = expr.slice(1)
  expr = expr.slice(1)
  expr = expr.trim()
  return ['Added value in env', expr]
}
const lambdaParser = expr => {
  expr = expr.slice(6).trim()
  localObject = {}
  if (expr.startsWith('(')) expr = expr.slice(1)
  while (!expr.startsWith(')')) {
    let result = identifierParser(expr)
    localObject[result[0]] = null
    expr = result[1]
  }
  expr = expr.slice(1).trim()
  localObject.expression = expr
  return [localObject, localObject.expression]
}
const evaluateExpr = expr => {
  let resultArr
  let operator
  let opArr = []
  while (!expr.startsWith(')')) {
    expr = expr.trim()
    resultArr = exprParser(expr) || sExpression(expr)
    if (resultArr === null || resultArr === undefined) return null
    if (env.hasOwnProperty(resultArr[0]) && (typeof env[resultArr[0]] === 'object')) return lambdaEval(resultArr)
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
  if (typeof operator === 'function') return [operator(...opArr), expr.slice(1)]
}
const symbolParse = input => {
  let res = identifierParser(input)
  if (res !== null) {
    if (localObject) {
      if (localObject.hasOwnProperty(res[0])) {
        let key = Object.keys(localObject)[0]
        res[0] = localObject[key]
        return [res[0], res[1]]
      }
    }
    if (env.hasOwnProperty(res[0])) return res
    return null
  } else return null
}
const lambdaEval = input => {
  let result
  let expression
  if (env.hasOwnProperty(input[0])) {
    let obj = env[input[0]]
    if (input[1].startsWith('(')) result = sExpression(input[1].trim())
    else result = exprParser(input[1].trim()) || expressionParse(input[1].trim())
    let arg = Object.keys(obj)[0]
    obj[arg] = result[0]
    expression = obj[Object.keys(obj)[1]]
    return sExpression(expression)
  } else return null
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
  return [arr[n]]
}

const ifParser = (expr) => {
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
  if (expr.startsWith('(')) res = expressionParse(expr)
  else res = exprParser(expr)
  let val = res[0]
  let condition = res[1].trim()
  if (!condition.startsWith('(')) {
    let value = exprParser(condition)
    let value2
    if (val === true) return [value[0], expr.slice(x)]
    else {
      if (value[1].trim().startsWith('(')) value2 = expressionParse(value[1].trim())
      else value2 = exprParser(value[1].trim())
      return [value2[0], expr.slice(x)]
    }
  } else {
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
    if (val === true) return [expressionParse(condition1), expr.slice(x)]
    else {
      if (condition2.trim().startsWith('(')) value2 = expressionParse(condition2.trim())
      else value2 = exprParser(condition2.trim())
      return [value2[0], expr.slice(x)]
    }
  }
}

console.log(evaluater('(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))'))
console.log(evaluater('(fact 3)'))

console.log(evaluater('(define twice (lambda (x) (* 2 x)))'))
console.log(evaluater('(twice (twice (twice (twice (twice 5)))))'))
