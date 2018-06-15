define(["vue","MINT", "txt!../../pages/ibeaconInfo.html"],
    function(v, MINT, ibeaconInfo) {

        var IbeaconInfo = v.extend({

            template: ibeaconInfo,
            props: {
                deviceInfo: {
                    type: Object
                },
                ibeaconInfo: {
                    type: Object
                }
            },
            data: function(){
                return {
                    addFlag: false
                }
            },
            methods:{
                show: function() {
                    window.onBackPressed = this.hide;
                    this.addFlag = true;
                },
                hide: function () {
                    this.addFlag = false;
                    this.$emit("ibeanInfo");
                },
                setIbeacon: function() {
                    var self = this;
                    MINT.Indicator.open();
                    var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac + '","' + MESH_REQUEST + '": "' + SET_IBEACON +
                        '","name": "'+self.ibeaconInfo.name+'","uuid": "'+self.ibeaconInfo.uuid+'","major":'+
                        self.ibeaconInfo.major+',"minor":'+self.ibeaconInfo.minor+',"power":'+self.ibeaconInfo.power+'}';
                    setTimeout(function() {
                         var res = window.espmesh.requestDevice(data);
                         if (!self._isEmpty(res)) {
                             res = JSON.parse(res);
                             if (res.status_code == 0) {
                                 MINT.Toast({
                                     message: '修改成功!',
                                     position: 'bottom',
                                 });
                                 setTimeout(function() {
                                     self.ibeaconInfo.name = self.name;
                                     self.ibeaconInfo.major = self.major;
                                     self.ibeaconInfo.uuid = self.UUID;
                                     self.ibeaconInfo.minor = self.minor;
                                     self.ibeaconInfo.power = self.power;
                                     self.hide();
                                 }, 1000);
                             } else {
                                 MINT.Toast({
                                     message: '修改失败!',
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

        return IbeaconInfo;
    });