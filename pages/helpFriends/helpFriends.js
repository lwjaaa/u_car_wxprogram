let app = getApp();
let wechat = require("../../utils/wechat");
let amap = require("../../utils/amap");

Page({
  data: {
    weather: {},
    friend:{
      payphone: '',
      payname: '',
    },
    alterMsg : "司机会直接联系乘客，请提前通知乘车人准备出行"
  },
  onLoad() {
    amap.getWeather()
      .then(d => {
        console.log(d);
        this.setData({
          weather: d
        });
      })
      .catch(e => {
        console.log(e);
      })
  },
  addInfo(e){
    console.log(this.data.friend);
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.showFriendInfo(this.data.friend);
    wx.navigateBack();
    wx.showToast({ // 显示Toast
      title: '添加成功',
      icon: 'success',
      duration: 1000
    })
  },
  payphone(e) { //监听input标签输入数据
    // console.log(e.detail.value)
    this.setData({
      friend:{
        payphone : e.detail.value,
        payname : this.data.friend.payname
      }
    });
    },
    payname(e) {
     this.setData({
      friend:{
        payphone : this.data.friend.payphone,
        payname : e.detail.value
      }
     });
    }



})