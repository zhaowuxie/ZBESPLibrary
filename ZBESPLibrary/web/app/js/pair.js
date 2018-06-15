define(["vue", "MINT", "txt!../../pages/pair.html", "../js/setPair" ],
    function(v, MINT, pair, setPair) {

    var Pair = v.extend({

        template: pair,

        data: function(){
            return {
                flag: false,
                showAdd: false,
                pairList: [],
                pairShow: false,
                pairInfo: null,
                deviceList: [],
            }
        },
        methods:{
            show: function () {
                var self = this;
                self.onBackPair();
                self.deviceList = self.$store.state.deviceList;
                self.getPair();
                if (self.pairList.length == 0) {
                    self.showAdd = true;
                } else {
                    self.showAdd = false;
                }
                this.flag = true;
            },
            hide: function () {
                this.$emit("pairShow");
                this.flag = false;
            },
            hideInfo: function() {
                this.pairShow = false;
                this.pairInfo = "";
                this.onBackPair();
            },
            onBackPair: function () {
                this.getPair();
                window.onBackPressed = this.hide;
            },
            addPair: function () {
                var self = this;
                self.pairInfo = null;
                setTimeout(function(){
                    self.$refs.setPair.show();
                });
            },
            getPair: function() {
                var self = this,
                    pairs = window.espmesh.loadHWDevices();
                if (!self._isEmpty(pairs)) {
                    self.pairList = JSON.parse(pairs);
                }
                if (self.pairList.length > 0) {
                    self.showAdd = false;
                } else {
                    self.showAdd = true;
                }
                self.$store.commit("setSiteList", self.pairList);
            },
            showPairOperate: function(e) {
                var self = this,
                    mac = $(e.target).attr("data-mac");
                $.each(self.pairList, function(i, item) {
                    if (item.mac == mac) {
                        self.pairInfo = item;
                        return false;
                    }
                });
                window.onBackPressed = self.hideInfo;
                setTimeout(function(){
                    self.pairShow = true;
                })
            },
            editPair: function() {
                this.pairShow = false;
                this.$refs.setPair.show();
            },
            delPair: function() {
                var self = this, flag = false,
                    mac = self.pairInfo.mac;
                MINT.MessageBox.confirm(self.$t('delInfoDesc'), self.$t('delInfoTitle')).then(function(action) {
                    self.hideInfo();
                    MINT.Indicator.open();
                    $.each(self.deviceList, function(i,item) {
                        if (item.mac == mac) {
                            flag = true;
                            return false;
                        }
                    })
                    setTimeout(function() {
                        if (flag) {
                            var delFlag = self.setDevicePosition(mac);
                            if (delFlag) {
                                MINT.Toast({
                                    message: self.$t('delSuccessDesc'),
                                    position: 'bottom',
                                    duration: 2000
                                });
                            } else {
                                MINT.Toast({
                                    message: self.$t('delFailDesc'),
                                    position: 'bottom',
                                    duration: 2000
                                });
                            }
                        } else {
                            window.espmesh.deleteHWDevice(mac);
                            $.each(self.pairList, function(i, item) {
                                if (item.mac == mac) {
                                    self.pairList.splice(i, 1);
                                    return false;
                                }
                            })
                            MINT.Toast({
                                message: self.$t('delSuccessDesc'),
                                position: 'bottom',
                                duration: 2000
                            });
                        }
                        MINT.Indicator.close();
                        if (self.pairList.length <= 0) {
                            self.showAdd = true;
                        }
                    }, 1000);
                });
            },
            setDevicePosition: function(mac) {
                var self = this, flag = false,
                    data = '{"' + MESH_MAC + '": "' + mac + '","' + MESH_REQUEST + '": "' + SET_POSITION + '",' +
                                                '"position":""}';
                var res = window.espmesh.requestDevice(data);
                res = JSON.parse(res);
                if (res.status_code == 0) {
                    flag = true;
                    $.each(self.deviceList, function(i, item){
                        if (item.mac == mac) {
                            item.position = "";
                            self.deviceList.splice(i, 1, item);
                            return false;
                        }
                    });
                    window.espmesh.deleteHWDevice(mac);
                    $.each(self.pairList, function(i, item) {
                        if (item.mac == mac) {
                            self.pairList.splice(i, 1);
                            return false;
                        }
                    })
                }
                self.$store.commit("setList", self.deviceList);
                return flag;
            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            },
        },
        components: {
            "v-setPair": setPair,
        }

    });
    return Pair;
});