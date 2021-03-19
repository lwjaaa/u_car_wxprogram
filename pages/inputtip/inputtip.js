//logs.js
let util = require('../../utils/util.js');
let wechat = require("../../utils/wechat");
let amap = require("../../utils/amap");
Page({
  data: {
    loading:false,
    markers: [],
    lonlat: "",
    city: "",
    tips: []
  },
  onLoad(e) {
    console.log("inputid-onLoad:{}",e);
    let { lonlat, city } = e;
    this.setData({
      lonlat, city
    })
  },
  bindInput(e) {
    console.log("inputid-bindInput:{}",e);
    // this.setData({
    //   loading:true
    // });
    wx.showLoading({
      title: '加载中请稍后',
    });
    let { value } = e.detail;
    let { lonlat, city } = this.data;
    amap.getInputtips(city, lonlat, value)
      .then(d => {
        console.log("inputid-bindInput(amap.getInputtips):{}",d);
        if (d && d.tips) {
          this.setData({
            tips: d.tips
          });
        }
        if(d.tips.length == 0){
          wx.showToast({
            title: '未查询到地点，请重新输入',
            icon: 'none',
            duration:3000

          })
        }
      })
      .catch(e => {
        console.log(e);
      })
      // this.setData({
      //   loading:false
      // });
      wx.hideLoading();
  },
  bindSearch_old(e) {  //原本方法
    console.log("inputid-bindSearch:{}",e);    
    let { keywords } = e.target.dataset;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];  //上一个页面
    console.log("inputid-bindSearch(pages):{}",pages); 
    console.log("inputid-bindSearch(prevPage):{}",prevPage); 
    if (keywords) {
      prevPage.setData({ keywords });
      amap.getPoiAround(keywords)
        .then(d => {
          console.log("inputid-bindSearch(amap.getPoiAround):{}",d); 
          let { markers } = d;
          markers.forEach(item => {
            item.iconPath = "/images/marker.png";
          })
          prevPage.setData({ markers });
          prevPage.showMarkerInfo(markers[0]);
          prevPage.changeMarkerColor(0);
        })
        .catch(e => {
          console.log(e);
        })
    }
    let url =`/pages/index/index`;
    wx.switchTab({ url })
  },

  bindSearch(e) {  //新方法
    wx.showLoading({
      title: '加载中请稍后',
    });
    this.setData({
      tips: []
    });
    console.log("inputid-bindSearch:{}",e);    
    let { keywords } = e.target.dataset;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];  //上一个页面
    console.log("inputid-bindSearch(pages):{}",pages); 
    console.log("inputid-bindSearch(prevPage):{}",prevPage); 
    if (keywords) {
      prevPage.setData({ keywords });
      amap.getPoiAround(keywords)
        .then(d => {
          console.log("inputid-bindSearch(amap.getPoiAround):{}",d); 
          let { markers } = d;
          markers.forEach(item => {
            item.iconPath = "/images/marker.png";
          })
          this.setData({ markers });
          prevPage.setData({ markers });
          // prevPage.showMarkerInfo(markers[0]);
        })
        .catch(e => {
          console.log(e);
        })
    }
    // let url =`/pages/index/index`;
    // wx.switchTab({ url })
    wx.hideLoading();
  },
  makertapthis(e) {
    wx.showLoading({
      title: '加载中请稍后',
    });
    console.log("inputid-makertapThis(e):{}",e);
    console.log("inputid-makertapThis(markerid):{}",e.currentTarget.dataset);
    let { markerid } = e.currentTarget.dataset;
    let { markers } = this.data;
    let marker = markers[markerid];
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];  //上一个页面
    console.log("inputid-makertap(marker):{}",marker);
    prevPage.showMarkerInfo(marker);

    let url =`/pages/index/index`;
    wx.switchTab({ url })
    wx.hideLoading();
  },





});
