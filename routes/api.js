var express = require('express')
var apis = require('../apis/index')

var router = express.Router()

/* POST api */
router.post('/scrape', apis.scrape)
router.get('/saveimage', apis.saveImage)
router.post('/uploadimage', apis.uploadImage)
router.get('/gettoken', apis.getToken)
// router.get('/savetoken', apis.saveToken)


module.exports = router
