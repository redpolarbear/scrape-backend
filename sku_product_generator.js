var url = "https://api.vdian.com/api";
var param = {
  price: "2",
  stock: "20",
  itemName: "接口测试多级SKU商品1_2",
  sku: [
    {
      title: "蓝色 ; L",
      stock: 2,
      price: "112.00",
      sku_merchant_code: "",
      img: "",
      attr_ids: [6269220, 6269224]
    }
  ],
  attr_list: [
    {
      attr_title: "颜色",
      attr_values: [
        {
          attr_id: 6269220,
          attr_value: "蓝色",
          img: ""
        }
      ]
    },
    {
      attr_title: "尺寸",
      attr_values: [
        {
          attr_id: 6269224,
          attr_value: "L",
          img: ""
        }
      ]
    }
  ],
  bigImgs: [
    "http://wd.geilicdn.com/vshop395640-1390204649-1.jpg",
    "http://img.geilicdn.com/open_1459286043171_386.jpg"
  ],
  titles: ["图片1", "图片3"],
  cate_id: "114263238",
  free_delivery: "0",
  remote_free_delivery: "0"
};
var public = {
  method: "vdian.item.add",
  access_token: "55ba1eaeb91d851408af80ebd94227bb000502344c",
  version: "1.1",
  format: "json"
};

var requestUrl =
  url + "?param=" + JSON.stringify(param) + "&public=" + JSON.stringify(public);

console.log(requestUrl);
