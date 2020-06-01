var app = getApp();
Page({
    data: {
        order_list: [],
        statusType: ["待付款", "待自主发货", "运输清洗", "待评价", "已完成", "已关闭"],
        // statusType: ["全部订单", "已完成"],
        status: ["-8", "-7", "-6", "-5", "1", "0"],
        currentType: 0,
        tabClass: ["", "", "", "", "", ""],
        storeList: [],
        logisticCode: '90c02a2bfd7e366e435759ac69b8a692'
    },
    showModal(e) {
        this.setData({
            modalName: e.currentTarget.dataset.target,
            logisticCode: ''
        })
    },
    hideModal(e) {
        this.setData({
            modalName: null,
            logisticCode: ''
        })
    },
    statusTap: function (e) {
        console.log('e', e)
        var curType = e.currentTarget.dataset.index;
        console.log('curType', curType)
        this.setData({
            currentType: curType
        });
        this.getPayOrder();
    },
    orderDetail: function (e) {
        wx.navigateTo({
            url: "/pages/my/order_info?order_sn=" + e.currentTarget.dataset.id
        })
    },
    onLoad: function (options) {
        // 生命周期函数--监听页面加载
    },
    onShow: function () {
        this.getPayOrder();
        this.getStoreList();
    },
    orderCancel: function (e) {
        this.orderOps(e.currentTarget.dataset.id, "cancel", "确定取消订单？");
    },
    // 获取门店信息
    getStoreList: function () {
        var that = this;
        wx.request({
            url: app.buildUrl("/store/index"),
            header: app.getRequestHeader(),
            success: function (res) {
                var resp = res.data;
                if (resp.code != 200) {
                    app.alert({
                        'content': resp.msg
                    });
                    return;
                }
                that.setData({
                    storeList: resp.data.list
                })
            }
        })
    },
    getPayOrder: function () {
        var that = this;
        wx.request({
            url: app.buildUrl("/my/order"),
            header: app.getRequestHeader(),
            data: {
                status: that.data.status[that.data.currentType]
            },
            success: function (res) {
                var resp = res.data;
                if (resp.code != 200) {
                    app.alert({
                        "content": resp.msg
                    });
                    return;
                }
                let storeInfo = null;
                // 待自主发货
                if (that.data.currentType == 1) {
                    let _storeId = resp.data.pay_order_list[0] ? resp.data.pay_order_list[0].store_id : -1;
                    storeInfo = _storeId > -1 ? that.data.storeList[_storeId] : null;
                }

                console.log(that.data.currentType, storeInfo, that.data.storeList, resp.data.pay_order_list[0])
                that.setData({
                    order_list: resp.data.pay_order_list,
                    storeInfo: storeInfo
                });
            }
        });
    },
    toPay: function (e) {
        var that = this;
        wx.request({
            url: app.buildUrl("/order/pay"),
            header: app.getRequestHeader(),
            method: 'POST',
            data: {
                order_sn: e.currentTarget.dataset.id
            },
            success: function (res) {
                var resp = res.data;
                if (resp.code != 200) {
                    app.alert({
                        "content": resp.msg
                    });
                    return;
                }
                var pay_info = resp.data.pay_info;
                wx.requestPayment({
                    'timeStamp': pay_info.timeStamp,
                    'nonceStr': pay_info.nonceStr,
                    'package': pay_info.package,
                    'signType': 'MD5',
                    'paySign': pay_info.paySign,
                    'success': function (res) {
                        console.log('res', res)
                    },
                    'fail': function (res) {
                        console.log('res', res)
                    }
                });
            }
        });
    },
    orderConfirm: function (e) {
        this.orderOps(e.currentTarget.dataset.id, "confirm", "确定收到？");
    },
    orderComment: function (e) {
        wx.navigateTo({
            url: "/pages/my/comment?order_sn=" + e.currentTarget.dataset.id
        });
    },
    orderOps: function (order_sn, act, msg) {
        var that = this;
        var params = {
            "content": msg,
            "cb_confirm": function () {
                wx.request({
                    url: app.buildUrl("/order/ops"),
                    header: app.getRequestHeader(),
                    method: 'POST',
                    data: {
                        order_sn: order_sn,
                        act: act
                    },
                    success: function (res) {
                        var resp = res.data;
                        app.alert({
                            "content": resp.msg
                        });
                        if (resp.code == 200) {
                            that.getPayOrder();
                        }
                    }
                });
            }
        };
        app.tip(params);
    },
    copyBtn: function () {
        var that = this;
        wx.setClipboardData({
            //准备复制的数据
            data: that.data.storeInfo.name + " " + that.data.storeInfo.mobile + ' ' + that.data.storeInfo.summary,
            success: function (res) {
                wx.showToast({
                    title: '复制成功',
                });
            }
        });
    },
    textInput(e) {
        console.log(e.detail.value)
        this.setData({
            logisticCode: e.detail.value
        })
    },
    confirmLogistic: function (e) {
        console.log('e', e)
        let that = this;
        if(!that.data.logisticCode){
            return
        }else{
            wx.request({
                url: app.buildUrl("/order/updateLogisticCode"),
                header: app.getRequestHeader(),
                method: 'POST',
                data: {
                    order_sn: e.currentTarget.dataset.id,
                    logisticCode: that.data.logisticCode
                },
                success: function (res) {
                    var resp = res.data;
                    if (resp.code != 200) {
                        app.alert({
                            "content": resp.msg
                        });
                        return;
                    }else{
                        that.setData({
                            modalName: null,
                            logisticCode: '',
                            currentType: 2
                        })
                        this.getPayOrder();
                    }
                }
            })
        }
    },
});