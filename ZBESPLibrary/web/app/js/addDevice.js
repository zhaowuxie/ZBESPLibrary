define(["vue", "MINT", "txt!../../pages/addDevice.html", "./conDevice"], function(v, MINT, addDevice, conDevice) {

    var AddDevice = v.extend({

        template: addDevice,

        data: function(){
            return {
                addFlag: false,
                type: "password",
                showPwd: false,
                showNext: false,
                wifiInfo: this.$store.state.wifiInfo,
                wifiName: this.$t('no'),
                meshId: "",
                showMesh: false,
                meshIdOne: "",
                meshIdTwo: "",
                meshIdThr: "",
                meshIdFour: "",
                meshIdFive: "",
                meshIdSex: "",
                meshArray: [],
                password: "",
                slots1:[{values: [], defaultIndex: 0}],
            }
        },
        computed: {
            icon: function () {
                return this.showPwd ? 'icon-eye' : "icon-eye-off";
            },
            currentWifi: function () {
                var self = this;
                self.wifiInfo = this.$store.state.wifiInfo;
                if (self.addFlag) {
                    if (self._isEmpty(self.wifiInfo)) {
                        self.wifiName = self.$t('no');
                        self.password = "";
                    } else {
                        var loadAps = window.espmesh.loadAPs(),  wifiFlag = true;
                        var loadSsid = "";
                        if (!self._isEmpty(loadAps)) {
                            loadAps = JSON.parse(loadAps);
                        } else {
                            loadAps = [];
                        }
                        if (loadAps.length > 0) {
                            $.each(loadAps, function (i, item) {
                                if (item.ssid == self.wifiInfo.ssid) {
                                    self.wifiName = item.ssid;
                                    self.password = item.password;
                                    wifiFlag = false;
                                    return false;
                                }
                            })
                        }
                        if (wifiFlag) {
                            self.wifiName = self.wifiInfo.ssid;
                            self.password = ""
                        }
                    };
                    self.getMeshId();
                    self.configWifi();
                    return self.wifiName;
                }

            },
        },
        methods:{
            show: function() {
                var self = this;
                self.wifiInfo = this.$store.state.wifiInfo;
                self.wifiName = self.$t('no');
                self.password = "";
                self.showNext = false;
                self.onBackAddDevice();
                setTimeout(function() {
                    self.configWifi();
                }, 1000);
                self.nextInput();
                self.getMeshId();
                window.espmesh.stopBleScan();
                self.addFlag = true;
            },
            showPassword: function () {
                this.showPwd = !this.showPwd;
                if (this.type == "password") {
                    this.type = "text";
                } else {
                    this.type = "password";
                }
            },
            nextInput: function(){
                var txts = $(".form-input input");
                for(var i = 0; i < txts.length;i++){
                    var t = txts[i];
                    t.index = i;
                    t.onkeyup = function(){
                        var val = $(this).val();
                        var reg = /^[0-9a-fA-F]{1,2}$/;
                        if (reg.test(val)) {
                            if (val.length >= 2) {
                                var next = this.index + 1;
                                if(next > txts.length - 1) return;
                                txts[next].focus();
                            }
                        } else {
                            this.value = '';
                        }
                    }
                }
            },
            getMeshId: function() {
                var self = this,
                    meshIds = window.espmesh.loadMeshIds(),
                    id = window.espmesh.loadLastMeshId();
                self.meshArray = [];
                if (!self._isEmpty(meshIds)) {
                    self.meshArray = JSON.parse(meshIds);
                }
                self.setMeshID(self.wifiInfo.bssid);
                if (self.meshArray.indexOf(self.wifiInfo.bssid) == -1) {
                    self.meshArray.push(self.wifiInfo.bssid);
                }
                self.slots1 = [{values: self.meshArray
                                    , defaultIndex: self.meshArray.indexOf(self.wifiInfo.bssid)}];
            },
            setMeshID: function(id) {
                var self = this;
                if (!self._isEmpty(id)) {
                    var ids = id.split(":");
                    self.meshIdOne = ids[0];
                    self.meshIdTwo = ids[1];
                    self.meshIdThr = ids[2];
                    self.meshIdFour = ids[3];
                    self.meshIdFive = ids[4];
                    self.meshIdSex = ids[5];
                }
            },
            hideParent: function () {
                this.$emit("addDeviceShow");
                this.addFlag = false;
                this.$parent.hideParent();
            },
            hide: function () {
                this.$emit("addDeviceShow");
                this.addFlag = false;
            },
            onBackAddDevice: function() {
                window.onBackPressed = this.hide;
            },
            selectMesh: function() {
                this.showMesh = true;
                window.onBackPressed = this.hideMesh;
            },
            onMeshChange: function(picker, values) {
                var self = this;
                if (!self._isEmpty(values[0])) {
                    var ids = values[0].split(":");
                    self.meshIdOne = ids[0];
                    self.meshIdTwo = ids[1];
                    self.meshIdThr = ids[2];
                    self.meshIdFour = ids[3];
                    self.meshIdFive = ids[4];
                    self.meshIdSex = ids[5];

                }

            },
            hideMesh: function() {
                this.showMesh = false;
                window.onBackPressed = this.hide;
            },
            nextStep: function () {
                var self = this;
                var bleCon = window.espmesh.isBluetoothEnable();
                var locationCon = window.espmesh.isLocationEnable();
                if (self.showNext) {
                    MINT.Toast({
                        message: self.$t('wifiDesc'),
                        position: 'bottom',
                    });
                    return false;
                }
                if (!bleCon) {
                    MINT.Toast({
                        message: self.$t('bleConDesc'),
                        position: 'bottom',
                    });
                    return false;
                }
                if (!locationCon) {
                    MINT.Toast({
                        message: $t('locationConDesc'),
                        position: 'bottom',
                    });
                    return false;
                }
                if (self.wifiName == self.$t('no')) {
                    MINT.Toast({
                        message: self.$t('wifiNoDesc'),
                        position: 'bottom',
                    });
                    return false;
                }
                if (self._isEmpty(self.meshIdOne) || self._isEmpty(self.meshIdTwo) || self._isEmpty(self.meshIdThr) ||
                    self._isEmpty(self.meshIdFour) || self._isEmpty(self.meshIdFive) || self._isEmpty(self.meshIdSex)) {
                    MINT.Toast({
                        message: self.$t('meshIdDesc'),
                        position: 'bottom',
                    });
                    return false;
                }
                self.meshId = self.meshIdOne + ":" + self.meshIdTwo + ":" + self.meshIdThr + ":" + self.meshIdFour +
                    ":" + self.meshIdFive + ":" + self.meshIdSex;
                self.$refs.con.show();
            },
            configWifi: function () {
                var self = this;
                if (self.wifiInfo.frequency) {
                    var frequency = self.wifiInfo.frequency;
                    if (frequency > 4900 && frequency < 5900) {
                        MINT.Toast({
                            message: self.$t('wifiDesc'),
                            position: 'bottom',
                        });
                        self.showNext = true;
                    } else {
                        self.showNext = false;
                    }
                } else {
                    self.showNext = false;
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
            "v-conDevice": conDevice,
        }

    });

    return AddDevice;
});