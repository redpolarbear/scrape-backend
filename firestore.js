var firebase = require('./firebase')
var axios = require('axios')
var moment = require('moment')

const appkey = '659335'
const secret = '96e7485f1c4a9ab5ca0890c6f803dc3a'

var db = firebase.firestore()
var tokenRef = db.collection('Token').doc('currentToken')

var data = {
  token: '96e7485f1c4a9ab5ca0890c6f803dc3a',
  createdAt: parseInt(moment().format('x'))
}

const save = async function (data) {
  try {
    await tokenRef.set(data)
    return {
      data,
      message: 'Token is saved!',
      success: true
    }
  } catch (error) {
    throw error
  }
}

try {
  save(data)
} catch (error) {
  throw error
}