define(["vue", "MINT", "txt!../../pages/info.html", "../js/colorPicker"],
    function(v, MINT, info, colorPicker) {

    var Info = v.extend({

        template: info,
        props: {
            colorId: {
                type: String
            },
            temperatureId: {
                type: String
            }
        },
        data: function(){
            return {
                flag: false,
                operateType: RECENT_TYPE_DEVICE,
                deviceMacs: [],
                deviceList: [],
                deviceInfo: "",
            }
        },

        computed: {

        },
        methods:{
            show: function() {
                var self = this;
                window.onBackPressed = self.hideInfo;
                self.deviceInfo = self.$store.state.deviceInfo;
                self.deviceList = self.$store.state.deviceList;
                self.deviceMacs = [self.deviceInfo.mac];
                self.flag = true;
                setTimeout(function () {
                    self.setLeftAndTop();
                    self.$refs.deviceColor.show();
                })
            },
            setLeftAndTop: function() {
                var self = this,
                    doc = $("body"),
                    xy = $("#"+self.colorId),
                    width = doc.width();
                self.$store.commit("setTopColor", xy.offset().top);
                self.$store.commit("setLeftColor", ((width - INIT_SIZE) / 2));
            },
            hideInfo: function () {
                this.flag = false;
                this.$emit("infoShow");
            },
            getColor: function () {
                var self = this, hueValue = 0, saturation = 0, luminance = 0;
                $.each(self.deviceInfo.characteristics, function(i, item) {
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
                rgb = Raphael.hsb2rgb(hueValue / 360, saturation / 100, luminance / 100).hex;
                return rgb;
            },
            editName: function () {
                var self = this;
                MINT.MessageBox.confirm("Do you want to change the name?", "Modify the name").then(function(action) {
                    MINT.Indicator.open();
                    var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac + '","' + MESH_REQUEST + '": "' + RENAME_DEVICE + '",' +
                                '"name":' + JSON.stringify(self.deviceInfo.name) + '}';
                    setTimeout(function(){
                        var res = window.espmesh.requestDevice(data),
                        res = JSON.parse(res);
                        if (res.status_code == 0) {
                            $.each(self.deviceList, function(i, item){
                                if (item.mac == self.deviceInfo.mac) {
                                    self.deviceList.splice(i, 1, self.deviceInfo);
                                    return false;
                                }
                            });
                        }
                        MINT.Indicator.close();
                        self.$store.commit("setList", self.deviceList);
                    }, 500);
                });
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

        },
        components: {
            "v-color": colorPicker
        }

    });
    return Info;
});