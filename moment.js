var moment = require('moment');
var now = +moment().format('x') / 1000
var a = moment(parseInt(now))
var b = moment(1513810867073)
console.log(now)
console.log(a.diff(b))