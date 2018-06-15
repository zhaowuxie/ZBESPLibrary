define(["vue","MINT", "txt!../../pages/automation.html" ],
    function(v, MINT, automation) {
        var Automation = v.extend({

            template: automation,
            props: {
                deviceInfo: {
                    type: Object
                },
                autoId: {
                    type: String
                }
            },
            data: function(){
                return {
                    addFlag: false,
                    existEvent: false,
                    eventNames: [],
                    deviceList: [],
                    selected: 0,
                }
            },
            computed: {
                count: function () {
                    var self = this, list = [];
                    self.deviceList = self.$store.state.deviceList;
                    $.each(self.deviceList, function(i, item) {
                        if (item.tid >= MIN_LIGHT && item.tid <= MAX_LIGHT && item.mac != self.deviceInfo.mac) {
                            list.push(item);
                        }
                    });
                    return list.length;
                }
            },
            methods:{
                show: function() {
                    var self = this;
                    window.onBackPressed = self.hide;
                    self.selected = 0;
                    self.existEvent = false;
                    self.deviceList = self.$store.state.deviceList;
                    $("#" + self.autoId + " span.span-radio").removeClass("active");
                    MINT.Indicator.open();
                    setTimeout(function() {
                        var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac + '","' + MESH_REQUEST + '": "' + GET_EVENT +'"}';
                        var deviceEvents = window.espmesh.requestDevice(data);
                        if (!self._isEmpty(deviceEvents)) {
                            deviceEvents = JSON.parse(deviceEvents).events;
                            if (!self._isEmpty(deviceEvents)) {
                                self.existEvent = true;
                                var executeMac = deviceEvents[0].execute_mac;
                                self.eventNames = [];
                                $.each(deviceEvents, function(i, item) {
                                    self.eventNames.push({name: item.name});
                                });
                                $.each(self.deviceList, function(i, item) {
                                    if (executeMac.indexOf(item.mac) > -1) {
                                        self.selected++;
                                        $("#" + self.autoId + " span.span-radio[data-value='"+item.mac+"']").addClass("active");
                                    }
                                });
                            }

                        }
                        MINT.Indicator.close();
                    }, 1000);

                    self.addFlag = true;
                },
                hide: function () {
                    this.addFlag = false;
                    this.$emit("autoShow");
                },
                showCondition: function(mac, tid) {
                    var self = this, flag = true;
                    if (mac == self.deviceInfo.mac || tid < MIN_LIGHT || tid > MAX_LIGHT) {
                        flag = false;
                    };
                    return flag;
                },
                save: function() {

                    var self = this, docs = $("#" + self.autoId + " span.span-radio.active"),
                        macs = [], tid = self.deviceInfo.tid,
                        parentMac = self.deviceInfo.mac;
                    for (var i = 0; i < docs.length; i++) {
                        macs.push($(docs[i]).attr("data-value"));
                    };
                    if (macs.length > 0) {
                        MINT.Indicator.open();
                        if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                            if (tid == TOUCH_PAD_SWITCH) {
                                setTimeout(function() {
                                    self.switchTouchDefaultEvent(parentMac, macs);
                                    MINT.Indicator.close();
                                    self.hide();
                                }, 500);
                            } else {
                                setTimeout(function() {
                                    self.switchDefaultEvent(parentMac, macs);
                                    MINT.Indicator.close();
                                    self.hide();
                                }, 500);

                            }
                        } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                            setTimeout(function() {
                                self.sensorDefaultEvent(parentMac, macs);
                                MINT.Indicator.close();
                                self.hide();
                            }, 500);

                        } else if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                            setTimeout(function() {
                                self.lightSyscEvent(parentMac, macs);
                                MINT.Indicator.close();
                                self.hide();
                            }, 500);

                        }
                    } else if (self.existEvent) {
                        MINT.MessageBox.confirm(self.$t('wifiDesc'), self.$t('emptyEventTitle')).then(function(action) {
                            MINT.Indicator.open();
                            setTimeout(function() {
                                self.delEvent(parentMac);
                                MINT.Indicator.close();
                                self.hide();
                            }, 500);

                        });

                    } else {
                        self.hide();
                    }


                },
                delEvent: function (parentMac) {
                    var data = '{"' + MESH_MAC + '": "' + parentMac + '","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + REMOVE_EVENT + '",' +
                        '"events":' + JSON.stringify(this.eventNames) + '}';
                    window.espmesh.requestDevice(data);

                },
                switchTouchDefaultEvent: function(parentMac, childMacs) {
                    var self = this;
                    var splitMac = parentMac.substr((parentMac.length - 3), 3);
                    var events = [];

                    var eventLumiLnance = self._assemblySyscEvent("SYSC" + splitMac, TOUC_PAD_BTN_3, childMacs);
                    events.push(eventLumiLnance);

                    var eventRed = self._assemblySwitchEvent("RED_" + splitMac,TOUC_PAD_BTN_0,
                        childMacs, SYSC_RED_HUE, SYSC_RED_SATURATION);
                    events.push(eventRed);

                    var eventGreen = self._assemblySwitchEvent("GREEN_" + splitMac, TOUC_PAD_BTN_1,
                        childMacs, SYSC_GREEN_HUE, SYSC_GREEN_SATURATION);
                    events.push(eventGreen);

                    var eventBlue = self._assemblySwitchEvent("BLUE_" + splitMac, TOUC_PAD_BTN_2,
                        childMacs, SYSC_BLUE_HUE, SYSC_BLUE_SATURATION);
                    events.push(eventBlue);

                    self._addRequestEvent(parentMac, events);
                },
                sensorDefaultEvent: function (parentMac, childMacs) {
                    var self = this;
                    var splitMac = parentMac.substr((parentMac.length - 3), 3);
                    var events = [];
                    var eventON = self._assemblyOtherEvent(ON_EN + "_" + splitMac, SENSOR_CID,
                        childMacs, MESH_SENSOR_ON_COMPARE, STATUS_ON);
                    events.push(eventON);
                    var eventOFF = self._assemblyOtherEvent(OFF_EN + "_" + splitMac, SENSOR_CID,
                        childMacs, MESH_SENSOR_OFF_COMPARE, STATUS_OFF);
                    events.push(eventOFF);
                    self._addRequestEvent(parentMac, events);
                },
                switchDefaultEvent: function(parentMac, childMacs) {
                    var self = this;
                    var splitMac = parentMac.substr((parentMac.length - 3), 3);
                    var events = [];
                    var eventON = self._assemblyOtherEvent(ON_EN + "_" + splitMac, SWITCH_CID,
                        childMacs, MESH_LIGHT_ON_COMPARE, STATUS_ON);
                    events.push(eventON);
                    var eventOFF = self._assemblyOtherEvent(OFF_EN + "_" + splitMac, SWITCH_CID,
                        childMacs, MESH_LIGHT_OFF_COMPARE, STATUS_OFF);
                    events.push(eventOFF);

                    self._addRequestEvent(parentMac, events);

                },

                lightSyscEvent: function (parentMac, childMacs) {
                    var self = this;
                    var splitMac = parentMac.substr((parentMac.length - 3), 3);
                    var events = [];

                    var eventOn = self._assemblySyscEvent("ON_" + splitMac, STATUS_CID, childMacs);
                    var eventValue = self._assemblySyscEvent("VALUE_" + splitMac, VALUE_CID, childMacs);
                    var eventHue = self._assemblySyscEvent("HUE_" + splitMac, HUE_CID, childMacs);
                    var eventSaturation = self._assemblySyscEvent("SATURATION_" + splitMac, SATURATION_CID, childMacs);
                    var eventTemperature = self._assemblySyscEvent("TEMPERATURE_" + splitMac, TEMPERATURE_CID, childMacs);
                    var eventBrightess = self._assemblySyscEvent("BRIGHTNESS_" + splitMac, BRIGHTNESS_CID, childMacs);

                    events.push(eventOn);
                    events.push(eventValue);
                    events.push(eventHue);
                    events.push(eventSaturation);
                    events.push(eventTemperature);
                    events.push(eventBrightess);
                    self._addRequestEvent(parentMac, events);
                },
                selectAllDevice: function (e) {
                    var self = this;
                    var doc = $(e.currentTarget);
                    if (doc.hasClass("active")) {
                        doc.removeClass("active");
                        $("#" + self.autoId + " span.span-radio").removeClass("active");
                        this.selected = 0;
                    } else {
                        doc.addClass("active");
                        $("#" + self.autoId + " span.span-radio").addClass("active");
                        this.selected = this.count;
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
                _assemblyOtherEvent: function (name, cid, mac, compare, status) {
                    var event = {
                        "name": name,
                        "trigger_cid": cid,
                        "trigger_content": {"request": CONTROL},
                        "trigger_compare": compare,
                        "execute_mac": mac,
                        "execute_content":{"request": SET_STATUS,"characteristics":[
                            {"cid": STATUS_CID,"value": status}
                        ]}
                    };
                    return event;
                },
                _assemblySwitchEvent: function (name, cid, mac, hue, saturation) {
                    var event = {
                        "name": name,
                        "trigger_cid": cid,
                        "trigger_content": {"request": CONTROL},
                        "trigger_compare": MESH_LIGHT_SYSC_COLOR,
                        "execute_mac": mac,
                        "execute_content":{"request": SET_STATUS,"characteristics":[
                            {"cid": HUE_CID,"value": hue},
                            {"cid": SATURATION_CID,"value": saturation},
                        ]}
                    };
                    return event;
                },
                _assemblySyscEvent: function (name, cid, childMacs) {
                    var event = {
                        "name": name,
                        "trigger_content": {"request": SYSC,"execute_cid": cid},
                        "trigger_cid": cid,
                        "trigger_compare": MESH_LIGHT_SYSC,
                        "execute_mac": childMacs
                    };
                    return event;
                },
                _addRequestEvent: function (parentMac, events) {
                    var data = '{"' + MESH_MAC + '": "' + parentMac + '","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_EVENT + '",' +
                                    '"events":' + JSON.stringify(events) + '}';
                    window.espmesh.requestDevice(data);
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

        return Automation;
    });