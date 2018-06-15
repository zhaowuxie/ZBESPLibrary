define(["vue", "MINT", "txt!../../pages/user.html", "../js/footer", "../js/set", "../js/userinfo",
    "../js/deviceType", "../js/selectDevice", "../js/scan", "../js/pair", "../js/pairList", "../js/debug"],
    function(v, MINT, user, footer, set, userinfo, deviceType, selectDevice, scan, pair, pairList, debug) {

    var User = v.extend({

        template: user,

        data: function(){
            return {
                user: "user",
                wifi: ""
            }
        },
        mounted: function() {
            var userInfo = window.espmesh.userLoadLastLogged();
            userInfo = JSON.parse(userInfo);
            this.$store.commit("setUserName", userInfo.username);
        },
        computed: {
            currentWifi: function () {
                var self = this;
                var wifiInfo = this.$store.state.wifiInfo;
                if (self._isEmpty(wifiInfo)) {
                    return self.$t('no')
                } else {
                    return wifiInfo.ssid;
                }

            },
        },
        methods:{
            setFun: function () {
                this.$refs.set.show();
            },
            infoFun: function () {
                this.$refs.info.show();
            },
            typeFun: function () {
                this.$refs.type.show();
            },
            scanFun: function () {
                 this.$refs.scan.show();
            },
            selectFun: function () {
                this.$refs.select.show();
            },
            pairFun: function () {
                this.$refs.pair.show();
            },
            pairListFun: function () {
                this.$refs.pairList.show();
            },
            bugFun: function () {
                this.$refs.debug.show();
            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            },
            onBackUser: function() {
                var startTime = 0;
                var self = this;
                window.onBackPressed = function () {
                    MINT.Toast({
                        message: self.$t('exitProgramDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    if (startTime == 0) {
                        startTime = new Date().getTime();
                    } else {
                        if (new Date().getTime() - startTime < 2000) {
                            window.espmesh.finish();
                        } else {
                            startTime = new Date().getTime();
                        }
                    }
                }
            }
        },
        components: {
            "v-footer": footer,
            "v-set": set,
            "v-userinfo": userinfo,
            "v-deviceType": deviceType,
            "v-selectDevice": selectDevice,
            "v-scan": scan,
            "v-pair": pair,
            "v-pairList": pairList,
            "v-debug": debug
        }

    });

    return User;
});