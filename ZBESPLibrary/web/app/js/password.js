define(["vue", "MINT", "txt!../../pages/password.html"], function(v, MINT, password) {

    var Password = v.extend({

        template: password,
        props: {
            title: {
                type: String
            }
        },
        data: function(){
            return {
                pwdShow: false,
                email: "",
            }
        },
        methods:{
            register: function () {
                var self = this;
                if (self._isEmpty(self.email)) {
                    MINT.Toast({
                        message: self.$t('emailDesc'),
                        position: 'bottom',
                    });
                    return false;
                }
                MINT.Indicator.open();
                setTimeout(function() {
                    var res = window.espmesh.userResetPassword(self.email);
                    console.log(res);
                    if (!self._isEmpty(res)){
                        res = JSON.parse(res);
                        if (res.status == 0) {
                            MINT.Toast({
                                message: self.$t('sendSuccessDesc'),
                                position: 'bottom',
                            });
                            self.hide();
                        } else {
                            MINT.Toast({
                                message: self.$t('sendFailDesc'),
                                position: 'bottom',
                            });
                        }
                    }
                    MINT.Indicator.close();
                }, 1000);


            },
            onBackPwd: function() {
                this.hide();
            },
            show: function () {
                window.onBackPressed = this.hide;
                this.pwdShow = true;
            },
            hide: function () {
                this.pwdShow = false;
                this.$emit("pwdShow");
            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    });

    return Password;
});