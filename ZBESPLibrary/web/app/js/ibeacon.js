define(["vue","MINT", "txt!../../pages/ibeacon.html", "./ibeaconInfo"],
    function(v, MINT, ibeacon, ibeaconInfo) {

        var Ibeacon = v.extend({

            template: ibeacon,
            props: {
                deviceInfo: {
                    type: Object
                }
            },
            data: function(){
                return {
                    addFlag: false,
                    ibeaconInfo: {}
                }
            },
            methods:{
                show: function() {
                    var self = this;
                    self.onBackIbean();
                    self.addFlag = true;
                    MINT.Indicator.open();
                    setTimeout(function(){
                        self.getIbeacon();
                    },500);
                },
                hide: function () {
                    this.addFlag = false;
                    this.$emit("ibeanShow");
                },
                onBackIbean: function () {
                    window.onBackPressed = this.hide;
                },
                getIbeacon: function() {
                    var data = '{"' + MESH_MAC + '": "' + this.deviceInfo.mac + '","' + MESH_REQUEST + '": "' + GET_IBEACON + '"}';
                    var res = window.espmesh.requestDevice(data);
                    if (!this._isEmpty(res)) {
                        this.ibeaconInfo = JSON.parse(res);
                    }
                    MINT.Indicator.close();
                },
                showInfo: function() {
                    this.$refs.ibeaconInfo.show();
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
                "v-ibeaconInfo": ibeaconInfo
            }

        });

        return Ibeacon;
    });