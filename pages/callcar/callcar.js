let app = getApp();
let wechat = require("../../utils/wechat");
let amap = require("../../utils/amap");
let util = require("../../utils/util");

Page({
  data: {
    time: '',
    nowtime: '',
    now: '',
    info: '',
    payname: '',
    Lasttime: '',
    orderInfos: []
  },
  onLoad(e) {
    // var now = util.formatTime(new Date());
    var now = new Date();
    let { payname } = e;
    this.setData({
      now,
      payname
    })
   this.getTime();
   this.getTiming(); //定时
   this.getRemaining(); //获取剩余时间
   this.getOrderInfos(); //获取订单信息
  },
  getTime(){
    var that = this;
    that.interTime = setInterval(function () {
      var currentTime = util.formatTime(new Date());
      that.setData({
        nowtime:currentTime
     })
    }, 1000)
  },
  onTime(){
    setInterval(getTime(),1000); 
  },
  getTiming() {
    var that = this;
    //开启定时 1s 执行一下
    that.interTiming = setInterval(function () {
      wx.showLoading({
        title: '寻找司机中。。'
      });
      // var currentTime = util.formatTime(new Date());
      var currentTime = new Date();
      var waitingTime = new Date(currentTime-that.data.now+ 16 * 3600 * 1000)
      var subTime = util.formatTimeH(waitingTime);
      that.setData({
       time:subTime
     })
    }, 1000)
  },
  getRemaining(){
    var that = this;
    //开启下一个定时
    that.interRemaining = setInterval(function () {
      //关闭定时
      clearInterval(that.interTiming);
      clearInterval(that.interRemaining);
      wx.hideLoading();
      wx.showModal({
        title: '接单成功',
        content: 'xx司机为您服务',
        cancelColor: 'cancelColor',
        success: function (res) {
          console.log(res);
          if (res.confirm) {

          }
        }
      })
      that.setData({
        info:'您好，xx司机已接单，稍后会电话联系，请等待。。。'
     })
    }, 10000);
  },

  //获取新订单信息
  getOrderInfos(){
    var that = this;
    wx.request({
      url: app.gloableData.baseUrl + '/order/findNewOrder', //长度1024字节
      data: {
        openId: app.gloableData.openid
      },
      success: function (s_da) {
        console.log(s_da.data.data)
        if(s_da.data.code != 200){
          console.log("查询新订单失败")
        }else{
          that.setData({
            orderInfos: s_da.data.data
         })
        }
      },
      fail: function () {
        console.log("查询新订单失败")
      }

    })


  }

})