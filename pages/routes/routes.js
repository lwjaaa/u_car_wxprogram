//logs.js
let util = require('../../utils/util.js');
let wechat = require("../../utils/wechat");
let amap = require("../../utils/amap");
var app = getApp();
Page({
  data: {
    loading:false,
    cindex: "0",
    types: ["getDrivingRoute", "getWalkingRoute", "getTransitRoute", "getRidingRoute"],
    markers: [],
    polyline: [],
    distance: '',
    distance_data: '',
    cost: '',
    cost_data: '',
    time: '',
    time_data: '',
    transits: [],
    city: "",
    name: "",
    startname: "",
    desc: "",
    friend:{
      payphone: '',
      payname: '',
    },
  },
  onLoad(e) {
    this.setData({
      loading: true
    })
    wx.showLoading();  //加载
    let { latitude, longitude, latitude2, longitude2, city, name, startname, desc } = e;
    let markers = [
      {
        iconPath: "/images/mapicon_navi_s.png",
        id: 0,
        latitude,
        longitude,
        width: 23,
        height: 33
      }, {
        iconPath: "/images/mapicon_navi_e.png",
        id: 1,
        latitude: latitude2,
        longitude: longitude2,
        width: 24,
        height: 34
      }
    ];

    this.setData({
      latitude, longitude, latitude2, longitude2, markers, city, name,startname, desc
    });
    this.getRoute();
    this.setData({
      loading: false
    })
    wx.hideLoading();  //加载
  },
  changeType(e) {
    let { id } = e.target.dataset;
    let { cindex } = this.data;
    if (id == cindex) return;
    this.setData({ cindex: id });
    this.getRoute();
  },
  getRoute() {
    let { latitude, longitude, latitude2, longitude2, types, cindex, city } = this.data;
    let type = types[cindex];
    let origin = `${longitude},${latitude}`;
    let destination = `${longitude2},${latitude2}`;
    amap.getRoute(origin, destination, type, city)
      .then(d => {
        // console.log(d);
        this.setRouteData(d, type);
      })
      .catch(e => {
        console.log(e);
      })
  },
  setRouteData(d, type) {
    if (type != "getTransitRoute") {
      let points = [];
      if (d.paths && d.paths[0] && d.paths[0].steps) {
        let steps = d.paths[0].steps;
        wx.setStorageSync("steps", steps);
        steps.forEach(item1 => {
          let poLen = item1.polyline.split(';');
          poLen.forEach(item2 => {
            let obj = {
              longitude: parseFloat(item2.split(',')[0]),
              latitude: parseFloat(item2.split(',')[1])
            }
            points.push(obj);
          })
        })
      }
      this.setData({
        polyline: [{
          points: points,
          color: "#0091ff",
          width: 6
        }]
      });
    }
    else {
      if (d && d.transits) {
        let transits = d.transits;
        transits.forEach(item1 => {
          let { segments } = item1;
          item1.transport = [];
          segments.forEach((item2, j) => {
            if (item2.bus && item2.bus.buslines && item2.bus.buslines[0] && item2.bus.buslines[0].name) {
              let name = item2.bus.buslines[0].name;
              if (j !== 0) {
                name = '--' + name;
              }
              item1.transport.push(name);
            }
          })
        })
        this.setData({ transits });
      }
    }
    if (type == "getDrivingRoute") {
      console.log("车程：",d.paths[0]);
      if (d.paths[0] && d.paths[0].distance) {
        this.setData({
          distance: '距离约' + d.paths[0].distance + '米',
          distance_data: d.paths[0].distance
        });
      }
      if (d.taxi_cost) {
        this.setData({
          cost: '车费约' + parseInt(d.taxi_cost) + '元',
          time: '时间约' + parseInt(d.paths[0].duration / 60) + '分钟',
          cost_data: parseInt(d.taxi_cost),
          time_data: parseInt(d.paths[0].duration / 60)
        });
      }
    }
    else if (type == "getWalkingRoute" || type == "getRidingRoute") {
      if (d.paths[0] && d.paths[0].distance) {
        this.setData({
          distance: '距离：' + d.paths[0].distance + '米'
        });
      }
      if (d.paths[0] && d.paths[0].duration) {
        this.setData({
          cost: parseInt(d.paths[0].duration / 60) + '分钟'
        });
      }
    }
    else if (type == "getRidingRoute") {

    }
  },
  
  goDetail() {
    let url = `/pages/info/info`;
    wx.navigateTo({ url });
  },
  nav() {
    let { latitude2, longitude2, name, desc } = this.data;
    wx.openLocation({
      latitude: +latitude2,
      longitude: +longitude2,
      name,
      address: desc
    });
  },
  toAddinfo(){
    console.log("帮朋友叫");
    let url =`../../pages/helpFriends/helpFriends`;
    wx.navigateTo({ url }) ;
  },
  showFriendInfo(data) {
    console.log("index-showFriendInfo(data):{}",data);
    console.log("index-showFriendInfo(payphone):{}",data.payphone);
    let { payphone, payname } = data;
    this.setData({
      friend: { payphone, payname }
    })
  },
  clearFriend(){
    this.setData({
      friend:{
        payphone: '',
        payname: '',
      }
    });
    wx.showToast({ // 显示Toast
      title: '清除成功',
      icon: 'success',
      duration: 1000
    });
    // wx.hideToast() // 隐藏Toast
  },
  callCarer(){
    var nickname = app.gloableData.nickname;
    var mobilePhone = app.gloableData.mobilePhone;
    var that = this;
    console.log("1111:",nickname)
    if(!nickname){
      wx.showModal({
        title: '未登录',
        content: '请先登录，再进行操作',
        success: function (res) {
          if (res.confirm) {
            let url =`/pages/user/user`;
            wx.switchTab({ url }) ;
          } else {
            console.log('取消')
          }
        }
      })
    }else{
      if(!mobilePhone){
        console.log("清先获取手机号")
      }

      //将订单信息存储到数据库
      wx.request({
        url: app.gloableData.baseUrl + '/order/addOrder', //写自己的服务器
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST",
        data: {
          openId: app.gloableData.openid,
          startPlace: that.data.startname,
          endPlace: that.data.name,
          distance: that.data.distance_data,
          costAmt: that.data.cost_data,
          costTime: that.data.time_data,
          mobilePhone:app.gloableData.mobilePhone,
          orderStatus: '00' //订单状态 00-未接单 01-已接单 02-取消 03-执行中 04-执行完成 05-未支付 06-已支付
        },
        success: function (s_da) {
          console.log(s_da)
          console.log(s_da.data.message)
          if(s_da.data.code != 200){
            console.log("保存失败")
          }else{
            console.log("保存成功")
          }
        },
        fail: function () {
          console.log("保存失败")
        }
      })

      console.log("呼叫代驾");
      let { friend } = this.data;
      let { payphone, payname } = friend;
      let url =`../../pages/callcar/callcar?payname=${payname}`;
      wx.navigateTo({ url }) ;
    }
  },

  getPhoneNumber: function (e) {
    var that = this;
    console.log("手机号加密信息：",e);
    console.log(e.detail.errMsg == "getPhoneNumber:ok");
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      // wx.request({
      //   url: 'http://localhost/index/users/decodePhone',
      //   data: {
      //     encryptedData: e.detail.encryptedData,
      //     iv: e.detail.iv,
      //     sessionKey: that.data.session_key,
      //     uid: "",
      //   },
      //   method: "post",
      //   success: function (res) {
      //     console.log(res);
      //   }
      // })
    }
  },

});
