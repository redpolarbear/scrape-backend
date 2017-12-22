'use strict'
var axios = require('axios')
var Token = require('./index')

exports.getAttrList = async function () {
  try {
    const tokenObj = await Token.get()
    const token = tokenObj.data.token
    const apiUrl = "https://api.vdian.com/api"
    const method = "vdian.sku.attrs.get"
    const param = {}
    const pubParam = {
      "method": method,
      "access_token": token,
      "version":"1.0",
      "format":"json"
    }
    const attrRes = await axios.get(apiUrl, {
      params: {
        param,
        public: pubParam
      }
    })
    if (attrRes.data.status.status_code === 0) {
      return {
        success: true,
        message: 'Attr_list was achieved!',
        data: attrRes.data.result
      }
    }
  } catch (error) {
    throw error
  }
}
