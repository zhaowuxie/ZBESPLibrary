define(["vue", "txt!../../pages/addGroup.html"], function(v, addGroup) {

    var AddGroup = v.extend({
        template: addGroup,
        props: {
            name: {
                type: String
            },
            addGroupId: {
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
                        if (item.position.search(self.searchName) != -1 || item.name.search(self.searchName) != -1) {
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
                $("span.span-radio").removeClass("active");
                this.selected = 0;
                this.addFlag = true;

            },
            hide: function () {
                this.addFlag = false;
                this.$emit("addGroupShow");
            },
            focus: function (e) {
                $(e.currentTarget).parent().addClass("active");
            },
            blur: function (e) {
                var self = this;
                if (self._isEmpty(self.searchName)) {
                    $(e.currentTarget).parent().removeClass("active");
                }
            },
            save: function () {
                var docs = $("#"+ this.addGroupId + " .item span.span-radio.active"),
                    macs = [];
                for (var i = 0; i < docs.length; i++) {
                    macs.push($(docs[i]).attr("data-value"));
                };
                var res = window.espmesh.saveGroup(null, this.name, JSON.stringify(macs));
                if (res) {
                    var groupList = this.$store.state.groupList;
                    groupList.push({id: res, name: this.name, device_macs: macs});
                    this.$store.commit("setGroupList", groupList);
                    this.hide();
                    this.$router.push({
                        path: "/group"
                    });
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
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            },
        },
        created: function () {

        }

    });
    return AddGroup;
});