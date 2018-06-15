define(["vue", "MINT", "txt!../../pages/debug.html", "./debugInfo"],
    function(v, MINT, debug, debugInfo) {

    var Debug = v.extend({

        template: debug,

        data: function(){
            return {
                flag: false,
                deviceList: [],
                oldDevices: [],
                addMacs: [],
                delMacs: [],
                oldMacs: [],
                debugList: [],
                myChart: "",
                debugInfo: "",
            }
        },
        methods:{
            show: function () {
                var self = this;
                self.initHtml();
                self.flag = true;

            },
            initHtml: function() {
                var self = this;
                self.debugList = [];
                self.deviceList = self.$store.state.deviceList;
                self.oldMacs = [];
                self.addMacs = [];
                self.delMacs = [];
                self.oldDevices = [];
                self.hideThis();
                self.debugInfo = "";
                if (!self._isEmpty(self.myChart)) {
                    self.myChart.dispose();
                }
                MINT.Indicator.open();
                setTimeout(function() {
                    self.getOldList();
                    self.getData();
                    window.onDeviceFound = self.onDeviceFound;
                    window.onDeviceLost = self.onDeviceLost;
                }, 1000);
            },
            refresh: function() {
                this.initHtml();
            },
            hide: function () {
                this.flag = false;
                this.myChart.dispose();
                this.$emit("debugShow");
            },
            getOldList: function() {
                var self = this;
                $.each(self.deviceList, function(i, item) {
                    if (self.oldMacs.indexOf(item.mac) == -1) {
                        self.oldMacs.push(item.mac);
                        self.oldDevices.push(item);
                    }
                });
            },
            getData: function() {
                var self = this, macs = [], dataJson = {};
                $.each(self.oldDevices, function(i, item) {
                    macs.push(item.mac);
                })
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) + ',"' + MESH_REQUEST + '": "' + GET_MESH + '"}';
                var res = window.espmesh.requestDevicesMulticast(data);;
                console.log(res);
                if (!self._isEmpty(res)) {
                    res = JSON.parse(res);
                    self.debugList = res;
                }
                self.initChart(self.getInitData());
                MINT.Indicator.close();
            },
            getMesh: function(mac) {
                var self = this, macs = [], dataJson = {};
                $.each(self.debugList, function(i, item) {
                    macs.push(item.mac);
                })
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify([mac]) + ',"' + MESH_REQUEST + '": "' + GET_MESH + '"}';
                var res = window.espmesh.requestDevicesMulticast(data);
                if (!self._isEmpty(res)) {
                    res = JSON.parse(res);
                    if (res.length > 0) {
                        if (macs.indexOf(res[0].mac) == -1) {
                            self.debugList.push(res[0]);
                        }
                    }

                }
            },
            getInitData: function() {
                var self = this, layer = 0, rootItem = {},list = [];
                $.each(self.debugList, function(i, item) {
                    if (item.layer > layer) {
                        layer = item.layer;
                    }
                });
                for(var i = layer; i > 0; i--) {
                    var parentItem = [];
                    $.each(self.debugList, function(k, item){
                        var chids = [];
                        if (item.layer == i) {
                            $.each(self.debugList, function(l, itemSub) {
                                if (itemSub.parent_mac == item.mac) {
                                    var flagRes = true;
                                    $.each(list, function(n, itemThr){
                                        if (itemThr.mac == itemSub.mac) {
                                            chids.push(itemThr);
                                            flagRes = false;
                                            return false;
                                        }
                                    });
                                    if (flagRes) {
                                        chids.push({id: itemSub.mac, name: self.getName(itemSub.mac),
                                            label: {color: self.getColor(itemSub.mac)}, mac: itemSub.mac, children: []})
                                                                             }

                                }
                            })
                            parentItem.push({id: item.mac, name: self.getName(item.mac),
                                label: {color: self.getColor(item.mac)}, mac: item.mac, children: chids});
                        }

                    });
                    if (i == 1) {
                        rootItem = parentItem[0];
                    } else {
                        list = parentItem;
                    }

                }
                return rootItem;
            },
            getName: function(mac) {
                var self = this, name = "";
                $.each(self.oldDevices, function(i, item){
                    if (item.mac == mac) {
                        if (!self._isEmpty(item.position)) {
                            name = item.position;
                        } else {
                            name = item.name;
                        }
                        return false;
                    }
                });
                return name;
            },
            getColor: function(mac) {
                var self = this, color = "#666",
                    addNum = self.addMacs.indexOf(mac),
                    delNum = self.delMacs.indexOf(mac);
                if (addNum != -1 && delNum != -1) {
                    color = "#666";
                } else if (addNum != -1) {
                    color = "#0dea7e";
                } else if (delNum != -1) {
                    color = "#e83730";
                }
                return color;
            },
            initChart: function (data) {
                var self = this;
                self.myChart = echarts.init(document.getElementById("chart"));
                window.addEventListener('resize',function(){
                    self.myChart.resize();
                });
                var option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: function(data){

                        }
                    },
                    series: [
                        {
                            type: 'tree',
                            initialTreeDepth: 15,
                            data: [data],

                            top: '18%',
                            left: '2%',
                            bottom: '5%',
                            right: '2%',

                            symbolSize: 18,
                            orient: 'vertical',
                            itemStyle: {
                                normal: {
                                    borderColor: "#44B2F8"
                                }
                            },
                            label: {
                                normal: {
                                    position: 'top',
                                    rotate: -90,
                                    verticalAlign: 'middle',
                                    align: 'right',
                                    fontSize: 11,
                                }
                            },
                            lineStyle: {
                                normal: {

                                }
                            },
                            leaves: {
                                label: {
                                    normal: {
                                        position: 'bottom',
                                        rotate: -90,
                                        verticalAlign: 'middle',
                                        align: 'left'
                                    }
                                }
                            },


                        }
                    ]
                }
                self.myChart.setOption(option);
                var timeOutEvent = 0;
                self.myChart.on("mousedown", function(params) {
                    timeOutEvent = setTimeout(function(){
                        self.getDebugInfo(params.data.id);
                        setTimeout(function() {
                            self.showDebugInfo();
                        })
                    },500);
                })
                self.myChart.on("mousemove", function(params) {
                    clearTimeout(timeOutEvent);//清除定时器
                    timeOutEvent = 0;
                })
                self.myChart.on("mouseup", function(params) {
                    clearTimeout(timeOutEvent);//清除定时器
                    timeOutEvent = 0;
                })
            },
            showDebugInfo: function () {
                this.$refs.debugInfo.show();
            },
            getDebugInfo: function(mac) {
                var self = this;
                $.each(self.debugList, function(i, item) {
                    if (item.mac == mac) {
                        self.debugInfo = item;
                        return false;
                    }
                })
            },
            hideThis: function () {
                window.onBackPressed = this.hide;
            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
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
            onDeviceFound: function (device) {
                var self = this;
                if (self._isEmpty(self.deviceList)) {
                    self.deviceList = [];
                }
                if (!self._isEmpty(device)) {
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
                if (!self._isEmpty(self.myChart)) {
                    if (isExist) {
                        var len = self.delMacs.indexOf(device.mac);
                        if (len != -1) {
                            self.delMacs.splice(len, 1);
                        } else {
                            if (self.addMacs.indexOf(device.mac) == -1) {
                                self.addMacs.push(device.mac);
                            }
                        }
                    }
                    self.getOldList();
                    self.getMesh(device.mac);
                    self.myChart.setOption({
                        series:[
                            {
                                data: [self.getInitData()]
                            }
                        ]
                    })
                }
               self.$store.commit("setList", self.deviceList);
            },
            onDeviceLost: function (mac) {
                var self = this;
                if (!self._isEmpty(mac)) {
                    $.each(self.deviceList, function(i, item) {
                        if (item.mac == mac) {
                            self.deviceList.splice(i, 1);
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
                if (!self._isEmpty(self.myChart)) {
                    var len = self.addMacs.indexOf(mac);
                    if (len != -1) {
                        self.addMacs.splice(len, 1);
                    }
                    if (self.delMacs.indexOf(mac) == -1) {
                        self.delMacs.push(mac);
                    }
                    self.myChart.setOption({
                        series:[
                            {
                                data: [self.getInitData()]
                            }
                        ]
                    })
                }
               self.deviceList = self.$store.state.deviceList;
               self.$store.commit("setList", self.deviceList);
            }
        },
        components: {
            "v-debugInfo": debugInfo
        }

    });
    return Debug;
});