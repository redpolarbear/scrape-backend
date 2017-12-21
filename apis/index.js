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

exports.uploadImage = function (req, res, next) {

}

exports.getToken = async function (req, res, next) {
  try {
    const token = await Weidian.Token.get()
    res.json(token)
  } catch (error) {
    throw error
  }
}

// exports.saveToken = async function (req, res, next) {
//   try {
//     const response = await Weidian.saveToken()
//     res.json(response)
//   } catch (error) {
//     throw error
//   }
// }