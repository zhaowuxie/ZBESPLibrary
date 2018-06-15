define(["vue", "MINT", "txt!../../pages/groupInfo.html", "../js/operateDevice", ],
    function(v, MINT, groupInfo, operateDevice) {

    var GroupInfo = v.extend({
        template: groupInfo,
        props: {
            group: {
                type: Object
            },
            editDeviceId: {
                type: String
            }

        },
        data: function(){
            return {
                addFlag: false,
                deviceList: this.$store.state.deviceList,
                total: 0,
                selected: 0,
                searchName: "",
            }
        },
        computed: {
            list: function () {
                var self = this, list = [];
                self.deviceList = self.$store.state.deviceList;
                if (self._isEmpty(self.searchName)) {
                    list = self.deviceList;
                } else {
                    var searchList = [];
                    $.each(self.deviceList, function(i, item) {
                        if (item.position.indexOf(self.searchName) != -1 || item.name.indexOf(self.searchName) != -1) {
                            searchList.push(item);
                        }
                    })
                    list = searchList;
                }
                self.total = list.length;
                return list;
            }
        },
        methods:{
            show: function() {
                window.onBackPressed = this.hide;
                $("#"+ this.editDeviceId+" span.span-radio").removeClass("active");
                this.deviceList = this.$store.state.deviceList;
                var macsSelects = this.getDevicesByGroup(this.group.device_macs);
                this.selected = macsSelects.length;
                for (var i in macsSelects) {
                    $("#"+ this.editDeviceId+ " span.span-radio[data-value='"+macsSelects[i]+"']").addClass("active");
                }
                this.addFlag = true;
            },
            hide: function () {
                this.addFlag = false;
                this.$emit("groupInfoShow");
            },
            save: function () {
                var docs = $("#"+ this.editDeviceId+" span.span-radio.active"),
                    macs = [], self = this;
                for (var i = 0; i < docs.length; i++) {
                    macs.push($(docs[i]).attr("data-value"));
                };
                var res = window.espmesh.saveGroup(self.group.id, self.group.name, JSON.stringify(macs));
                if (res) {
                    self.group.device_macs = macs;
                    var groupList = self.$store.state.groupList;
                    if (groupList.length > 0) {
                        $.each(groupList, function(i, item) {
                            if (item.id == res) {
                                groupList.splice(i, 1, self.group);
                                return false;
                            }
                        })
                    }
                    self.$store.commit("setGroupList", groupList);
                    self.hide();
                }
            },
            selectAllDevice: function (e) {
                var doc = $(e.currentTarget);
                if (doc.hasClass("active")) {
                    doc.removeClass("active");
                    $("span.span-radio").removeClass("active");
                    this.selected = 0;
                } else {
                    doc.addClass("active");
                    $("span.span-radio").addClass("active");
                    this.selected = this.total;
                }

            },
            selectDevice: function (e) {
                var doc = $(e.currentTarget);
                if (doc.hasClass("active")) {
                    doc.removeClass("active");
                    this.selected -= 1;
                } else {
                    doc.addClass("active");
                    this.selected += 1;
                }
            },
            getDevicesByGroup: function (macs) {
                var self = this, selectMacs = [];
                $.each(self.deviceList, function(i, item) {
                    if (macs.indexOf(item.mac) > -1) {
                        selectMacs.push(item.mac);
                    }
                });
                return selectMacs;

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
            "v-operateDevice": operateDevice
        }

    });
    return GroupInfo;
});