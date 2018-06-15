define(["vue", "MINT", "txt!../../pages/group.html", "../js/footer", "./resetDevice", "../js/addGroup",
"../js/groupInfo", "../js/groupColor", "../js/otaInfo"],
    function(v, MINT, group, footer, resetDevice, addGroup, groupInfo, groupColor, otaInfo) {

    var Group = v.extend({
        template: group,

        data: function(){
            return {
                flag: false,
                group: "group",
                addGroupId: "group-addGroup",
                infoShow: false,
                editGroupId: "edit-group-id",
                colorId: "group-color",
                temperatureId: "group-temperature",
                otaGroupId: "ota-group-id",
                lightId: "light-group-id",
                deviceList: this.$store.state.deviceList,
                groupList: this.$store.state.groupList,
                groupObj: "",
                otaMacs: [],
                currentStatus: true,
                searchName: "",
                groupName: ""
            }
        },
        mounted: function() {
            this.onBackGroup();
            var res = window.espmesh.loadGroups();
            if (!this._isEmpty(res)) {
                this.groupList = JSON.parse(res);
                this.$store.commit("setGroupList", this.groupList);
            }
            this.onBackGroup();
        },
        computed: {
            list: function () {
                var self = this;
                self.deviceList = self.$store.state.deviceList;
                self.groupList = self.$store.state.groupList;
                if (self._isEmpty(self.searchName)) {
                    return self.groupList;
                } else {
                    var searchList = [];
                    $.each(self.groupList, function(i, item) {
                        if (item.name.indexOf(self.searchName) != -1) {
                            searchList.push(item);
                        }
                    })
                    return searchList;
                }
            }
        },

        methods:{
            addDevice: function (event) {
                this.flag = false;
                this.$refs.device.show();
            },
            getAllStatus: function () {
                var self = this,statusFlag = false;
                $.each(self.deviceList, function(i, item) {
                    $.each(item.characteristics, function(j, itemSub) {
                        if (itemSub.cid == STATUS_CID) {
                            if (itemSub.value == STATUS_ON) {
                                statusFlag = true;
                                return false;
                            }

                        }
                    });
                    if (statusFlag) {
                        return false;
                    }
                });
                return statusFlag;
            },
            getStatusByGroup: function (macs) {
                var self = this, statusFlag = false;
                if (macs.length > 0) {
                    $.each(self.deviceList, function(i, item) {
                        if (macs.indexOf(item.mac) > -1) {
                            $.each(item.characteristics, function(j, itemSub) {
                                if (itemSub.cid == STATUS_CID) {
                                    if (itemSub.value == STATUS_ON) {
                                        statusFlag = true;
                                        return false;
                                    }

                                }
                            });
                            if (statusFlag) {
                                return false;
                            }
                        }
                    });
                }
                return statusFlag;
            },
            isShow: function(macs) {
                var self = this,
                    flag = false;
                if (macs.length > 0) {
                    $.each(self.deviceList, function(i, item) {
                        if (macs.indexOf(item.mac) > -1) {
                            if (item.tid >= MIN_LIGHT && item.tid <= MAX_LIGHT) {
                                flag = true;
                            }
                        }
                    });
                }
                return flag;

            },
            getDevicesByGroup: function (macs) {
                var self = this, count = 0;
                if (macs.length > 0) {
                    $.each(self.deviceList, function(i, item) {
                        if (macs.indexOf(item.mac) > -1) {
                            count ++;
                        }
                    });
                }
                return count;

            },
            addGroup: function () {
                var self = this;
                self.flag = false;
                MINT.MessageBox.prompt(self.$t('addGroupDesc'), self.$t('addGroupTitle'),
                    {inputValue: "", inputPlaceholder: self.$t('addGroupInput'),
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj) {
                    self.$refs.add.show();
                    self.groupName = obj.value;
                });

            },
            showUl: function () {
                this.flag = !this.flag;
            },
            hideUl: function () {
                this.flag = false;
            },
            showInfo: function () {
                this.hideOperate();
                this.$refs.info.show();
            },
            showOta: function () {
                this.infoShow = false;
                this.otaMacs = [];
                this.otaMacs = this.groupObj.device_macs;
                this.$refs.ota.show();
            },
            editName: function () {
                var self = this;
                self.hideOperate();
                MINT.MessageBox.prompt(self.$t('editNameInput'), self.$t('editGroupTitle'),
                    {inputValue: self.groupObj.name, inputPlaceholder: self.$t('addGroupInput'),
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj)  {
                    window.espmesh.saveGroup(self.groupObj.id, obj.value, null);
                    self.groupObj.name = obj.value;
                    self.changeStore();
                    self.groupList.push(self.groupObj);
                    self.$store.commit("setGroupList", self.groupList);
                });

            },
            dissolutionGroup: function (e) {
                var self = this,
                    doc = $(e.currentTarget);
                MINT.MessageBox.confirm(self.$t('delGroupDesc'), self.$t('delGroupTitle'),{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    self.hideOperate();
                    window.espmesh.deleteGroup(self.groupObj.id);
                    $("#" + self.groupObj.id).remove();
                    self.changeStore();
                    var list = self.$store.state.mixList;
                    $.each(list, function(i, item) {
                        if (item.type == RECENT_TYPE_GROUP) {
                            if (item.obj.id == self.groupObj.id) {
                                list.splice(i, 1);
                                return false;
                            }
                        }
                    })
                    self.$store.commit("setRecentList", list);
                    self.$store.commit("setGroupList", self.groupList);
                });

            },
            delDevices: function (e) {
                var doc = $(e.currentTarget),
                    self = this;
                MINT.MessageBox.confirm(self.$t('deleteGroupDeviceDesc'), self.$t('reconfigure'),{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    self.hideOperate();
                    MINT.Indicator.open();
                    setTimeout(function() {
                        var macs = self.groupObj.device_macs;
                        var devices = [];
                        $.each(self.deviceList, function(i, item) {
                            if (macs.indexOf(item.mac) < 0) {
                                devices.push(item);
                            }
                        })
                        self.deviceList = devices;
                        var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) + ',"'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + RESET_DEVICE + '","' +
                                        DEVICE_DELAY + '": ' + DELAY_TIME + '}';
                        window.espmesh.requestDevicesMulticast(data);
                        window.espmesh.removeDevicesForMacs(JSON.stringify(macs));
                        MINT.Indicator.close();
                        self.$store.commit("setList", self.deviceList);
                    }, 1000);

                });
            },
            changeStore: function () {
                var self = this;
                $.each(self.groupList, function(i, item) {
                    if (item.id == self.groupObj.id) {
                        self.groupList.splice(i, 1);
                        return false;
                    }
                });

            },
            showOperate: function (e) {
                var self = this, status = 0;
                var mac = $(e.target).attr("data-value");
                $.each(self.groupList, function(i, item) {
                    if (mac == item.id) {
                        self.groupObj = item;
                        return false;
                    }
                });
                self.record(self.groupObj.id);
                self.flag = false;
                self.infoShow = true;
                window.onBackPressed = self.hideOperate;
            },
            hideOperate: function () {
                this.onBackGroup();
                this.infoShow = false;
            },
            showColor: function (item) {
                var self = this;
                self.flag = false;
                self.groupObj = "";
                self.groupObj = item;
                setTimeout(function () {
                    self.record(self.groupObj.id);
                    self.$refs.groupcolor.show();
                }, 300);
            },
            close: function (macs, status, id) {
                var self = this, meshs = [];
                self.currentStatus = (status == STATUS_ON ? true : false);
                meshs.push({cid: STATUS_CID, value: parseInt(status)});
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) + ',"'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                           '"characteristics":' + JSON.stringify(meshs) + '}';
                window.espmesh.addQueueTask("requestDevicesMulticast",data);
                self.changeDevice(macs, status);
                self.record(id);
            },
            operateClose: function(macs, status, id) {
                var self = this;
                self.close(macs, status, id);
                setTimeout(function() {
                    window.onBackPressed = self.hideOperate;
                })
            },
            changeDevice: function (macs, status) {
                var self = this;
                $.each(self.deviceList, function(i, item){
                    if (macs.indexOf(item.mac) > -1) {
                        var characteristics = [];
                        $.each(item.characteristics, function(i, item) {
                            if (item.cid == STATUS_CID) {
                                item.value = parseInt(status);
                            }
                            characteristics.push(item);
                        });
                        item.characteristics = characteristics;
                        self.deviceList.splice(i, 1, item);
                    }
                });
                self.$store.commit("setList", self.deviceList);

            },
            record: function (groupId) {
                var self = this;
                var list = self.$store.state.mixList;
                var info = null;
                $.each(self.groupList, function (i, item) {
                    if (item.id == groupId) {
                        info = {type: RECENT_TYPE_GROUP, obj: item};
                        return false;
                    }
                });
                if (!self._isEmpty(info)) {
                    $.each(list, function(i, item) {
                        if (item.type == RECENT_TYPE_GROUP) {
                            if (item.obj.id == groupId) {
                                list.splice(i, 1);
                                return false;
                            }
                        }
                    })
                    list.splice(0, 0, info);
                    self.$store.commit("setRecentList", list);
                    window.espmesh.saveOperation(RECENT_TYPE_GROUP, groupId);
                }

            },
            onBackGroup: function() {
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

            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            }

        },
        components: {
            "v-footer": footer,
            "v-resetDevice": resetDevice,
            "v-addGroup": addGroup,
            "v-groupInfo": groupInfo,
            "v-otaInfo": otaInfo,
            "v-groupColor": groupColor
        }

    });

    return Group;
});