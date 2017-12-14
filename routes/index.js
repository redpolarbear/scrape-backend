var express = require('express');
var Spooky = require('spooky');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const url = 'https://www.mec.ca/en/product/5024-150/Vioz-GT-GORE-TEX-Backpacking-Boots';
  list(url).then(function(cb_data) {
    res.send(cb_data);
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
          var $img = document.querySelector('#images > div.carousel.carousel--thumbnails.js-carousel-thumbnails > div > div > div > div.owl-item.synced > div > div > div > img');
          var item = {
            name: $name,
            price: $price,
            img: $img.getAttribute('data-high-res-src')
          };
          return item
        }));
      });
      // spooky.then(function () {
      //   this.emit('imgs', this.evaluate(function() {
      //     var $img = document.querySelector('#images > div.carousel.carousel--thumbnails.js-carousel-thumbnails > div > div > div > div.owl-item.synced > div > div > div > img');
      //     return $img.getAttribute('data-high-res-src')
      //   }));
      // });
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
  
    spooky.on('item', function (greeting) {
      console.log(greeting);
      resolve(greeting);
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
