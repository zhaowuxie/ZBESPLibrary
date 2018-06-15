define(["vue", "MINT", "txt!../../pages/scanDevice.html"],
    function(v, MINT, scanDevice) {

    var ScanDevice = v.extend({

        template: scanDevice,

        data: function(){
            return {
                addFlag: false,
                deviceList: [],
                scanNum: 0,
                advancedShow: false
            }
        },
        computed: {
            count: function () {
                var self = this;
                var conDevices = self.$store.state.scanDeviceList;
                return conDevices.length;
            }
        },
        methods:{
            show: function() {
                this.onBackReset();
                this.deviceList = this.$store.state.deviceList;
                this.advancedShow = false;
                this.scanNum = 0;
                this.addFlag = true;
            },
            hide: function () {
                this.addFlag = false;
                window.espmesh.stopBleScan();
                this.$emit("scanDeviceShow");
            },
            hideThis: function () {
                this.addFlag = false;
            },
            hideParent: function () {
                this.addFlag = false;
                window.espmesh.stopBleScan();
            },
            onBackReset: function () {
                window.onBackPressed = this.hide;
            },
            setParent: function() {
                this.$emit("scanDeviceShow");
            },
            addConDevice: function() {
                this.advancedShow = false;
                this.conDeviceBtn();
            },
            joinConDevice: function() {
                this.advancedShow = true;
                this.conDeviceBtn();
            },
            conDeviceBtn: function() {
                this.scanNum = 0;
                clearTimeout(SCAN_DEVICE);
                window.espmesh.scanTopo();
                this.hideParent();
                MINT.Indicator.open();
            },
            conDevice: function() {
                var self = this,
                    conDevices = self.$store.state.scanDeviceList,
                    devices = self.$store.state.deviceList,
                    conMacs = [], macs = [], wifiName = "", password = "";
                $.each(conDevices, function(i, item) {
                    conMacs.push(item.mac);
                });
                $.each(devices, function(i, item) {
                    macs.push(item.mac);
                });
                self.$store.commit("setConScanDeviceList", conMacs);
                setTimeout(function(){
                    var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) + ',"'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + ADD_DEVICE + '","'+
                                            'whitelist": '+JSON.stringify(conMacs)+'}';
                    window.espmesh.requestDevicesMulticast(data);
                    self.$store.commit("setScanDeviceList", []);
                    MINT.Indicator.close();
                    self.setParent();
                }, 1000);

            },
            onTopoScanned: function(deviceMacs) {
                var self = this, lists = [];
                if (!self._isEmpty(deviceMacs)) {
                    deviceMacs = JSON.parse(deviceMacs);
                    if (deviceMacs.length > 0) {
                        $.each(self.deviceList, function(i, item) {
                            if (deviceMacs.indexOf(item.mac) > -1) {
                                lists.push(item);
                            }
                        });
                        self.deviceList = lists;
                        self.$store.commit("setList", self.deviceList);
                        if (self.advancedShow) {
                            MINT.Indicator.close();
                            self.$parent.joinDevice();
                        } else {
                            self.conDevice();
                        }
                    } else {
                        if (self.scanNum < 2) {
                            self.scanNum++;
                            window.espmesh.scanTopo();
                        } else {
                            self.$store.commit("setList", []);
                            MINT.Indicator.close();
                            MINT.Toast({
                                message: self.$t('noDeviceDesc'),
                                position: 'bottom',
                            });
                            self.$parent.addDevice();
                        }
                    }

                }
            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            },
        },
        created: function () {
            window.onTopoScanned = this.onTopoScanned;
        },


    });

    return ScanDevice;
});