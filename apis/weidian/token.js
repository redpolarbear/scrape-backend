var firebase = require('../../firebase')
var axios = require('axios')
var moment = require('moment')

const appkey = '659335'
const secret = '96e7485f1c4a9ab5ca0890c6f803dc3a'

var db = firebase.firestore()
var tokenRef = db.collection('Token').doc('currentToken')

const getToken = async function () {
  var apiUrl = 'https://api.vdian.com/token'
  try {
    const token = await axios.get(apiUrl, {
      params: {
        grant_type: 'client_credential',
        appkey,
        secret
      }
    })
    if (token.data.status.status_code === 0) { // success
      return { 
        data: {
          token: token.data.result.access_token,
          createdAt: parseInt(moment().format('X'))
        },
        message: 'New Token is achieved!',
        success: true
      }
    } 
    return {
      message: 'Failed to get the new token!',
      success: false
    }
  } catch (error) {
    throw error
  }
}

const saveToken = async function (data) {
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

const refreshToken = async function () {
  try {
    const newToken = await getToken()
    if (newToken.success) {
      const isSaved = await saveToken(newToken.data)
      if (isSaved.success) {
        return {
          data: newToken.data,
          success: true,
          message: 'Token was refreshed!'
        }
      }
    }
    return {
      message: 'Oops, something wrong!',
      success: false
    }
  } catch (error) {
    throw error
  }
}

const validateToken = function (token) {
  var now = moment(+moment().format('X'))
  var tokenCreatedAt = moment(token.createdAt)
  if (now.diff(tokenCreatedAt) >= 89900) { // expired
    return false
  } else {
    return true
  }
}

const findToken = async function () {
  try {
    const token = await tokenRef.get()
    if (token.exists) {
      return {
        data: token.data(),
        message: 'Token was found in database!',
        success: true
      }
    }
    return {
      message: 'Token was not found or something wrong with the database!',
      success: false
    }
  } catch (error) {
    throw error
  }
}

exports.get = async function () {
  try {
    const isTokenFound = await findToken();
    if (isTokenFound.success) {
      const isTokenValid = await validateToken(isTokenFound.data)
      if (isTokenValid) {
        return {
          data: isTokenFound.data,
          message: 'Token is still valid',
          success: true
        }
      }
    }
    const newToken = await refreshToken()
    if (newToken.success) {
      return {
        data: newToken.data,
        message: 'Token is ready to go!',
        success: true
      }
    } else {
      return {
        message: 'Failed to get the token, please check the log!',
        success: false
      }
    }
  } catch (error) {
    throw error
  }
}
