'use strict';

var scrapers = {};
scrapers['mec'] = require('./scrapers/mec.scraper');

exports.scrape = function (req, res, next) {
  const url = req.body.url;
  var scraperToUse = '';
  
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
    });
}