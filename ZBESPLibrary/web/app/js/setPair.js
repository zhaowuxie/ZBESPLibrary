define(["vue", "MINT", "txt!../../pages/setPair.html"],
    function(v, MINT, setPair) {

    var SetPair = v.extend({

        template: setPair,
        props: {
            pairInfo: {
                type: Object
            }
        },
        data: function(){
            return {
                flag: false,
                pairList: [],
                showFloor: false,
                showArea: false,
                showEdit: false,
                deviceList: [],
                floor: "4F",
                area: "A",
                serialNum: "001",
                oldFloor: "",
                oldArea: "",
                oldCode: "",
                mac: "",
                floorArray: ["1F", "2F", "3F", "4F", "5F", "6F","7F", "8F", "9F", "10F", "11F", "12F",
                    "13F", "14F", "15F", "16F"],
                areaArray: ["A", "B", "C", "D", "E", "F","G"],
                slots1:[{values: [], defaultIndex: 0}],
                slots2:[{values: [], defaultIndex: 0}],
            }
        },
        methods:{
            show: function () {
                var self = this;
                self.onBackSetPair();
                self.getPair();
                self.deviceList = self.$store.state.deviceList;
                self.oldFloor = "";
                self.oldArea = "";
                self.oldCode = "";
                self.mac = "";
                if (!self._isEmpty(self.pairInfo)) {
                    self.oldFloor = self.floor = self.pairInfo.floor;
                    self.oldArea = self.area = self.pairInfo.area;
                    self.oldCode = self.serialNum = self.pairInfo.code;
                    self.mac = self.pairInfo.mac;
                    self.showEdit = true;
                } else {
                    self.getLastPair(self.pairList);
                    self.showEdit = false;
                }
                self.slots1 = [{values: self.floorArray
                    , defaultIndex: self.floorArray.indexOf(self.floor)}];
                self.slots2 = [{values: self.areaArray, defaultIndex: self.areaArray.indexOf(self.area)}];
                self.showFloor = false;
                self.showArea = false;
                self.flag = true;
            },
            hide: function () {
                this.$emit("setPairShow");
                this.flag = false;
            },
            getPair: function() {
                var self = this,
                    pairs = window.espmesh.loadHWDevices();
                if (!self._isEmpty(pairs)) {
                    self.pairList = JSON.parse(pairs);
                    self.getPosition();
                }
            },
            getPosition: function() {
                var self = this;
                if (self.pairList.length > 0) {
                    $.each(self.pairList, function(i, item) {
                        if (self.floorArray.indexOf(item.floor) == -1) {
                            self.floorArray.push(item.floor);
                        }
                        if (self.areaArray.indexOf(item.area) == -1) {
                            self.areaArray.push(item.area);
                        }
                    })
                }
            },
            getLastPair: function(list) {
                var self = this,
                    len = list.length;
                if (len > 0) {
                    var pair = list[len - 1];
                    self.floor = pair.floor;
                    self.area = pair.area;
                    self.serialNum = pair.code;
                    self.mac = "";
                    self.getNum();
                } else {
                    len = self.pairList.length;
                    if (len > 0) {
                        var pair = self.pairList[len - 1];
                        var num = pair.code.length,
                            str = "";
                        if (num > 1) {
                            for (var i = 0; i < (num - 1); i++) {
                                str +="0";
                            }
                        }
                        self.serialNum = str + "1";
                    } else {
                        self.serialNum = "001";
                    }

                }
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
            onBackSetPair: function () {
                window.onBackPressed = this.hide;
            },
            onFloorChange: function(picker, values) {
                this.floor = values[0];
                if (!this.showEdit) {
                    this.getPairByFloor(values[0])
                }
            },
            onAreaChange: function(picker, values) {
                this.area = values[0];
                if (!this.showEdit) {
                    this.getPairByArea(values[0]);
                }
            },
            hideFloor: function() {
                this.showFloor = false;
            },
            hideArea: function() {
                this.showArea = false;
            },
            getPairByFloor: function(floor) {
                var self = this, list = [];
                $.each(self.pairList, function(i, item) {
                    if (item.floor == floor) {
                        list.push(item);
                    }
                });
                self.getLastPair(list);
            },
            getPairByArea: function(area) {
                var self = this, list = [];
                $.each(self.pairList, function(i, item) {
                    if (item.area == area) {
                        list.push(item);
                    }
                });
                self.getLastPair(list);
            },
            setScanner: function() {
                window.espmesh.scanQRCode();
            },
            savePair: function() {
                var self = this, flag = false;
                if (self._isEmpty(self.floor)) {
                    MINT.Toast({
                        message: self.$t('floorDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEmpty(self.area)) {
                    MINT.Toast({
                        message: self.$t('areaDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEmpty(self.serialNum)) {
                    MINT.Toast({
                        message: self.$t('codeDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEmpty(self.mac)) {
                    MINT.Toast({
                        message: self.$t('macDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isCodeExist(self.serialNum)) {
                    MINT.Toast({
                        message: self.$t('existCodeDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isExist(self.mac)) {
                    MINT.Toast({
                        message: self.$t('existMacDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                MINT.Indicator.open();
                $.each(self.deviceList, function(i,item) {
                    if (item.mac == self.mac) {
                        flag = true;
                        return false;
                    }
                })
                setTimeout(function(){
                    if (flag) {
                        var setFlag = self.setDevicePosition();
                        if (setFlag) {
                            window.espmesh.saveHWDevice(self.mac, self.serialNum, self.floor, self.area);
                            MINT.Toast({
                                message: self.$t('saveSuccessDesc'),
                                position: 'bottom',
                                duration: 2000
                            });
                            self.mac = "";
                            self.getNum();
                        } else {
                            MINT.Toast({
                                message: self.$t('saveFailDesc'),
                                position: 'bottom',
                                duration: 2000
                            });
                        }
                    } else {
                        window.espmesh.saveHWDevice(self.mac, self.serialNum, self.floor, self.area);
                        MINT.Toast({
                            message: self.$t('saveSuccessDesc'),
                            position: 'bottom',
                            duration: 2000
                        });
                        self.mac = "";
                        self.getNum();
                    }
                    var pairs = window.espmesh.loadHWDevices();
                    if (!self._isEmpty(pairs)) {
                        self.pairList = JSON.parse(pairs);
                    }
                    self.onBackSetPair();
                    MINT.Indicator.close();
                }, 500);

            },
            setDevicePosition: function() {
                var self = this, flag = false,
                    position = self.floor + "-" + self.area + "-" + self.serialNum,
                    data = '{"' + MESH_MAC + '": "' + self.mac + '","' + MESH_REQUEST + '": "' + SET_POSITION + '",' +
                                                '"position":"' + position + '"}';
                var res = window.espmesh.requestDevice(data);
                res = JSON.parse(res);
                if (res.status_code == 0) {
                    flag = true;
                    $.each(self.deviceList, function(i, item){
                        if (item.mac == self.mac) {
                            item.position = position;
                            self.deviceList.splice(i, 1, item);
                            return false;
                        }
                    });
                }
                self.$store.commit("setList", self.deviceList);
                return flag;
            },
            onQRCodeScanned: function(qr) {
                var self = this;
                console.log(qr);
                if (!self._isEmpty(qr)) {
                    self.mac = qr;
                };
            },
            _isExist: function(mac) {
                var self = this, flag = false;
                $.each(self.pairList, function(i, item) {
                    if (item.mac == mac) {
                        flag = true;
                        return false;
                    }
                })
                return flag;
            },
            _isCodeExist: function(code) {
                var self = this, flag = false;
                $.each(self.pairList, function(i, item) {
                    if (item.floor == self.floor && item.area == self.area && item.code == code) {
                        flag = true;
                        return false;
                    }
                })
                return flag;
            },
            _isEditExist: function(code) {
                var self = this, flag = false;
                if (self.floor != self.oldFloor || self.area != self.oldArea || code != self.oldCode) {
                    flag = true;
                }
                return flag;
            },
            getNum: function() {
                var self = this,
                    len = self.serialNum.length;
                    num = parseInt(self.serialNum);
                num++;
                if (num <= 9) {
                    var str = "";
                    if (len > 1) {
                        for (var i = 0; i < (len - 1); i++) {
                            str +="0";
                        }
                    }
                    self.serialNum = str + num;
                } else if (num <= 99) {
                    var str = "";
                    if (len > 2) {
                        for (var i = 0; i < (len - 2); i++) {
                            str +="0";
                        }
                    }
                    self.serialNum = str + num;
                } else {
                     self.serialNum = num;
                }
            },
            editPair: function() {
                var self = this, flag = false;
                $.each(self.deviceList, function(i,item) {
                    if (item.mac == self.pairInfo.mac) {
                        flag = true;
                        return false;
                    }
                })
                if (self._isEmpty(self.floor)) {
                    MINT.Toast({
                        message: self.$t('floorDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEmpty(self.area)) {
                    MINT.Toast({
                        message: self.$t('areaDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEmpty(self.serialNum)) {
                    MINT.Toast({
                        message: self.$t('codeDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEditExist(self.serialNum) && self._isCodeExist(self.serialNum)) {
                    MINT.Toast({
                        message: self.$t('existCodeDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                MINT.Indicator.open();
                setTimeout(function() {
                    if (flag) {
                        var setFlag = self.setDevicePosition();
                        if (setFlag) {
                            window.espmesh.deleteHWDevice(self.pairInfo.mac);
                            window.espmesh.saveHWDevice(self.mac, self.serialNum, self.floor, self.area);
                            MINT.Toast({
                                message: self.$t('editSuccessDesc'),
                                position: 'bottom',
                                duration: 2000
                            });
                            self.hide();
                        } else {
                            MINT.Toast({
                                message: self.$t('editFailDesc'),
                                position: 'bottom',
                                duration: 2000
                            });
                        }
                    } else {
                        window.espmesh.deleteHWDevice(self.pairInfo.mac);
                        window.espmesh.saveHWDevice(self.mac, self.serialNum, self.floor, self.area);
                        MINT.Toast({
                            message: self.$t('editSuccessDesc'),
                            position: 'bottom',
                            duration: 2000
                        });
                        self.hide();
                    }
                    self.mac = "";
                    MINT.Indicator.close();
                }, 500);

            },
            selectFloor: function() {
                this.showFloor = true;
            },
            selectArea: function() {
                this.showArea = true;
            },
            _isEmpty: function (str) {
                if (str === "" || str == null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            },

        },
        components: {

        },
        created: function () {
            window.onQRCodeScanned = this.onQRCodeScanned;
        },

    });
    return SetPair;
});