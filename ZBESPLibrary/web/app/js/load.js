define(["vue", "txt!../../pages/load.html"],
    function(v, load) {

    var Load = v.extend({

        template: load,
        props: {
            loadDesc: {
                type: String
            }
        },
        data: function(){
            return {
                show: true,
                loadTitle: this.$t('loading')
            }
        },
        methods:{
            showTrue: function () {
                if (!this._isEmpty(this.loadDesc)) {
                    this.loadTitle = this.loadDesc;
                }
                this.show = true;
            },
            hide: function () {
                this.show = false;
            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            },
        }

    });
    return Load;
});