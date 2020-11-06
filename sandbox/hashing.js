const bcrypt = require("bcryptjs")

var hashedPass = bcrypt.hashSync('asdfasdf')

console.log(hashedPass)

var hashTest = bcrypt.compareSync('asdfasdf', hashedPass)
console.log(hashTest)

