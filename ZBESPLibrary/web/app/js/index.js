define(["vue", "MINT", "txt!../../pages/index.html", "../js/footer", "./resetDevice",
"./operateDevice", "./addGroup", "./load", "./aboutDevice", "./otaInfo", "./automation",
 "./ibeacon", "./scanDevice", "./remind", "./attr", "./setDevicePair", "./joinDevice"],
    function(v, MINT, index, footer, resetDevice, operateDevice, addGroup, load, aboutDevice,
        otaInfo, automation, ibeacon, scanDevice, remind, attr, setDevicePair, joinDevice) {

    var Index = v.extend({

        template: index,

        data: function(){
            return {
                flag: false,
                device: "device",
                addGroupId: "device-addGroup",
                colorId: "device-color",
                temperatureId: "device-temperature",
                otaDeviceId: "ota-device-id",
                deviceList: [],
                deviceInfo: "",
                name: "",
                loadDesc: "",
                infoShow: false,
                topStatus: "",
                groupName: "",
                powerFlag: false,
                showAdd: false,
                searchName: "",
                otaMacs: [],
                autoId: "automation-device",
                recentList: [],
                groupList: this.$store.state.groupList,
                mixList: this.$store.state.mixList,
                pairList: [],
                positionList: [],
                wifiNum: 0,
                hsb: "",
                hideTrue: false,
            }
        },
        mounted: function() {
            this.wifiNum = 0;
            window.espmesh.hideCoverImage();
            window.espmesh.registerWifiChange();
            this.reload();
        },
        computed: {
            list: function () {
                var self = this;
                self.deviceList = self.$store.state.deviceList;

                if (self.deviceList.length > 0) {
                    self.$refs.remind.hide();
                    if (self.hideTrue) {
                        self.hideLoad();
                    }
                }
                self.positionList = [];
                $.each(self.deviceList, function(i, item) {
                    if (!self._isEmpty(item.position)) {
                        self.positionList.push(item.position);
                    }
                });
                self.setGroup();
                if (self._isEmpty(self.searchName)) {
                    return self.deviceList;
                } else {
                    var searchList = [];
                    $.each(self.deviceList, function(i, item) {
                        if (item.name.indexOf(self.searchName) != -1 || item.position.indexOf(self.searchName) != -1) {
                            searchList.push(item);
                        }
                    })
                    return searchList;
                }
            }
        },
        methods:{
            handleTopChange: function (status) {
                this.topStatus = status;
            },
            addDevice: function (event) {
                this.flag = false;
                this.$refs.device.show();
            },
            joinDevice: function (event) {
                this.flag = false;
                this.$refs.join.show();
            },
            addGroup: function () {
                var self = this;
                this.flag = false;
                if (self._isEmpty(self.deviceList)) {
                    self.deviceList = [];
                }
                MINT.MessageBox.prompt(self.$t('addGroupDesc'), self.$t('addGroupTitle'),
                    {inputValue: "", inputPlaceholder: self.$t('addGroupInput'),
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj) {
                    self.$refs.group.show();
                    self.groupName = obj.value;
                });

            },
            setPairs: function() {
                var self = this, position = "", pairMacs = [];
                pairs = window.espmesh.loadHWDevices();
                if (!self._isEmpty(pairs)) {
                    pairs = JSON.parse(pairs);
                    $.each(pairs, function(i, item) {
                        pairMacs.push(item.mac);
                    });
                }
                $.each(self.deviceList, function(i, item) {
                    if (!self._isEmpty(item.position)) {
                        position = item.position.split("-");
                        window.espmesh.saveHWDevice(item.mac, position[2], position[0], position[1]);
                    } else {
                        $.each(pairs, function(j, itemSub) {
                            if (itemSub.mac == item.mac) {
                                item.position = itemSub.floor + "-" + itemSub.area + "-" + itemSub.code;
                                self.deviceList.splice(i, 1, item);
                                var data = '{"' + MESH_MAC + '": "' + item.mac + '","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_POSITION + '",' +
                                            '"position":"' + item.position + '"}';
                                window.espmesh.requestDeviceAsync(data);
                                self.$store.commit("setList", self.deviceList);
                                return  false;
                            }
                        });
                    }
                });
            },
            setPair: function(device) {
                var self = this, position = "", pairMacs = [];
                pairs = window.espmesh.loadHWDevices();
                if (!self._isEmpty(pairs)) {
                    pairs = JSON.parse(pairs);
                    $.each(pairs, function(i, item) {
                        pairMacs.push(item.mac);
                    });
                }
                if (!self._isEmpty(device.position)) {
                    position = device.position.split("-");
                    window.espmesh.saveHWDevice(device.mac, position[2], position[0], position[1]);

                } else {
                    $.each(pairs, function(i, item) {
                        if (item.mac == device.mac) {
                            device.position = item.floor + "-" + item.area + "-" + item.code;
                            var data = '{"' + MESH_MAC + '": "' + device.mac + '","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_POSITION + '",' +
                                        '"position":"' + device.position + '"}';
                            window.espmesh.requestDeviceAsync(data);
                            return  false;
                        }
                    });
                }
                return device;
            },
            setMixList: function () {
                var self = this;
                if (self.mixList.length == 0) {
                    var res = window.espmesh.loadLastOperations("10");
                    if (!self._isEmpty(res)) {
                        self.recentList = JSON.parse(res);
                        if (self.groupList.length <= 0) {
                            var groups = window.espmesh.loadGroups();

                            if (!self._isEmpty(groups)) {
                                self.groupList = JSON.parse(groups);
                                self.$store.commit("setGroupList", this.groupList);
                            }
                        }
                        $.each(self.recentList, function(i, item) {
                            if (item.type == RECENT_TYPE_DEVICE) {
                                $.each(self.deviceList, function(j, itemSub) {
                                    if (item.identity == itemSub.mac) {
                                        self.mixList.push({type: item.type, obj: itemSub});
                                        return false;
                                    }
                                })
                            } else {

                                $.each(self.groupList, function(j, itemSub) {
                                    if (item.identity == itemSub.id) {
                                        self.mixList.push({type: item.type, obj: itemSub});
                                        return false;
                                    }
                                })
                            }
                        })
                        self.$store.commit("setRecentList", self.mixList);
                    }
                }
            },
            setGroup: function() {
                var self = this, tidList = [], macs = [], name = "", list = [];
                $.each(self.deviceList, function(i, item) {
                    macs = [];
                    if (tidList.indexOf(item.tid) < 0) {
                        tidList.push(item.tid);
                        name = self.setName(item.tid);
                        $.each(self.deviceList, function(j, itemSub) {
                            if (item.tid == itemSub.tid) {
                                macs.push(itemSub.mac);
                            }
                        });
                        list.push({id: item.tid, name: name, device_macs: macs})
                    }
                });
                window.espmesh.saveGroups(JSON.stringify(list));
                var saveGroups = window.espmesh.loadGroups();
                self.$store.commit("setGroupList", JSON.parse(saveGroups));
            },
            setName: function(tid) {
                var name = "";
                if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                    name = "Switch_" + tid;
                } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                    name = "Sensor_" + tid;
                } else if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    name = "Light_" + tid;
                } else {
                    name = "Other_" + tid;
                }
                return name;
            },
            getAllMacs: function () {
                var macs = [], self = this;
                $.each(self.deviceList, function(i, item){
                    macs.push(item.mac);
                });
                return macs;
            },
            conReload: function() {
                var self = this;
                self.showAdd = false;
                self.hideTrue = true;
                self.$refs.remind.hide();
                if (self.deviceList.length <= 0) {
                    self.stopBleScan();
                    self.loadDesc = self.$t('loadCon');
                    self.showLoad();
                }
                setTimeout(function() {
                    self.hideLoad();
                    if (self.deviceList.length <= 0) {
                        MINT.Toast({
                          message: self.$t('pullDownDesc'),
                          position: 'bottom',
                        });
                    };
                    self.onBackIndex();
                }, 20000);
            },
            reload: function() {
                var self = this;
                setTimeout(function(){
                    self.stopBleScan();
                    self.$store.commit("setList", []);
                    window.espmesh.scanDevicesAsync();
                }, 50);
            },
            showUl: function () {
                this.flag = !this.flag;
                if (this.flag) {
                    window.onBackPressed = this.hideUl;
                    this.stopBleScan();
                } else {
                    this.onBackIndex();
                }
            },
            hideUl: function () {
                this.flag = false;
                this.onBackIndex();
            },
            hideLoad: function () {
                this.$refs.load.hide();
                this.hideTrue = false;
            },
            showLoad: function () {
                var self = this;
                setTimeout(function() {
                    self.$refs.load.showTrue();
                }, 100)
            },
            operateItem: function (item, e) {
                var self = this,
                    tid = item.tid;
                self.flag = false;
                if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    self.deviceInfo = item;
                    self.$store.commit("setDeviceInfo", self.deviceInfo);
                    self.stopBleScan();
                    self.$refs.operate.show();
                    self.record(self.deviceInfo.mac);
                } else {
                    self.deviceInfo = item;
                    self.$store.commit("setDeviceInfo", self.deviceInfo);
                    self.stopBleScan();
                    self.$refs.attr.show();
                    self.record(self.deviceInfo.mac);
                }
            },
            showAbout: function () {
                this.infoShow = false;
                this.$refs.aboutDevice.show();
            },
            showOta: function () {
                this.infoShow = false;
                this.otaMacs = [];
                this.otaMacs.push(this.deviceInfo.mac);
                this.$refs.ota.show();
            },
            showPair: function() {
                this.infoShow = false;
                this.$refs.setDevicePair.show();
            },
            showAuto: function() {
                this.infoShow = false;
                this.$refs.auto.show();
            },
            showIbeacon: function() {
                this.infoShow = false;
                this.$refs.ibeacon.show();
            },
            showDel: function (e) {
                $("#content-info .item").removeClass("active");
                $(e.currentTarget).addClass("active");
            },
            hideDel: function (e) {
                $("#content-info .item").removeClass("active");
            },
            getIcon: function (tid) {
                if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    return "icon-light";
                } else if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                    return "icon-power";
                } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                    return "icon-sensor";
                }
            },
            getFlag: function(position) {
                var self = this, flag = false;
                if (self.positionList.indexOf(position) != self.positionList.lastIndexOf(position)) {
                    flag = true;
                }
                return flag;

            },
            isLigth: function (tid) {
                if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    return true;
                } else {
                    return false;
                }
            },
            delDevice: function (e) {
                var doc = $(e.currentTarget),
                    self = this;
                MINT.MessageBox.confirm(self.$t('deleteDeviceDesc'), self.$t('reconfigure'),{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    self.hideOperate();
                    MINT.Indicator.open();
                    setTimeout(function() {
                        var mac = self.deviceInfo.mac;
                        var data = '{"' + MESH_MAC + '": "' + mac + '","' + MESH_REQUEST + '": "' + RESET_DEVICE + '","' +
                                        DEVICE_DELAY + '": ' + DELAY_TIME + '}';
                        var res = window.espmesh.requestDevice(data);
                        if (!self._isEmpty(res)) {
                            res = JSON.parse(res);
                            if (res.status_code == 0) {
                                window.espmesh.removeDeviceForMac(mac);
                                $.each(self.deviceList, function(i, item) {
                                    if (item.mac == mac) {
                                        self.deviceList.splice(i, 1);
                                        return false;
                                    }
                                })
                                self.$store.commit("setList", self.deviceList);

                            } else {
                                MINT.Toast({
                                  message: self.$t('deleteFailDesc'),
                                  position: 'bottom',
                                  duration: 2000
                                });
                            }
                        } else {
                            MINT.Toast({
                              message: self.$t('deleteFailDesc'),
                              position: 'bottom',
                              duration: 2000
                            });
                        }
                        MINT.Indicator.close();
                        self.onBackIndex();
                    }, 1000);

                });
            },
            getColor: function (characteristics, tid) {
                var self = this,
                    hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#6b6b6b",
                    mode = 0, temperature = 0, brightness = 0;
                $.each(characteristics, function(i, item) {
                    if (item.cid == HUE_CID) {
                        hueValue = item.value;
                    }else if (item.cid == SATURATION_CID) {
                        saturation = item.value;
                    }else if (item.cid == VALUE_CID) {
                        luminance = item.value;
                    } else if (item.cid == STATUS_CID) {
                        status = item.value;
                    } else if (item.cid == MODE_CID) {
                        mode = item.value;
                    } else if (item.cid == TEMPERATURE_CID) {
                        temperature = item.value;
                    } else if (item.cid == BRIGHTNESS_CID) {
                        brightness = item.value;
                    }
                })
                if (status == STATUS_ON) {
                    if (mode == MODE_CTB) {
                        rgb = self.modeFun(temperature, brightness);
                    } else {
                        rgb = Raphael.hsb2rgb(hueValue / 360, saturation / 100, luminance / 100).hex;
                    }

                }
                if (tid < MIN_LIGHT || tid > MAX_LIGHT) {
                    rgb = "#3ec2fc";
                }
                return rgb;
            },
            modeFun: function(temperature, brightness) {
                var r = 0,
                    g = 0,
                    b = 0,
                    r1 = 248,
                    g1 = 207,
                    b1 = 109,
                    r2 = 255,
                    g2 = 255,
                    b2 = 255,
                    r3 = 164,
                    g3 = 213,
                    b3 = 255;
                if (temperature < 50) {
                    var num = temperature / 50;
                    r = Math.floor((r2 - r1) * num) + r1;
                    g = Math.floor((g2 - g1) * num) + g1;
                    b = Math.floor((b2 - b1) * num) + b1;
                } else {
                    var num = (temperature - 50) / 50;
                    r = r2 - Math.floor((r2 - r3) * num);
                    g = g2 - Math.floor((g2 - g3) * num);
                    b = b2 - Math.floor((b2 - b3) * num);
                }
                return "rgba("+r+", "+g+", "+b+", 1)";
            },
            editName: function () {
                var self = this;
                self.hideOperate();
                MINT.MessageBox.prompt(self.$t('editNameInput'), self.$t('editNameDesc'),
                    {inputValue: self.deviceInfo.name, inputPlaceholder: self.$t('addGroupInput'),
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj) {
                    self.deviceInfo.name = obj.value;
                    var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac + '","' + MESH_REQUEST + '": "' + RENAME_DEVICE + '",' +
                                '"name":' + JSON.stringify(obj.value) + '}';
                    setTimeout(function(){
                        var res = window.espmesh.requestDevice(data),
                            editItem;
                        res = JSON.parse(res);
                        if (res.status_code == 0) {
                            $.each(self.deviceList, function(i, item){
                                if (item.mac == self.deviceInfo.mac) {
                                    self.deviceList.splice(i, 1, self.deviceInfo);
                                    return false;
                                }
                            });
                        }
                        self.$store.commit("setList", self.deviceList);
                        self.onBackIndex();
                    }, 500);
                });
            },
            getStatus: function(characteristics) {
                var self = this, status = 0;
                $.each(characteristics, function(i, item) {
                    if (item.cid == STATUS_CID) {
                        status = item.value;
                    }
                });
                return (status == STATUS_ON ? true : false);
            },
            close: function (mac, status) {
                var self = this, meshs = [], deviceStatus = 0, position = 0;
                $.each(self.deviceList, function(i, item){
                    if (item.mac == mac) {
                        self.deviceList.splice(i, 1);
                        position = i;
                        self.deviceInfo = item;
                        return false;
                    }
                });
                var characteristics = [];
                $.each(self.deviceInfo.characteristics, function(i, item) {
                    if (item.cid == STATUS_CID) {
                        deviceStatus = item.value;
                        item.value = parseInt(status);
                    }
                    characteristics.push(item);
                });
                if (!deviceStatus == status) {
                    meshs.push({cid: STATUS_CID, value: parseInt(status)});
                    var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac + '","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                        '"characteristics":' + JSON.stringify(meshs) + '}';

                    self.deviceInfo.characteristics = characteristics;
                    self.deviceList.splice(position, 0, self.deviceInfo);
                    window.espmesh.requestDevice(data);
                } else {
                    self.deviceList.splice(position, 0, self.deviceInfo);
                }
                self.record(mac);
            },
            closeDevice: function(mac) {
                var self = this, status = 0;
                self.powerFlag = !self.powerFlag;
                status = self.powerFlag ? STATUS_ON : STATUS_OFF;
                self.close(mac, status);
            },
            operateClose: function(mac, status) {
                var self = this;
                self.close(mac, status);
                setTimeout(function() {
                    window.onBackPressed = self.hideOperate;
                })
            },
            showOperate: function (e) {
                var self = this, status = 0;
                self.stopBleScan();
                var mac = $(e.target).attr("data-value");
                $.each(self.deviceList, function(i, item) {
                    if (mac == item.mac) {
                        self.deviceInfo = item;
                        return false;
                    }
                });
                var characteristics = [];
                $.each(self.deviceInfo.characteristics, function(i, item) {
                    if (item.cid == STATUS_CID) {
                        status = item.value;
                    }
                    characteristics.push(item);
                });
                self.record(mac);
                self.powerFlag = (status == STATUS_ON ? true : false)
                self.flag = false;
                self.infoShow = true;
                self.$store.commit("setDeviceInfo", self.deviceInfo);
                window.onBackPressed = self.hideOperate;
            },
            hideOperate: function () {
                this.onBackIndex();
                this.infoShow = false;
            },
            loadTop: function() {
                var self = this;
                setTimeout(function() {
                    self.stopBleScan();
                    self.$store.commit("setList", []);
                    window.espmesh.scanDevicesAsync();
                }, 50);
            },
            getPosition: function(position) {
                var self = this;
                if (!self._isEmpty(position)) {
                    position = position.split("-");
                    return position[0] + "-" + (position[1] + position[2]);
                } else {
                    return "";
                }
            },
            showDesc: function(position) {
                var flag = false;
                if (!this._isEmpty(position)) {
                    flag = true;
                }
                return flag;
            },
            getDevices: function(devices) {
                var self = this, macs = [], lists = [];
                if (devices.length > 0) {
                    $.each(devices, function(i, item) {
                        macs.push(item.mac);
                    });
                    var staMacs = window.espmesh.getStaMacsForBleMacs(JSON.stringify(macs));
                    staMacs = JSON.parse(staMacs);
                    $.each(self.deviceList, function(i, item) {
                        if (staMacs.indexOf(item.mac) < 0) {
                            lists.push(item);
                        }
                    });
                    self.deviceList = lists;
                    self.$store.commit("setList", self.deviceList);
                }
            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined || str === "null" || str === "undefined" ) {
                    return true;
                } else {
                    return false;
                }
            },
            onDeviceFound: function (device) {
                var self = this;
                if (self._isEmpty(self.deviceList)) {
                    self.deviceList = [];
                }
                if (!self._isEmpty(device)) {
                    self.showAdd = false;
                    device = JSON.parse(device);
                    var isExist = true;
                    $.each(self.deviceList, function(i, item) {
                        if (item.mac == device.mac) {
                            isExist = false;
                        }
                    });
                    if (isExist) {
                        device = self.setPair(device);
                        self.deviceList.push(device);
                    }
                    if (!self._isEmpty(INSTANCE_TOAST)) {
                        INSTANCE_TOAST.close();
                    }
                    INSTANCE_TOAST = MINT.Toast({
                        message: self.$t('deviceOnline') + ":" + device.name,
                        position: 'bottom',
                    });
                }
               self.$store.commit("setList", self.deviceList);
            },
            onDeviceLost: function (mac) {
                var self = this;
                if (!self._isEmpty(mac)) {
                    $.each(self.deviceList, function(i, item) {
                        if (item.mac == mac) {
                            self.deviceList.splice(i, 1);
                            if (self.deviceList.length <= 0) {
                                self.showAdd = true;
                            }
                            if (!self._isEmpty(INSTANCE_TOAST)) {
                                INSTANCE_TOAST.close();
                            }
                            INSTANCE_TOAST = MINT.Toast({
                                message: self.$t('deviceOffline') + ":" + item.name,
                                position: 'bottom',
                            });
                            return false;
                        }
                    })
                }
               self.$store.commit("setList", self.deviceList);
            },
            onDeviceStatusChanged: function (item) {
                var self = this,
                    hueValue = 0,
                    saturation = 0,
                    luminance = 0;
                if (!self._isEmpty(item)) {
                    item = JSON.parse(item);
                    var mac = item.mac,
                        characteristics = item.characteristics;
                    $.each(self.deviceList, function(i, itemSub) {
                        if (itemSub.mac == mac) {
                            self.deviceList.splice(i, 1);
                            itemSub.characteristics = characteristics;
                            self.deviceList.push(itemSub);
                            return false;
                        }
                    })
                    self.$store.commit("setList", self.deviceList);
                }
            },
            record: function (mac) {
                var self = this;
                var list = self.$store.state.mixList;
                var info = null;
                $.each(self.deviceList, function (i, item) {
                    if (item.mac == mac) {
                        info = {type: RECENT_TYPE_DEVICE, obj: item};
                        return false;
                    }
                });
                if (!self._isEmpty(info)) {
                    $.each(list, function(i, item) {
                        if (item.type == RECENT_TYPE_DEVICE) {
                            if (item.obj.mac == mac) {
                                list.splice(i, 1);
                                return false;
                            }
                        }
                    });
                    list.splice(0, 0, info);
                    self.$store.commit("setRecentList", list);
                    window.espmesh.saveOperation(RECENT_TYPE_DEVICE, mac);
                }

            },
            startBleScan: function() {
                var self = this,
                    flag = window.espmesh.isBluetoothEnable();
                if (flag) {
                    window.espmesh.startBleScan();
                } else {
                    MINT.Toast({
                        message: self.$t('bleConDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                }

            },
            stopBleScan: function() {
                clearTimeout(SCAN_DEVICE);
                window.espmesh.stopBleScan();
            },
            onBackIndex: function() {
                var self = this;
                clearTimeout(SCAN_DEVICE);
                window.onScanBLE = self.onScanBLE;
                window.onDeviceFound = self.onDeviceFound;
                window.onDeviceLost = self.onDeviceLost;
                setTimeout(function() {
                    self.$store.commit("setConScanDeviceList", []);
                }, 60000);
                SCAN_DEVICE = setTimeout(function() {
                    self.startBleScan();
                }, 10000);
                var startTime = 0;
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
            },
            onWifiStateChanged: function(wifi) {
                var self = this;
                wifi =JSON.parse(wifi);
                if (wifi.connected) {
                    if (self.wifiNum != 0) {
                        clearTimeout(WIFI_TIMER);
                        WIFI_TIMER = setTimeout(function() {
                            MINT.Toast({
                                message: self.$t('wifiChangeDesc'),
                                position: 'bottom',
                                duration: 2000
                            });
                            self.showAdd = false;
                            self.loadDesc = self.$t('loading');
                            self.showLoad();
                            self.reload();
                        }, 3000);
                    }
                    self.wifiNum++;
                    self.$store.commit("setWifiInfo", wifi);
                }
            },
            onScanBLE: function (devices) {
                var self = this,
                    scanList = [],rssiList = [],
                    rssiValue = self.$store.state.rssiInfo;
                if (!self._isEmpty(devices)) {
                    var conScanDeviceList = self.$store.state.conScanDeviceList;
                    devices = JSON.parse(devices);
                    $.each(devices, function(i, item) {
                        if (item.rssi >= rssiValue) {
                            rssiList.push(item);
                        }
                    })
                    if (rssiList.length > 0) {
                        if (self._isEmpty(conScanDeviceList) || conScanDeviceList.length <= 0) {
                            self.getDevices(rssiList);
                            var len = self.deviceList.length;
                            if (len > 0) {
                                self.showAdd = false;
                                self.$refs.remind.hide();
                                self.$refs.scanDevice.show();
                                self.$refs.scanDevice.onBackReset();
                            } else {
                                self.showAdd = true;
                                self.$refs.scanDevice.hideThis();
                                self.$refs.remind.show();
                            }
                            self.$store.commit("setScanDeviceList", rssiList);

                        } else {
                            $.each(rssiList, function(i, item) {
                                if (conScanDeviceList.indexOf(item.mac) <= -1) {
                                    scanList.push(item);
                                }
                            });
                            if (scanList.length > 0) {
                                self.getDevices(rssiList);
                                var len = self.deviceList.length;
                                if (len > 0) {
                                    self.showAdd = false;
                                    self.$refs.remind.hide();
                                    self.$refs.scanDevice.show();
                                } else {
                                    self.showAdd = true;
                                    self.$refs.scanDevice.hideParent();
                                    self.$refs.remind.show();
                                }
                                self.$store.commit("setScanDeviceList", rssiList);
                            }
                        }
                    }

                }
            },
            onDeviceScanned: function(devices) {
               var self = this;
               console.log(devices);
               if (!self._isEmpty(devices)) {
                   devices = JSON.parse(devices);
                   if(devices.length > 0) {
                       self.showAdd = false;
                       self.hideLoad();
                       $.each(self.deviceList, function(i, item) {
                           var flag = true;
                           $.each(devices, function(j, itemSub) {
                               if (item.mac == itemSub.mac) {
                                   flag = false;
                                   return false;
                               }
                           });
                           if (flag) {
                              devices.push(item);
                           }
                       });
                       self.deviceList = devices;
                   }
               }
               if (self.deviceList.length <= 0) {
                   self.showAdd = true;
                   self.hideLoad();
                   MINT.Toast({
                       message: self.$t('notLoadDesc'),
                       position: 'bottom',
                   });
               }
               self.$refs.loadmore.onTopLoaded();
               self.startBleScan();
               self.onBackIndex();
               self.setGroup()
               self.setMixList();
               self.setPairs();
               self.$store.commit("setList", self.deviceList);
            },
            onDeviceScanning: function(devices) {
                var self = this, macs = [];
                if (!self._isEmpty(devices)) {
                    devices = JSON.parse(devices);
                    self.deviceList = self.$store.state.deviceList;
                    $.each(self.deviceList, function(i,item){
                        macs.push(item.mac);
                    });
                    $.each(devices, function(i, item) {
                        if (macs.indexOf(item.mac) < 0) {
                            self.deviceList.push(item);
                        }
                    });
               }
               self.$store.commit("setList", self.deviceList);

            },
        },
        created: function () {
            window.onDeviceScanned = this.onDeviceScanned;
            window.onDeviceFound = this.onDeviceFound;
            window.onDeviceLost = this.onDeviceLost;
            window.onDeviceStatusChanged = this.onDeviceStatusChanged;
            window.onWifiStateChanged = this.onWifiStateChanged;
            window.onScanBLE = this.onScanBLE;
            window.onDeviceScanning = this.onDeviceScanning;
            window.onTopoScanned = this.onTopoScanned;
        },
        components: {
            "v-footer": footer,
            "v-resetDevice": resetDevice,
            "v-addGroup": addGroup,
            "v-operateDevice": operateDevice,
            "v-load": load,
            "v-aboutDevice": aboutDevice,
            "v-otaInfo": otaInfo,
            "v-automation": automation,
            "v-ibeacon": ibeacon,
            "v-scanDevice": scanDevice,
            "v-remind": remind,
            "v-attr": attr,
            "v-setDevicePair": setDevicePair,
            "v-joinDevice": joinDevice
        }

    });

    return Index;
});