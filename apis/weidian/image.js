'use strict'
var fs = require('fs')
var request = require('request')

exports.upload = function (token, filename) {
  return new Promise(function (resolve, rejcet) {
    var apiUrl = 'https://api.vdian.com/media/upload'
    var options = { method: 'POST',
      url: apiUrl,
      qs: { access_token: token },
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      formData: {
        media: { 
          value: fs.createReadStream(filename),
          options: {
            filename,
            contentType: null
          }
        }
      },
      json: true
    }
    request(options, function (error, response, body) {
      if (error) throw new Error(error)
      console.log(body)
      resolve(body)
    })
  })
}
