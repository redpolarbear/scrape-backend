var express = require('express');
var apis = require('../apis/index');

var router = express.Router();

/* POST api */
router.post('/scrape', apis.scrape);

module.exports = router;
