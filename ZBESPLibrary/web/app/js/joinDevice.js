define(["vue", "MINT", "txt!../../pages/joinDevice.html"], function(v, MINT, joinDevice) {

    var JoinDevice = v.extend({

        template: joinDevice,

        data: function(){
            return {
                addFlag: false,
                showDesc: false,
                scanDeviceList: [],
                scanOldList: [],
                scanMacs: [],
                count: 0,
                selected: 0,
                searchReset: "",
                resetPairList: [],
                rssiMin: -100,
                rssiMax: -40,
                rssiValue: -80,
                showFilter: false,
                showHeight: false
            }
        },
        computed: {
            list: function () {
                var self = this, list = [];
                self.scanOldList = self.scanDeviceList;
                self.getLoadMacs();
                if (self._isEmpty(self.searchReset)) {
                    $.each(self.scanDeviceList, function(i, item) {
                        if (item.rssi >= self.rssiValue) {
                            list.push(item);
                        }
                    });
                } else {
                    $.each(self.scanDeviceList, function(i, item) {
                        if ((item.name.indexOf(self.searchReset) != -1 || item.position.indexOf(self.searchReset) != -1 )
                            && item.rssi >= self.rssiValue) {
                            list.push(item);
                        }
                    })
                }
                if (self.showFilter) {
                    var macList = [];
                    $.each(list, function(i, item) {
                        if (self.scanMacs.indexOf(item.mac) > -1) {
                            macList.push(item);
                        }
                    })
                    list = macList;
                }
                setTimeout(function() {
                    var docs = $("#join-device span.span-radio.active");
                    self.selected = docs.length;
                });
                self.count = list.length;
                return list;
            }
        },
        methods:{
            show: function() {
                var self = this;
                self.getLoadMacs();
                self.getPair();
                setTimeout(function() {
                    self.onBackReset();
                });
                self.scanDeviceList = [];
                $("#join-device span.span-radio").addClass("active");
                self.setScanList(self.$store.state.scanDeviceList);
                self.selected = self.count = self.scanDeviceList.length;
                self.rssiValue = self.$store.state.rssiInfo;
                self.searchReset =  "";
                self.showFilter = false;
                self.showHeight = false;
                self.initJoinSlider();
                self.addFlag = true;
            },
            getPair: function() {
                var self = this,
                    pairs = window.espmesh.loadHWDevices();
                if (!self._isEmpty(pairs)) {
                    self.resetPairList = JSON.parse(pairs);
                }
                self.$store.commit("setSiteList", self.resetPairList);
            },
            getPairInfo: function(mac) {
                var self = this, position = "";
                    staMac = window.espmesh.getStaMacsForBleMacs(JSON.stringify([mac]));
                staMac = JSON.parse(staMac);
                if (staMac.length > 0) {
                    $.each(self.resetPairList, function(i, item) {
                        if (item.mac == staMac[0]) {
                            position = item.floor + "-" + item.area + "-" + item.code;
                            return false;
                        }
                    });
                }
                return position;
            },
            hide: function () {
                this.$emit("joinShow");
                window.espmesh.stopBleScan();
                this.addFlag = false;
            },
            getLoadMacs: function() {
                var macs = window.espmesh.loadMacs();
                this.scanMacs = JSON.parse(macs)
            },
            initJoinSlider: function() {
                var self = this;
                setTimeout(function() {
                    $("#joinSlider").slider({
                        step: 1,
                        min: self.rssiMin,
                        max: self.rssiMax,
                        value: self.rssiValue
                    }).on("change", function(e) {
                        self.rssiValue = e.value.newValue;
                        self.$store.commit("setRssi", self.rssiValue);
                    }).on("slideStop", function(slideEvt){
                        self.rssiValue = slideEvt.value;
                        self.$store.commit("setRssi", self.rssiValue);
                    });
                })
            },
            showHeightFun: function() {
                this.showHeight = !this.showHeight;
            },
            showFilterFun: function() {
                this.showFilter = !this.showFilter;
            },
            saveScanMac: function(mac) {
                var self = this,
                    index = self.scanMacs.indexOf(mac);
                if (index > -1) {
                    window.espmesh.deleteMac(mac);
                    self.scanMacs.splice(index, 1);
                } else {
                    window.espmesh.saveMac(mac);
                    self.scanMacs.push(mac);
                }
            },
            showMark: function(mac) {
                var flag = false;
                if (this.scanMacs.indexOf(mac) > -1) {
                    flag = true;
                }
                return flag;
            },
            conDevice: function() {
                var self = this;
                if (self.selected > 0) {
                    window.espmesh.stopBleScan();
                    MINT.Indicator.open();
                    var docs = $("#join-device span.span-radio.active"),
                        macs = [], list = [], conMacs = [],
                        devices = self.$store.state.deviceList;
                    for (var i = 0; i < docs.length; i++) {
                        conMacs.push($(docs[i]).attr("data-value"));
                    };
                    $.each(devices, function(i, item) {
                        macs.push(item.mac);
                    });
                    $.each(self.scanDeviceList, function(i, item) {
                        if (macs.indexOf(item.mac) > -1) {
                            list.push(item);
                        }
                    });
                    setTimeout(function(){
                        var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) + ',"'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + ADD_DEVICE + '","'+
                                                'whitelist": '+JSON.stringify(conMacs)+'}';
                        window.espmesh.requestDevicesMulticast(data);
                        self.$store.commit("setScanDeviceList", []);
                        MINT.Indicator.close();
                        self.hide();
                    }, 1000);
                    self.$store.commit("setConScanDeviceList", conMacs);
                }

            },
            onBackReset: function () {
                var self = this;
                clearTimeout(SCAN_DEVICE);
                window.espmesh.stopBleScan();
                window.espmesh.startBleScan();
                window.onScanBLE = self.onConScanBLE;
                window.onBackPressed = self.hide;
            },
            selectDevice: function (e) {
                var doc = $(e.currentTarget);
                if (doc.hasClass("active")) {
                    doc.removeClass("active");
                    this.selected -= 1;
                } else {
                    doc.addClass("active");
                    this.selected += 1;
                }
            },
            selectAllDevice: function (e) {
                var doc = $(e.currentTarget);
                if (doc.hasClass("active")) {
                    doc.removeClass("active");
                    $("span.span-radio").removeClass("active");
                    this.selected = 0;
                } else {
                    doc.addClass("active");
                    $("span.span-radio").addClass("active");
                    this.selected = this.count;
                }

            },
            distance: function(rssi) {
                var iRssi = Math.abs(rssi),
                    power = (iRssi - 49) / (10 * 4.5);
                return Math.pow(10, power).toFixed(2);
            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            },
            setScanList: function(devices) {
                var self = this;
                $.each(devices, function(i, item) {
                    var flag = true,
                        obj = {mac: item.mac, name: item.name, rssi: item.rssi, position: self.getPairInfo(item.mac)};
                    $.each(self.scanDeviceList, function(j, itemSub) {
                        if (item.mac == itemSub.mac) {
                            if (item.rssi >= self.rssiValue) {
                                self.scanDeviceList.splice(j, 1, obj);
                            }
                            flag = false;
                            return false;
                        }
                    })
                    if (flag && !self._isEmpty(obj)) {
                        self.scanDeviceList.push(obj);
                    }

                })
            },
            onConScanBLE: function (devices) {
                var self = this;
                devices = JSON.parse(devices);
                self.setScanList(devices);
                window.onBackPressed = self.hide;
            }

        },
        components: {
        }


    });

    return JoinDevice;
});