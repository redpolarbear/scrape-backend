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
        var baseColorEleStr = '#ProductDetailControls > div.product__controls__component.product__colour > div.swatch-container.js-swatch-container.js-swatch-parent-container';
        var colorDOMsNumber = this.evaluate(function (baseColorEleStr) {
          return document.querySelectorAll(baseColorEleStr + ' > div').length;
        }, baseColorEleStr);

        if (colorDOMsNumber > 1) {// with the clearance color
          // regular color
          var regColorEleStr = baseColorEleStr + ' > div.swatch-control-wrapper > div > div.swatch__group > ul > li.swatch';
          var regColorNumber = this.evaluate(function (regColorEleStr) {
            return document.querySelectorAll(regColorEleStr).length;
          }, regColorEleStr)
          asyncLoop(regColorNumber, function (loop) {
            var i = loop.iterations() + 1;
            var regColorAStr = regColorEleStr + ':nth-child(' + i + ') > a';
            colorClick(regColorAStr, regColorEleStr, function (sku) {
              self.emit('sku', sku);
              loop.next();
            })
          }, function () {
            // asyncLoop onComplete Callback
            // clearance color
            var cleColorEleStr = baseColorEleStr + ' > div:nth-child(2) > div > div.swatch__group > ul > li.swatch';
            var cleColorNumber = self.evaluate(function (cleColorEleStr) {
              return document.querySelectorAll(cleColorEleStr).length;
            }, cleColorEleStr)
            asyncLoop(cleColorNumber, function (loop) {
              var i = loop.iterations() + 1;
              var cleColorAStr = cleColorEleStr + ':nth-child(' + i + ') > a';
              colorClick(cleColorAStr, cleColorEleStr, function (sku) {
                self.emit('sku', sku);
                loop.next();
              })
            }, function () {
              // asyncLoop onComplete Callback
            })
          })
        } else if (colorDOMsNumber === 1 || colorDOMsNumber === 0) { // without the clearance color
          var colorEleStr = baseColorEleStr + ' > div > div.swatch__group > ul > li.swatch';
          var colorNumber = this.evaluate(function (colorEleStr) {
            return document.querySelectorAll(colorEleStr).length;
          }, colorEleStr);
          if (colorNumber !== 0) {
            // multiple color existed
            asyncLoop(colorNumber, function (loop) {
              var i = loop.iterations() + 1;
              var elem = '#ProductDetailControls > div.product__controls__component.product__colour > div.swatch-container.js-swatch-container.js-swatch-parent-container > div > div.swatch__group > ul > li.swatch:nth-child(' + i + ') > a'
              colorClick(elem, colorEleStr, function (sku) {
                self.emit('sku', sku);
                loop.next();
              })
            }, function () {
              // asyncLoop onComplete Callback
            });
          } else {
            // only one color
            skuInfo(null, function (info) {
              this.emit('sku', info)
            });
          }
        }
        function colorClick (elemA, elemB, callback) {
          self.click(elemA)
          self.wait(1000, function () {
            skuInfo(elemB, function (info) {
              callback(info)
            })
          })
        }
        function skuInfo (colorStr, callback) {
          var $sku = self.evaluate(function (colorStr) {
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
            if (colorStr === null) {
              var $colorImg = '' // only one color, return ''
            } else {
              var $colorImgDOM = document.querySelector(colorStr + '.is-active > a > span')
              var $colorImg = window.getComputedStyle($colorImgDOM, false).getPropertyValue('background-image').slice(4, -1);
              // var $colorImg = $colorImgDOM.style.backgroundImage;
            }
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
          }, colorStr)
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
            $imgsArray.push({src: $img.getAttribute('data-high-res-src')})
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