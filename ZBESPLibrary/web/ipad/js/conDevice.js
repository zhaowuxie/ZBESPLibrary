define(["vue", "MINT", "txt!../../pages/conDevice.html"], function(v, MINT, conDevice) {

    var ConDevice = v.extend({

        template: conDevice,
        props: {
            meshId: {
                type: String
            },
            wifiName: {
                type: String
            },
            password: {
                type: String
            }
        },
        data: function(){
            return {
                addFlag: false,
                value: 0,
                title: this.$t('connetDeviceTitle'),
                desc: this.$t('connetDeviceDesc'),
                textList: [],
                wifiInfo: {},
                count: 0,
                success: true
            }
        },
        methods:{
            show: function() {
                window.onBackPressed = this.hide;
                window.onConfigureProgress = this.onConfigureProgress;
                window.espmesh.stopBleScan();
                this.wifiInfo = this.$store.state.wifiInfo;
                this.addFlag = true;
                this.value = 0;
                this.count = 0;
                this.textList = [];
                this.conWifi();
            },
            hide: function () {
                this.addFlag = false;
                window.espmesh.stopConfigureBlufi();
                this.$emit("conShow");
            },
            conWifi: function () {
                var self = this,
                    scanDeviceList = self.$store.state.scanDeviceList,
                    scanMacs = [], rssi = -1000, rssiMac = "";
                window.espmesh.stopBleScan();
                self.success = true;
                self.title = self.$t('connetDeviceTitle');
                self.desc = self.$t('connetDeviceDesc');
                setTimeout(function () {
                    $.each(scanDeviceList, function(i, item) {
                        if (item.rssi > rssi) {
                            rssi = item.rssi;
                            rssiMac = item.mac;
                        }
                        scanMacs.push(item.mac);
                    });
                    window.espmesh.saveMeshId(self.meshId);
                    window.espmesh.startConfigureBlufi(rssiMac, self.wifiName, self.password, JSON.stringify(scanMacs),
                        JSON.stringify(self.convert(self.meshId)));
                }, 1000);

            },
            convert: function(bssid) {
                var strs = bssid.split(":"), meshIds = [];
                for (var i = 0; i < strs.length; i++ ) {
                    meshIds.push(parseInt(strs[i], 16));
                }
                return meshIds;
            },
            onConfigureProgress: function(config) {
                var self = this;
                console.log(config);
                config = JSON.parse(config);
                if (config.code >= 100 && config.code != 200) {
                    if (config.progress >= self.value) {
                        self.value = config.progress;
                    }
                    if (self.textList.indexOf(config.message) < 0) {
                        self.textList.push(config.message);
                    }
                    window.onConfigureProgress = self.onConfigureProgress;
                } else if (config.code == 200) {
                    self.value = config.progress;
                    if (self.textList.indexOf(config.message) < 0) {
                        self.textList.push(config.message);
                    }
                    self.desc = self.$t('connetSuccessDesc');
                    window.espmesh.stopBleScan();
                    window.espmesh.clearBleCache();
                    self.$store.commit("setScanDeviceList", []);
                    self.count = 0;
                    setTimeout(function() {
                        self.hide();
                        self.$parent.hideParent();
                    }, 1000);
                } else if (config.code == 1) {
                    self.setFail(self.$t('conRouteFailDesc'))
                } else if (config.code == 2) {
                    self.setFail(self.$t('pwdFailDesc'))
                } else {
                    self.setFail(config.message);

                }
            },
            setFail: function(msg) {
                var self = this;
                self.success = false;
                self.title = self.$t('connetFailDesc');
                self.desc = self.$t('connetFailDesc');
                self.value = 0;
                self.count = 0;
                self.textList = [];
                MINT.Toast({
                    message: msg,
                    position: 'bottom',
                });
                window.onConfigureProgress = self.onConfigureProgress;
            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    });

    return ConDevice;
});