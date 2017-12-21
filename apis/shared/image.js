'use strict';
var Jimp = require('jimp')
var path = require('path');
var URL = require('url-parse');

exports.resizeAndSave = async function (url) {
  const basename = path.basename(url)
  const imgUrl = new URL(url)
  const hostname = imgUrl.hostname
  const dest = 'public/images/downloads/' + hostname + '-' + basename
  try {
    const image = await Jimp.read(url)
    await image.scaleToFit(800, 800).quality(90).write(dest)
    return dest
  } catch (error) {
    console.log(error)
  }
}


