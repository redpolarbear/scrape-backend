'use strict';

var axios = require('axios')

const Image = require('./shared/image')
const Weidian = require('./weidian/index')

var scrapers = {}
scrapers['mec'] = require('./scrapers/mec.scraper')

exports.scrape = function (req, res, next) {
  const url = req.body.url
  var scraperToUse = ''
  
  if (url.indexOf('mec.ca') !== -1) {
    scraperToUse = 'mec'
  } else {
    scraperToUse = 'default'
  }
  scrapers[scraperToUse].list(url)
    .then(function (cb_data) {
      res.status(200).json(cb_data);
    })
    .catch(function (error) {
      console.log(error);
    })
}

exports.saveImage = async function (req, res, next) {
  try {
    const imageUrl = req.query.imageUrl
    const filename = await Image.resizeAndSave(imageUrl)
    res.json(filename)
  } catch (error) {
    console.log(error)
  }
}

exports.uploadImage = async function (req, res, next) {
  try {
    const filename = req.query.filename
    console.log(filename)
    const tokenObj = await Weidian.Token.get()
    const token = tokenObj.data.token
    const response = await Weidian.Image.upload(token, filename)
    if (response.status.status_code === 0) {
      res.status(200).json(response.result)
    }
  } catch (error) {
    console.log(error)    
  }
}

exports.getToken = async function (req, res, next) {
  try {
    const token = await Weidian.Token.get()
    res.json(token)
  } catch (error) {
    throw error
  }
}

exports.getAttr = async function (req, res, next) {
  try {
    const attr_list = await Weidian.Product.getAttrList()
    res.json(attr_list)
  } catch (error) {
    throw error
  }
}
