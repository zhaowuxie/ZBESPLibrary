define(["vue", "txt!../../pages/resetDevice.html", "./addDevice"], function(v, resetDevice, addDevice) {

    var ResetDevice = v.extend({

        template: resetDevice,

        data: function(){
            return {
                addFlag: false,
                showDesc: false,
                scanDeviceList: [],
                scanOldList: [],
                scanMacs: [],
                resetId: "resetDevice-id",
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
                    var docs = $("#" + self.resetId + " span.span-radio.active");
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
                $("#" + self.resetId + " span.span-radio").addClass("active");
                self.setScanList(self.scanDeviceList);
                self.selected = self.count = self.scanDeviceList.length;
                self.rssiValue = -80;
                self.searchReset =  "";
                self.showFilter = false;
                self.showHeight = false;
                self.initResetSlider();

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
                this.$emit("resetShow");
                window.espmesh.stopBleScan();
                this.addFlag = false;
            },
            hideParent: function () {
                this.addFlag = false;
                this.$parent.conReload();
            },
            getLoadMacs: function() {
                var macs = window.espmesh.loadMacs();
                this.scanMacs = JSON.parse(macs)
            },
            initResetSlider: function() {
                var self = this;
                setTimeout(function() {
                    $("#resetSlider").slider({
                        range: "min",
                        min: self.rssiMin,
                        max: self.rssiMax,
                        value: self.rssiValue,
                        slide: function (event, ui) {
                            self.rssiValue = ui.value;
                        }
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
            onBackReset: function () {
                var self = this;
                clearTimeout(SCAN_DEVICE);
                window.espmesh.stopBleScan();
                window.espmesh.startBleScan();
                window.onScanBLE = self.onConScanBLE;
                window.onBackPressed = self.hide;
            },
            addDevice: function () {
                var self = this;
                if (self.selected > 0) {
                    window.espmesh.stopBleScan();
                    var docs = $("#" + self.resetId + " span.span-radio.active"),
                        macs = [], list = [];
                    for (var i = 0; i < docs.length; i++) {
                        macs.push($(docs[i]).attr("data-value"));
                    };
                    $.each(self.scanDeviceList, function(i, item) {
                        if (macs.indexOf(item.mac) > -1) {
                            list.push(item);
                        }
                    });
                    self.$store.commit("setScanDeviceList", list);
                    self.$refs.device.show();
                }
            },
            showDescInfo: function () {
                this.showDesc = true;
                window.onBackPressed = this.hideDescInfo;
            },
            hideDescInfo: function () {
                this.showDesc = false;
                window.onBackPressed = this.hide;
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
                            if (item.rssi > itemSub.rssi) {
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
            "v-addDevice": addDevice,
        }


    });

    return ResetDevice;
});