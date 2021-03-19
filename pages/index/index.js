//index.js
//获取应用实例
let app = getApp();
let wechat = require("../../utils/wechat");
let amap = require("../../utils/amap");
let markersData = [];
Page({
  data: {
    markers: [],
    latitude: '',
    thumb: '/images/titlep.png',
    nickname: '',
    longitude: '',
    textData: {},
    startPosiData: {},
    city: '',
    loading:false,
    markerId: 0,
    controls: [
      {
        id: 0,
        position: {
          left: 10,
          top: 200,
          width: 40,
          height: 40
        },
        iconPath: "/images/circle1.png",
        clickable: true
      }
    ]
  },
  onLoad(e) {
    wx.clearStorageSync(); //清除缓存
    var that = this;
    wx.getStorage({
      key: 'userinfo',
      success(res) {
        // console.log("用户信息：", res.data.detail.userInfo)
        app.gloableData.thumb = res.data.detail.userInfo.avatarUrl;
        app.gloableData.nickname = res.data.detail.userInfo.nickName;
        that.setData({
          thumb:getApp().gloableData.thumb,
          nickname:getApp().gloableData.nickname
        })
      }
    });
    wx.showLoading();  //显示加载
   
    amap.getRegeo()
      .then(d => {
        console.log("index-amap.getRegeo(d):{}",d);
        console.log(d);
        let {  name, desc, latitude, longitude } = d[0];
        let { city } = d[0].regeocodeData.addressComponent;
        this.setData({
          city,
          latitude,
          longitude,
          startPosiData: { startname:name, startdesc:desc}
          // textData: { name, desc }
        })
      })
      .catch(e => {
        console.log(e);
      });
      wx.hideLoading();
  },
  onPullDownRefresh: function() {
   var that = this;
    // 用户触发了下拉刷新操作
    that.setData({
      thumb:getApp().gloableData.thumb,
      nickname:getApp().gloableData.nickname
    })
    // 拉取新数据重新渲染界面
    amap.getRegeo()
      .then(d => {
        console.log("index-amap.getRegeo(d):{}",d);
        console.log(d);
        let {  name, desc, latitude, longitude } = d[0];
        let { city } = d[0].regeocodeData.addressComponent;
        this.setData({
          city,
          latitude,
          longitude,
          startPosiData: { startname:name, startdesc:desc}
          // textData: { name, desc }
        })
      })
      .catch(e => {
        console.log(e);
      })

    // wx.stopPullDownRefresh() // 可以停止当前页面的下拉刷新。

  },
  onShow(){
    var that = this;
    var thumb = app.gloableData.thumb == '' ? '/images/titlep.png' : app.gloableData.thumb;
    console.log("主页面加载onShow：",thumb);
    // 用户触发了下拉刷新操作
    that.setData({
      thumb:thumb,
      nickname:app.gloableData.nickname
    })
  },
  bindInput() {
    let { latitude, longitude, city } = this.data;
    let url = `/pages/inputtip/inputtip?city=${city}&lonlat=${longitude},${latitude}`;
    wx.navigateTo({ url });  //往当前页面栈多推入一个 inputtip
  },
  makertap(e) {
    console.log("index-makertap(e):{}",e);
    let { markerId } = e;
    let { markers } = this.data;
    let marker = markers[markerId];
    console.log("index-makertap(marker):{}",marker);
    this.showMarkerInfo(marker);
    this.changeMarkerColor(markerId);
  },
  makertapthis(e) {
    console.log("index-makertapThis(e):{}",e);
    console.log("index-makertapThis(markerid):{}",e.currentTarget.dataset);
    let { markerid } = e.currentTarget.dataset;
    let { markers } = this.data;
    let marker = markers[markerid];
    console.log("index-makertap(marker):{}",marker);
    this.showMarkerInfo(marker);
    this.changeMarkerColor(markerid);
  },
  showMarkerInfo(data) {
    console.log("index-showMarkerInfo(data):{}",data);
    console.log("index-showMarkerInfo(markers):{}",this.data.markers);
    let { name, address: desc } = data;
    this.setData({
      textData: { name, desc }
    })
  },
  changeMarkerColor(markerId) {
    console.log("index-changeMarkerColor:{}",markerId);
    let { markers } = this.data;
    markers.forEach((item, index) => {
      item.iconPath = "/images/marker.png";
      if (index == markerId) item.iconPath = "/images/marker_checked.png";
    })
    this.setData({ markers, markerId });
  },
  getRoute() {
    // 把按钮的loading状态显示出来
    this.setData({
      loading: true
    });
    wx.showLoading();  //显示加载
    // 起点
    let { latitude, longitude, markers, markerId, city, textData, startPosiData } = this.data;
    let { name, desc } = textData;
    let { startname, startdesc } = startPosiData;
    if(!name){
      wx.showToast({
        title: '请先填写终点地址',
        icon: 'none',
        duration:2000
      })
    }else{
      if (!markers.length) return;
      // 终点
      let { latitude: latitude2, longitude: longitude2 } = markers[markerId];
      let url = `/pages/routes/routes?longitude=${longitude}&latitude=${latitude}&longitude2=${longitude2}&latitude2=${latitude2}&city=${city}&name=${name}&startname=${startname}&desc=${desc}`;
      wx.navigateTo({ url });
      this.setData({
        loading: false
      })
      wx.hideLoading();  //隐藏加载
    }
  },
  clickcontrol(e) {
    console.log("回到用户当前定位点");
    let { controlId } = e;
    let mpCtx = wx.createMapContext("map");
    mpCtx.moveToLocation();
  },
  mapchange() {
    // console.log("改变视野");
  },
  // 调用远程服务
test(){
  wx.request({
    url: 'https://test.com/getinfo',  //长度1024字节
    method: "POST", //OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: { 'content-type': 'application/json'},  //json格式参数
    data: { id:1, version:'1.0.0' },
    success: function(res) {
      console.log(res)// 服务器回包信息
    }
  })
}
})

