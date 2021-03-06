define(["vue","MINT", "txt!../../pages/scanInfo.html"],
    function(v, MINT, scanInfo) {

        var ScanInfo = v.extend({

            template: scanInfo,
            props: {
                scanInfo: {
                    type: Object
                },
                rootMac: {
                    type: String
                }
            },
            data: function(){
                return {
                    addFlag: false,
                    scanClass: SNIFFER_CLASS,
                    scanType: SNIFFER_TYPE,
                    scanFilter: SNIFFER_FILTER
                }
            },
            methods:{
                show: function() {
                    window.onBackPressed = this.hide;
                    this.addFlag = true;
                },
                hide: function () {
                    this.addFlag = false;
                    this.$emit("scanInfoShow");
                },
                setIbeacon: function() {
                    var self = this;
                    MINT.Indicator.open();
                    var data = '{"' + MESH_MAC + '": "' + self.rootMac + '","' + MESH_REQUEST + '": "' + SET_SNIFFER +
                        '","enable": '+self.scanInfo.enable+',"type":'+self.scanInfo.type+',"notice_threshold":'+
                        self.scanInfo.notice_threshold+',"esp_module_filter":'+self.scanInfo.esp_module_filter+
                        ',"ble_scan_interval":'+self.scanInfo.ble_scan_interval+',"g_ble_scan_window":'+
                        self.scanInfo.g_ble_scan_window+'}';
                    setTimeout(function() {
                        var res = window.espmesh.requestDevice(data);
                        if (!self._isEmpty(res)) {
                            res = JSON.parse(res);
                            if (res.status_code == 0) {
                                MINT.Toast({
                                    message: self.$t('editSuccessDesc'),
                                    position: 'bottom',
                                });
                                setTimeout(function() {
                                    self.hide();
                                }, 1000);
                            } else {
                                MINT.Toast({
                                    message: self.$t('editFailDesc'),
                                    position: 'bottom',
                                });
                            }
                        }
                        MINT.Indicator.close();
                    }, 1000);

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
            }

        });

        return ScanInfo;
    });