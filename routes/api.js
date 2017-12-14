var express = require('express');
var Spooky = require('spooky');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const url = 'https://www.mec.ca/en/product/5021-354/Power-Matic-200-GV-Backpacking-Boot';
  list(url).then(function(cb_data) {
    res.status(200).json(cb_data);
  });
  // res.render('index', { title: 'Express' });
});

function list (url) {
  return new Promise(function (resolve, reject) {
    var spooky = new Spooky({
      child: {
        transport: 'http'
      },
      casper: {
        logLevel: 'debug',
        verbose: true,
        pageSettings: {
          webSecurityEnabled: false,
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
        }
      }
    }, function (err) {
      if (err) {
          e = new Error('Failed to initialize SpookyJS');
          e.details = err;
          throw e;
      }
      spooky.start(url);
      spooky.then(function () {
        this.emit('item', this.evaluate(function () {
          var $name = document.title;
          var $price = document.querySelector('#ProductDetailControls > div.product__controls__component.product__price.js-price > ul > li > span:nth-child(2) > span').textContent;
          var $imgElems = document.querySelectorAll('#images > div.carousel.carousel--thumbnails.js-carousel-thumbnails > div > div > div > div.owl-item');
          var $imgsArray = [];
          for (var i =0; i < $imgElems.length; ++i) {
            var $img = $imgElems[i].querySelector('div > div > div > img')
            $imgsArray.push($img.getAttribute('data-high-res-src'))
          }
          var $sizeOptions = document.querySelectorAll('#ProductDetailControls > div.product__controls__component.product__size > div > div.select-box > select > option');
          var $sizeArray = [];
          for (var i = 0; i < $sizeOptions.length; ++i) {
            // var $size = $sizeOptions[i].getAttribute('value')
            var $size = $sizeOptions[i].textContent.trim();
            if ($size !== 'Select size' && $size.indexOf('unavailable') === -1) {
              $sizeArray.push($size);
            }
          }
          var $desc = document.querySelector('#pdp-description').innerHTML.trim();
          var item = {
            name: $name,
            price: parseFloat($price.substr(1)),
            imgs: $imgsArray,
            size: $sizeArray,
            desc: $desc
          };
          return item
        }));
      });
      spooky.run();
    });
  
    spooky.on('error', function (e, stack) {
      console.error(e);
      if (stack) {
        console.log(stack);
      }
    });
    // Uncomment this block to see all of the things Casper has to say.
    // There are a lot.
    // He has opinions.
    spooky.on('console', function (line) {
        console.log(line);
    });
  
    spooky.on('item', function (item) {
      console.log(item);
      resolve(item);
    });
    // spooky.on('imgs', function (greeting) {
    //   console.log(greeting);
    // });
    spooky.on('log', function (log) {
      if (log.space === 'remote') {
        console.log(log.message.replace(/ \- .*/, ''));
      }
    });
  });
}

module.exports = router;
