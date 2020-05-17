// pages/buy/buy.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsId: NaN, //商品id
    orderPrice: 0,
    price: 0,
    number: 0,
    params: null,
    default_address: null,
    yun_price: "0.00",
    pay_price: "0.00",
    total_price: "0.00",
    discount: "0.00",
    promotionList: [{
        id: 1,
        desc: '满30-30'
      },
      {
        id: 2,
        desc: '满70-40'
      }, {
        id: 3,
        desc: '满110-60'
      }, 
      // {
      //   id: 4,
      //   desc: '免运费'
      // }, {
      //   id: 5,
      //   desc: '满两双-10元'
      // }, {
      //   id: 6,
      //   desc: '满三双-20'
      // }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getWashShoesPrice();
    this.getCartList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  // 获取洗鞋价格 
  getWashShoesPrice: function() {
    var that = this;
    wx.request({
      url: app.buildUrl("/food/search"),
      header: app.getRequestHeader(),
      success: function(res) {
        console.log('res', res);
        var resp = res.data;
        if (resp.code != 200) {
          app.alert({
            'con  tent': resp.msg
          });
          return;
        }
        let goods = resp.data.list[0];
        let _price = goods.price;
        let goodsId = goods.id;
        that.setData({
          price: _price,
          goodsId: goodsId
        })
      }
    })
  },

  // 选择地址
  chooseAddress: function() {
    console.log('chooseAddress')
    // TODO: 判断是选择地址页面还是地址管理页
    wx.navigateTo({
      url: '/pages/my/addressList',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  // 去我的页面 
  toMe: function() {
    wx.redirectTo({
      url: '/pages/my/index',
    })
  },

  // 去我的首页
  toHome: function() {
    wx.redirectTo({
      url: '/pages/main/main',
    })
  },

  // 减数量
  minusNum: function() {
    let _number = this.data.number;
    console.log('_number', _number)
    if (_number > 1) {
      _number--;
      this.setCart(_number)
      this.setData({
        number: _number
      })
    }
  },

  // 加商品
  addNum: function() {
    let _number = this.data.number;
    _number++;
    this.setCart(_number)
    this.setData({
      number: _number
    })
  },

  setPageData: function(saveHidden, total, allSelect, noSelect, list) {
    this.setData({
      list: list,
      saveHidden: saveHidden,
      totalPrice: total,
      allSelect: allSelect,
      noSelect: noSelect,
    });
  },

  getCartList: function() {
    var that = this;
    wx.request({
      url: app.buildUrl("/cart/index"),
      header: app.getRequestHeader(),
      success: function(res) {
        var resp = res.data;
        if (resp.code != 200) {
          app.alert({
            "content": resp.msg
          });
          return;
        }

        let {
          number,
          active
        } = resp.data.list[0]
        if (active) {
          that.setData({
            number: number,
            totalPrice: 0.00,
          });
        } else [
          that.setData({
            number: 0
          })
        ]

        that.getOrderInfo();
      }
    });
  },
  setCart: function(number) {
    var that = this;
    let _id = this.data.goodsId;
    if (!_id) {
      app.alert({
        "content": '操作失败'
      });
      return;
    }
    var data = {
      "id": _id,
      "number": number
    };
    wx.request({
      url: app.buildUrl("/cart/set"),
      header: app.getRequestHeader(),
      method: 'POST',
      data: data,
      success: function(res) {}
    });
  },

  getOrderInfo: function() {
    var that = this;
    let _goods = [{
      id: that.data.goodsId,
      price: that.data.price,
      number: that.data.number
    }]
    var _data = {
      type: 'cart',
      goods: JSON.stringify(_goods)
    };
    wx.request({
      url: app.buildUrl("/order/info"),
      header: app.getRequestHeader(),
      method: 'POST',
      data: _data,
      success: function(res) {
        var resp = res.data;
        if (resp.code != 200) {
          app.alert({
            "content": resp.msg
          });
          return;
        }

        console.log(' resp.data.default_address', resp.data.default_address)

        that.setData({
          goods_list: resp.data.food_list,
          default_address: resp.data.default_address,
          yun_price: resp.data.yun_price,
          pay_price: resp.data.pay_price,
          total_price: resp.data.total_price,
        });

        if (that.data.default_address) {
          that.setData({
            express_address_id: that.data.default_address.id
          });
        }
      }
    });
  },
  // 生成订单
  createOrder: function(e) {
    wx.showLoading();
    var that = this;
    let _goods = [{
      id: that.data.goodsId,
      price: that.data.price,
      number: that.data.number
    }]
    var data = {
      type: 'cart',
      goods: JSON.stringify(_goods),
      express_address_id: that.data.default_address.id
    };
    wx.request({
      url: app.buildUrl("/order/create"),
      header: app.getRequestHeader(),
      method: 'POST',
      data: data,
      success: function(res) {
        wx.hideLoading();
        var resp = res.data;
        if (resp.code != 200) {
          app.alert({
            "content": resp.msg
          });
          return;
        }
        wx.navigateTo({
          url: "/pages/my/order_list"
        });
      }
    });
  },
  // 去下单
  toPayOrder: function() {
    this.createOrder()
  }
})