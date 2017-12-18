// normal color
'#ProductDetailControls > div.product__controls__component.product__colour > div.swatch-container.js-swatch-container.js-swatch-parent-container > div > div.swatch__group > ul > li.swatch'
// regular color
'#ProductDetailControls > div.product__controls__component.product__colour > div.swatch-container.js-swatch-container.js-swatch-parent-container > div.swatch-control-wrapper > div > div.swatch__group > ul > li.swatch'
// clearance color
'#ProductDetailControls > div.product__controls__component.product__colour > div.swatch-container.js-swatch-container.js-swatch-parent-container > div:nth-child(2) > div > div.swatch__group > ul > li.swatch'

var baseColorEleStr = '#ProductDetailControls > div.product__controls__component.product__colour > div.swatch-container.js-swatch-container.js-swatch-parent-container';
var colorDOMsNumber = this.evaluate(function (baseColorEleStr) {
  return document.querySelectorAll(baseColorEleStr + ' > div').length;
}, baseColorEleStr);
if (colorDOMsNumber > 1) { // with the clearance color
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
  })
  // clearance color
  var cleColorEleStr = baseColorEleStr + ' > div:nth-child(2) > div > div.swatch__group > ul > li.swatch';
  var cleColorNumber = this.evaluate(function (cleColorEleStr) {
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
} else if (colorDOMsNumber === 1) { // without the clearance color
  var colorEleStr = baseColorEleStr + ' > div > div.swatch__group > ul > li.swatch';
  var colorNumber = this.evaluate(function (colorEleStr) {
    return document.querySelectorAll(colorEleStr).length;
  }, colorEleStr);
  if (colorNumber !== 0) {
    // multiple color existed
    asyncLoop(colorNumber, function (loop) {
      var i = loop.iterations() + 1;
      var colorAStr = colorEleStr + ':nth-child(' + i + ') > a';
      colorClick(colorAStr, colorEleStr, function (sku) {
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


function colorClick (colorAStr, colorStr, callback) {
  self.click(colorAStr)
  self.wait(1000, function () {
    skuInfo(colorStr, function (info) {
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
      var $colorImg = ''; // only one color, return ''
    } else {
      var $colorImgDOM = document.querySelector(colorStr + '.is-active > a > span');
      // var $colorImg = $colorImgDOM.style.backgroundImage;
      var $colorImg = window.getComputedStyle($colorImgDOM, false).getPropertyValue('background-image').slice(4, -1);
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