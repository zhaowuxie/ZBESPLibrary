require.config({
    paths : {
        jQuery : 'jquery/jquery.min',
        IScroll: 'jquery/iscroll',
        "bootstrapSlider": 'jquery/bootstrap-slider.min',
        "vue":"vue/vue.min",
        "vueRouter":"vue/vue-router.min",
        //"ELEMENT":"vue/ELEMENT",
        "MINT":"vue/mint-ui",
        "Vuex":"vue/vuex.min",
        "touch":"vue/vue-touch",
        "txt":"vue/text",
        'layer':'vue/layer',
        "base":"../app/js/base",
        "routers":"../app/js/router",
        'i18n':'vue/vue-i18n.min',
         "zh":"../lang/zh",
         "en":"../lang/en"
    },
    shim:{
        'layer':['jQuery'],
        'base':['jQuery','layer'],
        "bootstrapSlider": ['jQuery'],
    }
});
require(["IScroll", "jQuery", "bootstrapSlider", "vue", "vueRouter", "MINT", "base", "routers", "touch", "Vuex", "i18n", "zh", "en"],
    function(IScroll, $, bootstrapSlider, Vue, VueRouter, MINT, base, routers, touch, Vuex, VueI18n, zh, en) {
    Vue.use(VueRouter);
    //Vue.use(ELEMENT);
    Vue.use(MINT);
    Vue.use(touch);
    Vue.use(Vuex);
    Vue.use(VueI18n);
    document.oncontextmenu=new Function("event.returnValue=false");
    document.onselectstart=new Function("event.returnValue=false");
    var router = new VueRouter({
        routes: routers
    });

    router.beforeEach(function(to, from, next) {
        var userInfo = window.espmesh.userLoadLastLogged();
        userInfo = JSON.parse(userInfo);
        if(userInfo != null && userInfo != "" && userInfo.status == 0){//如果有就直接到首页咯
            next();
        } else {
            if(to.path == "/login"){//如果是登录页面路径，就直接next()
                next();
            } else if (to.path == "/register") {
                next();
            } else{//不然就跳转到登录；
                next({
                    path: "/login",
                    query: { redirect: to.fullPath }//把要跳转的地址作为参数传到下一步
                });
            }

        }
    });
    var store = new Vuex.Store({
        state: {
            deviceList: [],
            groupList: [],
            mixList: [],
            deviceInfo: "",
            userName: "",
            searchName:"",
            scanDeviceList: [],
            conScanDeviceList: [],
            siteList: [],
            wifiInfo: "",
            rssiInfo: -80
        },
        mutations: {
            setList: function(state, list){
                state.deviceList = list;
            },
            setGroupList: function(state, list){
                state.groupList = list;
            },
            setRecentList: function(state, list){
                state.mixList = list;
            },
            setUserName: function(state, name){
                state.userName = name;
            },
            setDeviceInfo: function(state, info){
                state.deviceInfo = info;
            },
            setWifiInfo: function(state, info){
                state.wifiInfo = info;
            },
            setScanDeviceList: function(state, info){
                state.scanDeviceList = info;
            },
            setConScanDeviceList: function(state, info){
                state.conScanDeviceList = info;
            },
            setSiteList: function(state, info){
                state.siteList = info;
            },
            setRssi: function(state, info){
                state.rssiInfo = info;
            }
        }
    });
    var i18n = new VueI18n({
        locale: "zh",
        messages: {
            'zh': zh.m,   // 中文语言包
            'en': en.m    // 英文语言包
        }
    })
    var app = new Vue({
        el: "#app",
        i18n: i18n,
        store: store,
        router: router,
        mounted: function() {
            var res = window.espmesh.getLocale();
            res = JSON.parse(res);
            if (res.language == "zh") {
                this.$i18n.locale = "zh";
            } else {
                this.$i18n.locale = "en";
            }
        }
    });
});
