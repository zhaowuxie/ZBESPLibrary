define(["vue","MINT", "txt!../../pages/scan.html", "../js/reports", "../js/scanInfo", "../js/scanContent"],
    function(v, MINT, scan, reports, scanInfo, scanContent) {

        var Scan = v.extend({

            template: scan,
            data: function(){
                return {
                    addFlag: false,
                    deviceList: this.$store.state.deviceList,
                    rootMac: "",
                    scanInfo: {}
                }
            },
            methods:{
                show: function() {
                    var self = this;
                    self.onBackScan();
                    self.addFlag = true;
                    MINT.Indicator.open();
                    setTimeout(function(){
                        self.getScan();
                    },500);
                },
                hide: function () {
                    this.addFlag = false;
                    this.$emit("scanShow");
                },
                onBackScan: function () {
                    window.onBackPressed = this.hide;
                },
                getClass: function(value) {
                    var val = "";
                    $.each(SNIFFER_CLASS, function(i, item) {
                        if (item.value == value) {
                            val = item.label;
                            return false;
                        }
                    });
                    return val;
                },
                getType: function(value) {
                    var val = "";
                    $.each(SNIFFER_TYPE, function(i, item) {
                        if (item.value == value) {
                            val = item.label;
                            return false;
                        }
                    });
                    return val;
                },
                getFilter: function(value) {
                    var val = "";
                    $.each(SNIFFER_FILTER, function(i, item) {
                        if (item.value == value) {
                            val = item.label;
                            return false;
                        }
                    });
                    return val;
                },
                getScan: function() {
                    var data = '{"' + MESH_MAC + '": ' + JSON.stringify(this.getRootMac()) + ',"' + MESH_REQUEST + '": "' + GET_SNIFFER + '"}';
                    var res = window.espmesh.requestDevice(data);
                    if (!this._isEmpty(res)) {
                        this.scanInfo = JSON.parse(res);
                    }
                    MINT.Indicator.close();
                },
                getRootMac: function () {
                    var mac = "", self = this;
                    console.log(JSON.stringify(self.deviceList));
                    $.each(self.deviceList, function(i, item){
                        mac = item.root_mac;
                        return false;
                    });
                    this.rootMac = mac;
                    return mac;
                },
                showInfo: function() {
                    this.$refs.info.show();
                },
                showReports: function () {
                    this.$refs.reports.show();
                },
                showDevice: function () {
                    this.$refs.content.show();
                },
                _isEmpty: function (str) {
                    if (str === "" || str === null || str === undefined ) {
                        return true;
                    } else {
                        return false;
                    }
                },
                getColor: function () {
                    var hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#6b6b6b";
                    $.each(this.deviceInfo.characteristics, function(i, item) {
                        if (item.cid == HUE_CID) {
                            hueValue = item.value;
                        }else if (item.cid == SATURATION_CID) {
                            saturation = item.value;
                        }else if (item.cid == VALUE_CID) {
                            luminance = item.value;
                        } else if (item.cid == STATUS_CID) {
                            status = item.value;
                        }
                    })
                    if (status == STATUS_ON) {
                        rgb = Raphael.hsb2rgb(hueValue / 360, saturation / 100, luminance / 100).hex;
                    }
                    return rgb;
                },
            },
            components: {
                "v-reports": reports,
                "v-scanInfo": scanInfo,
                "v-scanContent": scanContent
            }

        });

        return Scan;
    });