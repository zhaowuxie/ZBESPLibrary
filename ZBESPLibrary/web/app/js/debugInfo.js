define(["vue", "MINT", "txt!../../pages/debugInfo.html"],
    function(v, MINT, debugInfo) {

    var DebugInfo = v.extend({

        template: debugInfo,
        props: {
            debug: {
                type: Object
            }
        },
        data: function(){
            return {
                flag: false,
                deviceList: [],
            }
        },
        methods:{
            show: function () {
                var self = this;
                self.hideThis();
                self.deviceList = this.$store.state.deviceList;
                self.flag = true;
            },
            hide: function () {
                this.flag = false;
                this.$emit("debugInfoShow");
            },
            hideThis: function () {
                window.onBackPressed = this.hide;
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
    return DebugInfo;
});