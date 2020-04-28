// pages/buy/buy.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderPrice: 0,
    freight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getBannerAndCat();
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

  getBannerAndCat: function() {
    var that = this;
    wx.request({
      url: app.buildUrl("/food/index"),
      header: app.getRequestHeader(),
      success: function(res) {
        console.log('res', res)
        var resp = res.data;
        if (resp.code != 200) {
          app.alert({
            'con  tent': resp.msg
          });
          return;
        }
        that.setData({
          banners: resp.data.banner_list,
          categories: resp.data.cat_list
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
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})