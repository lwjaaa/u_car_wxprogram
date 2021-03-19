//app.js
let wechat = require('./utils/wechat.js');
App({
  onLaunch() {
  },
  onShow(){
    
  },
  onError(error){
    console.log("error:",error);
    wx.showModal({
      title: '请联系管理解决',
      content: error
      // confirmText: '主操作',
      // cancelText: '次要操作',
      // success: function(res) {
      //   if (res.confirm) {
      //     console.log('用户点击主操作')
      //   } else if (res.cancel) {
      //     console.log('用户点击次要操作')
      //   }
      // }
    })
  },
  gloableData:{
    // AppID: 'wx052a3fdb53e249e4',
    userAuth: '', //用户权限 01-管理员 02-用户 03-司机
    mobilePhone: '',  //手机号
    openid: '',
    session_key: '',
    nickname: '',
    thumb: '',  //头像路径
    baseUrl: 'http://localhost:9099/driving-agent'
  }
})
