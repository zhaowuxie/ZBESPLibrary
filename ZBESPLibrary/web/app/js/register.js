define(["vue", "MINT", "txt!../../pages/register.html"], function(v, MINT, register) {

    var Register = v.extend({

        template: register,

        data: function(){
            return {
                email: "",
                username: "",
                password: "",
                repassword: "",
                regShow: false
            }
        },
        methods:{
            register: function () {
                var self = this;
                if (self._isEmpty(self.email)) {
                    MINT.Toast({
                        message: self.$t('emailDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEmpty(self.username)) {
                    MINT.Toast({
                        message: self.$t('userNameDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEmpty(self.password)) {
                    MINT.Toast({
                        message: self.$t('passwordDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEmpty(self.repassword)) {
                    MINT.Toast({
                        message: self.$t('rePasswordDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self.repassword != self.password) {
                    MINT.Toast({
                        message: self.$t('differentDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                MINT.Indicator.open();
                setTimeout(function () {
                    var res = window.espmesh.userRegister(self.email, self.username, self.password);
                    MINT.Indicator.close();

                    if (!self._isEmpty(res)) {
                        res = JSON.parse(res);
                        if (res.status == 0) {
                            MINT.Toast({
                                message: self.$t('registerSuccessDesc'),
                                position: 'bottom',
                                duration: 2000
                            });
                            self.hide();
                        } else {
                            MINT.Toast({
                                message: self.$t('registerFailDesc'),
                                position: 'bottom',
                                duration: 2000
                            });

                        }
                    }

                }, 100);


            },
            show: function () {
                 window.onBackPressed = this.hide;
                this.regShow = true;
            },
            hide: function () {
                this.regShow = false;
                this.$emit("regShow");
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

    return Register;
});