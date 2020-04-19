//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    remind: '加载中',
    angle: 0,
    userInfo: {},
    regFlag: true
  },
  goToIndex: function () {
    wx.switchTab({
      url: '/pages/food/food',
    });
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    this.checkLogin();
  },
  checkLogin: function () {
    var that = this;
    wx.login({
      success: function (res) {
        if (!res.code) {
          app.alert({ 'content': '登录失败，请再次点击~~' });
          return;
        }
        wx.request({
          url: app.buildUrl('/member/check-reg'),
          header: app.getRequestHeader(),
          method: 'POST',
          data: { code: res.code },
          success: function (res) {
            if (res.data.code != 200) {
              that.setData({
                regFlag: false
              });
              return;
            }

            app.setCache("token", res.data.data.token);
            //that.goToIndex();
          }
        });
      }
    });
  },
  login: function (e) {
    var that = this;
    if (!e.detail.userInfo) {
      app.alert({ 'content': '登录失败，请再次点击~~' });
      return;
    }

    var data = e.detail.userInfo;
    wx.login({
      success: function (res) {
        if (!res.code) {
          app.alert({ 'content': '登录失败，请再次点击~~' });
          return;
        }
        data['code'] = res.code;
        wx.request({
          url: app.buildUrl('/member/login'),
          header: app.getRequestHeader(),
          method: 'POST',
          data: data,
          success: function (res) {
            if (res.data.code != 200) {
              app.alert({ 'content': res.data.msg });
              return;
            }
            app.setCache("token", res.data.data.token);
            that.goToIndex();
          }
        });
      }
    });
  }
})
