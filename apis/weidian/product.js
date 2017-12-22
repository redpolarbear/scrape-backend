'use strict'
var axios = require('axios')
var Token = require('./token')

exports.getAttrList = async function () {
  try {
    const tokenObj = await Token.get()
    const token = tokenObj.data.token
    const apiUrl = 'https://api.vdian.com/api'
    const method = 'vdian.sku.attrs.get'
    const param = {}
    const pubParam = {
      'method': method,
      'access_token': token,
      'version':'1.0',
      'format':'json'
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

exports.addAttr = async function (attr_title, newAttr_value) {
  try {
    const tokenObj = await Token.get()
    const token = tokenObj.data.token
    const apiUrl = 'https://api.vdian.com/api'
    const method = 'vdian.sku.attr.add'
    const pubParam = {
      'method': method,
      'access_token': token,
      'version':'1.0',
      'format':'json'
    }
    const param = {
      'attr_list': [
        {
          attr_title,
          'attr_values': [
            {
              'attr_value': newAttr_value
            }
          ]
        }
      ]
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
        message: 'New attr was added',
        data: attrRes.data.result
      }
    } else {
      return {
        success: false,
        message: attrRes.data.status.status_reason
      }
    }
  } catch (error) {
    throw error
  }
}
