'use strict';
var Spooky = require('spooky');

exports.list = function (url) {
  return new Promise(function (resolve, reject) {
    var $skus = [];
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

      spooky.then(function() {
        self = this;
        var colorNumber = this.evaluate(function () {
          return document.querySelectorAll('#ProductDetailControls > div.product__controls__component.product__colour > div.swatch-container.js-swatch-container.js-swatch-parent-container > div > div.swatch__group > ul > li.swatch').length;
        });
        if (colorNumber !== 0) {
          // multiple color existed
          asyncLoop(colorNumber, function (loop) {
            var i = loop.iterations() + 1;
            var elem = '#ProductDetailControls > div.product__controls__component.product__colour > div.swatch-container.js-swatch-container.js-swatch-parent-container > div > div.swatch__group > ul > li.swatch:nth-child(' + i + ') > a'
            colorClick(elem, function (sku) {
              self.emit('sku', sku);
              loop.next();
            })
          }, function () {
            // asyncLoop onComplete Callback
          });
        } else {
          // only one color
          skuInfo(function (info) {
            this.emit('sku', info)
          });
        }
        function colorClick (elem, callback) {
          self.click(elem)
          self.wait(1000, function () {
            skuInfo(function (info) {
              callback(info)
            })
          })
        }
        function skuInfo (callback) {
          var $sku = self.evaluate(function () {
            // price
            var $priceDOM = document.querySelector('#ProductDetailControls > div.product__controls__component.product__price.js-price > ul.price-group > li.price > span[itemprop="offers"]');
            if (!!$priceDOM.querySelector('span[itemprop="price"]')) {
              var $price = parseFloat($priceDOM.querySelector('span[itemprop="price"]').textContent.substr(1))
            } else {
              var $lowPrice = document.querySelector('#ProductDetailControls > div.product__controls__component.product__price.js-price > ul.price-group > li.price > span[itemprop="offers"] > span[itemprop="lowPrice"]').textContent;
              var $highPrice = document.querySelector('#ProductDetailControls > div.product__controls__component.product__price.js-price > ul.price-group > li.price > span[itemprop="offers"] > span[itemprop="highPrice"]').textContent;
              var $price = $lowPrice + ' - ' + $highPrice;
            }
            // color name
            var $colorName = document.querySelector('#ProductDetailControls > div.product__controls__component.product__colour > label > span').textContent;
            // color Img
            var $colorImgDOM = document.querySelector('#ProductDetailControls > div.product__controls__component.product__colour > div.swatch-container.js-swatch-container.js-swatch-parent-container > div > div.swatch__group > ul > li.swatch.is-active > a > span')
            // var $colorImg = $colorImgDOM.style.backgroundImage;
            var $colorImg = window.getComputedStyle($colorImgDOM, false).getPropertyValue('background-image').slice(4, -1);
            // size under this color
            var $sizeOptions = document.querySelectorAll('#ProductDetailControls > div.product__controls__component.product__size > div > div.select-box > select > option');
            var $sizeArray = [];
            for (var i = 0; i < $sizeOptions.length; ++i) {
              var $size = $sizeOptions[i].textContent.trim();
              if ($size !== 'Select size' && $size.indexOf('unavailable') === -1) {
                $sizeArray.push($size);
              }
            }
            return {
              price: $price,
              colorName: $colorName,
              colorImg: $colorImg,
              sizes: $sizeArray
            }
          })
          callback($sku)
        }
        function asyncLoop (iterations, func, callback) {
          var index = 0;
          var done = false;
          var loop = {
            next: function () {
              if (done) { return; }
              if (index < iterations) {
                index++;
                func(loop);
              } else {
                done = true;
                callback();
              }
            },
            iterations: function() {
              return index - 1;
            },
            break: function () {
              done = true;
              callback();
            }
          };
          loop.next();
          return loop;
        }
      });

      spooky.then(function () {
        var productName = this.evaluate(function () {
          return document.title;
        })
        // capture the "Tech Specs" as the png into the path public/images/mec/
        this.captureSelector('public/images/mec/' + productName + ' - TECH SPECS.png', '#main-content > div > div > div:nth-child(4) > div:nth-child(1) > div.product__accordion.accordion > div:nth-child(2)')
        this.emit('master', this.evaluate(function () {
          // name
          var $name = document.title;
          // imgs
          var $imgElems = document.querySelectorAll('#images > div.carousel.carousel--thumbnails.js-carousel-thumbnails > div > div > div > div.owl-item');
          var $imgsArray = [];
          for (var i =0; i < $imgElems.length; ++i) {
            var $img = $imgElems[i].querySelector('div > div > div > img')
            $imgsArray.push($img.getAttribute('data-high-res-src'))
          }
          // desc
          var $desc = document.querySelector('#pdp-description > p').outerHTML.trim() + document.querySelector('#pdp-description > ul').outerHTML.trim();
          var item = {
            name: $name,
            imgs: $imgsArray,
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
    spooky.on('sku', function (skuData) {
      $skus.push(skuData);
    });
    spooky.on('master', function (masterData) {
      resolve(Object.assign({skus: $skus}, masterData));
    });
    spooky.on('log', function (log) {
      if (log.space === 'remote') {
        console.log(log.message.replace(/ \- .*/, ''));
      }
    });
  });
}