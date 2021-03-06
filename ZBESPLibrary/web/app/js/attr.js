define(["vue", "MINT", "txt!../../pages/attr.html"],
    function(v, MINT, attr) {

    var Attr = v.extend({

        template: attr,
        data: function(){
            return {
                flag: false,
                deviceList: [],
                deviceMacs:[],
                device: {},
                deviceName: "",
                attrList: []
            }
        },
        computed: {

        },
        methods:{
            show: function () {
                var self = this;
                $("#attr-wrapper").empty();
                window.onBackPressed = self.hide;
                self.device = self.$store.state.deviceInfo;
                console.log(JSON.stringify(self.device));
                self.deviceList = self.$store.state.deviceList;
                self.attrList = [];
                self.getAttrList();
                //$(".slider-input").slider('destroy');
                self.deviceName = self.device.name;
                self.flag = true;

            },
            hide: function () {
                this.flag = false;
                this.$emit("attrShow");
            },
            initAttrSlider: function(id, name, value, perms) {
                var self = this;
                setTimeout(function() {
                    $("#" + id + name).slider().on("change", function(e) {
                        var doc = $(this),
                            docParent = doc.parent().parent();
                        docParent.find(".icon-blue").text(e.value.newValue);
                        docParent.find(".input-value").val(e.value.newValue);
                    }).on("slideStop", function(slideEvt){
                        var doc = $(this),
                            cid = doc.attr("data-cid");
                        self.setAttr(cid, slideEvt.value);
                    });
                    if (self.isReadable(perms) && !self.isWritable(perms)) {
                        $("#" + id + name).slider("disable");
                    }
                    $("#" + id + name).parent().parent().find(".icon-blue").text(value);
                })
                return true;
            },
            isShowInput: function(perms) {
                var self = this, flag = true;
                if (self.isReadable(perms) && !self.isWritable(perms)) {
                    flag = false;
                }
                return flag;
            },
            getAttrList: function() {
                var self = this;
                $.each(self.device.characteristics, function(i, item) {
                    if (self.isReadable(item.perms) || self.isWritable(item.perms)) {
                        self.attrList.push(item);
                    }
                });
            },
            isReadable: function(perms) {
                return (perms & 1) == 1;
            },
            isWritable: function(perms) {
                return ((perms >> 1) & 1) == 1;
            },
            changValue: function(e, cid) {
                var doc = $(e.currentTarget),
                    docParent = doc.parent().parent(),
                    value = doc.val();
                docParent.find(".icon-blue").text(value);
                $("#" + cid).slider("setValue", value);
            },
            resetValue: function(value, cid, e) {
                var doc = $(e.currentTarget),
                    docParent = doc.parent().parent();
                docParent.find(".input-value").val(value);
                docParent.find(".icon-blue").text(value);
                $("#" + cid).slider("setValue", value);
            },
            sendValue: function(e) {
                var self = this,
                    doc = $(e.currentTarget),
                    docInput = $(doc).parent().parent().find(".input-value"),
                    value = docInput.val(),
                    cid = docInput.attr("data-cid");
                self.setAttr(cid, value);
            },
            setAttr: function(cid, value) {
                var self = this,
                    meshs = [],
                    characteristics = [],
                    attrFlag = false;
                $.each(self.device.characteristics, function(i, item) {
                    if (item.cid == cid) {
                        if (value != item.value) {
                            item.value = parseInt(value);
                            attrFlag = true;
                        }

                    }
                    characteristics.push(item);
                });
                if (attrFlag) {
                    self.device.characteristics = characteristics;
                    $.each(self.deviceList, function(i, item){
                        if (item.mac == self.device.mac) {
                            self.deviceList.splice(i, 1, self.device);
                            return false;
                        }
                    });
                    meshs.push({cid: parseInt(cid), value: parseInt(value)});
                    var data = '{"' + MESH_MAC + '": "' + self.device.mac + '","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                                    '"characteristics":' + JSON.stringify(meshs) + '}';
                    window.espmesh.requestDeviceAsync(data);
                    self.$store.commit("setList", self.deviceList);
                }

            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            },
        },
        components: {

        }

    });

    return Attr;
});