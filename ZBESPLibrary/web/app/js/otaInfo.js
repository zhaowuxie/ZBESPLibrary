define(["vue", "MINT", "txt!../../pages/otaInfo.html" ], function(v, MINT, otaInfo) {

    var OtaInfo = v.extend({
        template: otaInfo,
        props: {
            macs: {
                type: Array
            },
            otaId: {
                type: String
            }
        },
        data: function(){
            return {
                addFlag: false,
                upgrade: false,
                upgradeSuccess: false,
                upgradeFailure: false,
                upgradeValue: 0,
                otaDeviceList: [],
                otaList: [],
                scheduleList: [],
                successMacs: [],
                failMacs: [],
                bin: "",
                timeCost: "00:00:00",
                timeCostId: "",
                showPart: false,
                showDetails: false,
            }
        },
        computed: {
            progressList: function () {
                var list = this.scheduleList;
                console.log(list.length);
                return list;

            }
        },
        methods:{
            show: function() {
                var self = this;
                window.onBackPressed = self.hide;
                self.otaList = [];
                self.successMacs = [];
                self.scheduleList = [];
                self.upgradeSuccess = false;
                self.upgrade = false;
                self.upgradeFailure = false;
                self.showPart = false;
                self.showDetails = false;
                self.upgradeValue = 0;
                self.timeCost = "00:00:00";
                self.timeCostId = "";
                self.failMacs = [];
                self.scheduleList = [];
                $("span.progress-value").text(self.upgradeValue+"%");
                $("div.ota-progress-progress").css("width", self.upgradeValue+"%");
                $("#"+ self.otaId+ " span.span-radio").removeClass("active");
                self.getFiles();
                setTimeout(function() {
                    self.getList();
                }, 500);
                window.onOTAProgressChanged = this.onOTAProgressChanged;
                window.onOTAResult = this.onOTAResult;
                self.addFlag = true;
            },
            hide: function () {
                this.addFlag = false;
                this.hideSuccess();
                this.stopTime();
                this.$emit("otaShow");
            },
            otaReboot: function() {
                var self = this,
                    macs = JSON.stringify(self.successMacs);
                self.stopTime();
                window.espmesh.otaReboot(macs);
                self.hide();
            },
            stopUpgrade: function() {
                this.stopTime();
                this.hideSuccess();
                window.espmesh.stopOTA();
            },
            getList: function() {
                var self = this,
                    list = self.$store.state.deviceList;
                self.otaDeviceList = [];
                $.each(list, function(i, item) {
                    if (self.macs.indexOf(item.mac) > -1) {
                        self.otaDeviceList.push(item);
                    }
                });
                console.log(self.otaDeviceList.length);
            },
            getName: function(mac) {
                var self = this, name = "";
                $.each(self.otaDeviceList, function(i, item) {
                    if (item.mac == mac) {
                        name = item.name;
                        return false;
                    }
                })
                return name;
            },
            getFiles: function() {
                var self = this;
                self.otaList = [];
                var res = window.espmesh.getUpgradeFiles();
                if (!self._isEmpty(res)) {
                    res = JSON.parse(res);
                    $.each(res, function (i, item) {
                        self.otaList.push({id: item, name: self.getBin(item)});
                    });
                };
            },
            getBin: function(item) {
                var num = item.lastIndexOf("/")+1;
                var str = item.slice(num);
                return str;
            },
            hideSuccess: function () {
                var self = this;
                self.upgradeSuccess = false;
                self.showPart = false;
                self.upgrade = false;
                self.upgradeFailure = false;
                self.showDetails = false;
                $("span.progress-value").text("0%");
                $("div.ota-progress-progress").css("width", "0%");
                window.espmesh.stopOTA();
                window.onBackPressed = self.hide;
            },
            downloadBin: function () {
                var self= this;
                MINT.Indicator.open();
                setTimeout(function() {
                    var res = window.espmesh.downloadLatestRom();
                    res = JSON.parse(res);
                    MINT.Indicator.close();
                    if (res.download) {
                        self.getFiles();
                        window.onBackPressed = self.hide;
                        MINT.MessageBox.confirm(self.$t('downloadSuccessDesc')+ res.name, "",
                            {confirmButtonText: self.$t('upgradeBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                            self.upgrade = true;
                            self.bin = res.file;
                            setTimeout(function() {
                                window.espmesh.startOTA(self.bin, JSON.stringify(self.macs));
                            }, 100);
                        });
                    } else {
                        MINT.MessageBox.confirm(self.$t('downloadFailDesc'), "",
                            {confirmButtonText: self.$t('tryAgainBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                            setTimeout(function(){
                                self.downloadBin();
                            }, 10);
                        });
                    }
                }, 1000);

            },
            getTime: function() {
                var self = this;
                self.timeCost = "00:00:00";
                var time = 0;
                self.timeCostId = setInterval(function() {
                    time ++;
                    if (time < 60 ) {
                        self.timeCost = "00:00:" + self.getSecond(time);
                    } else if (time < 3600 ) {
                        var m = (time / 60).toFixed(0);
                        var s = time % 60;
                        self.timeCost = "00:" + self.getMinute(m) + ":" + self.getSecond(s);
                    } else {
                        var h = (time / 3600).toFixed(0);
                        var m = (time % 3600 / 60).toFixed(0);
                        var s = (time % 60);
                        self.timeCost = self.getHour(h) + ":" + self.getMinute(m) + ":" + self.getSecond(s);
                    }
                }, 1000)
            },
            getSecond: function(time) {
                var second = 0;
                if (time < 10) {
                    second= "0" + time;
                } else if (time < 60 ) {
                    second = time;
                }
                return second;
            },
            getMinute: function(time) {
                var minute = 0;
                if (time < 10) {
                    minute= "0" + time;
                } else if (time < 60 ) {
                    minute = time;
                }
                return minute;
            },
            getHour: function(time) {
                var hour = 0;
                if (time < 10) {
                    hour= "0" + time;
                } else {
                    hour = time;
                }
                return hour;
            },
            showDetailsFun: function() {
                this.showDetails = !this.showDetails;
            },
            stopTime: function() {
                var self = this;
                clearInterval(self.timeCostId);
            },
            save: function () {
                var self = this;
                self.upgradeSuccess = false;
                self.upgradeFailure = false;
                self.showPart = false;
                self.upgradeValue = 0;
                self.successMacs = [];
                self.failMacs = [];
                window.onBackPressed = "";
                var docs = $("#"+ self.otaId+ " span.span-radio.active"),
                    bin = $(docs[0]).attr("data-value");
                self.bin = bin;
                if (!self._isEmpty(bin)) {
                    self.upgrade = true;
                    setTimeout(function() {
                        window.espmesh.startOTA(bin, JSON.stringify(self.macs));
                        self.getTime();
                    }, 100);
                }
            },
            retrySave: function () {
                var self = this;
                $("span.progress-value").text("0%");
                $("div.ota-progress-progress").css("width", "0%");
                self.upgradeFailure = false;
                self.upgradeSuccess = false;
                self.upgradeFailure = false;
                self.showPart = false;
                if (!self._isEmpty(self.bin)) {
                    self.stopTime();
                    self.getTime();
                    self.upgrade = true;
                    setTimeout(function() {
                        window.espmesh.startOTA(self.bin, JSON.stringify(self.failMacs));
                    }, 100);
                }
            },
            hideUpgrade: function () {
                if (this.upgradeFailure) {
                    this.upgrade = false;
                    this.upgradeFailure = false;
                    this.showPart = false;
                    $("span.progress-value").text("0%");
                    $("div.ota-progress-progress").css("width", "0%");
                }
            },
            onOTAProgressChanged: function (schedule) {
                var self = this;
                var count = 0;
                if (!self._isEmpty(schedule)) {
                    console.log(schedule);
                    schedule = JSON.parse(schedule);
                    self.scheduleList = schedule;
                    $.each(schedule, function(i, item) {
                        count += parseInt(item.progress);
                    });
                    var num = parseInt(count / schedule.length);
                    if (self.upgradeValue >= 0) {
                        if (num >= 99) {
                            self.upgradeValue = 100;
                        } else {
                            self.upgradeValue = num;
                        }
                    }
                    $("span.progress-value").text(self.upgradeValue+"%");
                    $("div.ota-progress-progress").css("width", self.upgradeValue+"%");
                }
            },
            onOTAResult: function(result) {
                var self = this;
                console.log(result);
                self.stopTime();
                $("span.progress-value").text("100%");
                $("div.ota-progress-progress").css("width", "100%");
                if (!self._isEmpty(result)) {
                    result = JSON.parse(result);
                    $.each(result, function(i, item) {
                        if (self.successMacs.indexOf(item) < 0) {
                            self.successMacs.push(item);
                        }
                    })
                    if (result.length > 0) {
                        if (self.successMacs.length >= self.otaDeviceList.length) {
                            self.upgradeFailure = false;
                            self.upgradeSuccess = true;
                            self.showPart = false;
                        } else {
                            self.upgradeFailure = false;
                            self.upgradeSuccess = false;
                            self.showPart = true;
                            self.getFailDevices(result);
                        }

                    } else {
                        self.showPart = false;
                        self.upgradeSuccess = false;
                        self.upgradeFailure = true;
                        self.getFailDevices(result);
                    }
                }
            },
            getFailDevices: function(result) {
                var self = this, failMacs = [], failList = [];
                $.each(self.scheduleList, function(i, item) {
                    if (result.indexOf(item.mac) < 0) {
                        item.progress = 0;
                        failList.push(item);
                    }
                });
                self.scheduleList = failList;
                $.each(self.otaDeviceList, function(i, item) {
                    if (result.indexOf(item.mac) < 0) {
                        failMacs.push(item.mac);
                    }
                });
                self.failMacs = failMacs;
            },
            selectDevice: function (e) {
                var doc = $(e.currentTarget);
                if (doc.hasClass("active")) {
                    doc.removeClass("active");
                } else {
                    $("#"+ this.otaId+ " span.span-radio").removeClass("active");
                    doc.addClass("active");
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
             window.onOTAProgressChanged = this.onOTAProgressChanged;
             window.onOTAResult = this.onOTAResult;
        },

    });
    return OtaInfo;
});