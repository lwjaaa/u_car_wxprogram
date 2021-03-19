// page/component/new-pages/user/user.js
var app = getApp();
Page({
  data: {
    openid: '',
    session_key: '',
    thumb: '',
    nickname: '',
    login: '登录',
    orders: [],
    hasAddress: false,
    address: {}
  },

  //（待做：自动刷新）
  onLoad() {
    console.log('app', app)
    var that = this;
    that.setData({
      thumb: app.gloableData.thumb,
      nickname: app.gloableData.nickname
    })
  },
  getUserInfo(res) {
    console.log(res);
    var self = this;
    wx.setStorageSync('userinfo', res);
    app.gloableData.thumb = res.detail.userInfo.avatarUrl;
    app.gloableData.nickname = res.detail.userInfo.nickName;
    self.setData({
      thumb: res.detail.userInfo.avatarUrl,
      nickname: res.detail.userInfo.nickName,
      login: ''
    });
    //登录，获取code
    wx.login({
      success(res_login) {
        console.log("登录信息");
        console.log(res_login.code);
        //获取 AppSecret
        wx.request({ //request默认超时时间是60秒
          url: app.gloableData.baseUrl + '/app/getOpenId', //长度1024字节
          data: {
            js_code: res_login.code
          },
          success: function (res_Secret) {
            console.log(res_Secret) // 服务器回包信息  statusCode 状态码
            console.log(res_Secret.data) // 服务器回包信息  statusCode 状态码
            self.setData(res_Secret.data);
            app.gloableData.openid=res_Secret.data.openid;
            app.gloableData.session_key=res_Secret.data.session_key;

            //将登录用户信息添加到数据中
            wx.request({
              url: app.gloableData.baseUrl + '/sys_user/addUser', //写自己的服务器
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              data: {
                openId: self.data.openid,
                nickName: self.data.nickname,
                avatarUrl: self.data.thumb,
                gender: res.detail.userInfo.gender,
                country: res.detail.userInfo.country,
                province: res.detail.userInfo.province,
                city: res.detail.userInfo.city,
                language: res.detail.userInfo.language,
                userAuth: '02', //用户权限 01-管理员 02-用户 03-司机
                userStatus: '01' //用户状态 01-正常 02-禁止
              },
              success: function (s_da) {
                console.log(s_da)
                console.log(s_da.data.message)
                if(s_da.data.code != 200){
                  console.log("保存失败")
                }else{
                  app.gloableData.userAuth = '02';  //<用户权限>
                }
              },
              fail: function () {
                console.log("保存失败")
              }
            })

          }
        })
      }
    })
  }



})