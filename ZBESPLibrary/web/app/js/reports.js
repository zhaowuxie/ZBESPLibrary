define(["vue","MINT", "txt!../../pages/reports.html"],
    function(v, MINT, reports) {

        var Reports = v.extend({

            template: reports,
            props: {
                deviceInfo: {
                    type: Object
                }
            },
            data: function(){
                return {
                    addFlag: false,
                    ibeaconInfo: {}
                }
            },
            methods:{
                show: function() {
                    var self = this;
                    window.onBackPressed = self.hide;
                    self.addFlag = true;
                    //MINT.Indicator.open();
                    setTimeout(function(){
                        //self.getIbeacon();
                        self.initLineEcharts("line-chart");
                        self.initBarEcharts("bar-chart");
                        self.initPieEcharts("pie-chart");
                    },500);
                },
                hide: function () {
                    this.addFlag = false;
                    this.$emit("reportsShow");
                },
                initLineEcharts: function (id) {
                    var myChart = echarts.init(document.getElementById(id));
                    var option = {
                        title: {
                            text: '当日客流量变化趋势',
                            textStyle: {
                                fontWeight: 'normal',              //标题颜色
                                color: '#858585',
                                fontSize: 14
                            },
                        },
                        tooltip : {
                            show: false
                        },
                        legend: {
                            show: false
                        },
                        toolbox: {
                            show: false
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis : [
                            {
                                type : 'category',
                                boundaryGap : false,
                                axisLine:{
                                    lineStyle:{
                                        color:'#858585',
                                        width:1,
                                        opacity: 0.7
                                    }
                                },
                                splitLine: {
                                    show: true,
                                    lineStyle: {
                                        color: "#f4f4f4"
                                    }
                                },
                                axisTick: {
                                    show: false
                                },
                                data : ['11:00','12:00','13:00','14:00','15:00','16:00','17:00']
                            }
                        ],
                        yAxis : [
                            {
                                type : 'value',
                                axisLine:{
                                    lineStyle:{
                                        color:'#858585',
                                        width:1
                                    }
                                },
                                splitLine: {
                                    lineStyle: {
                                        color: "#f4f4f4"
                                    }
                                },
                                axisTick: {
                                    show: false
                                },
            //                    axisLabel: {
            //                        inside: true
            //                    }

                            }
                        ],
                        series : [
                            {
                                name:'昨天',
                                type:'line',
                                stack: '总量',
                                lineStyle:{
                                    normal:{
                                        color: "#00c0ef"  //连线颜色
                                    }
                                },
                                areaStyle: {
                                    normal:{
                                        color: {
                                            type: 'linear',
                                            x: 0,
                                            y: 0,
                                            x2: 0,
                                            y2: 1,
                                            colorStops: [{
                                                offset: 0, color: '#00c0ef' // 0% 处的颜色
                                            }, {
                                                offset: 1, color: '#00c0ef' // 100% 处的颜色
                                            }],
                                            globalCoord: false // 缺省为 false
                                        }
                                    }
                                },
                                data:[120, 132, 101, 134, 90, 230, 210]
                            },
                            {
                                name:'今天',
                                type:'line',
                                stack: '总量',
                                lineStyle:{
                                    normal:{
                                        color: "#0d63e5"  //连线颜色
                                    }
                                },
                                areaStyle: {
                                    normal:{
                                        color: {
                                            type: 'linear',
                                            x: 0,
                                            y: 0,
                                            x2: 0,
                                            y2: 1,
                                            colorStops: [{
                                                offset: 0, color: '#0d63e5' // 0% 处的颜色
                                            }, {
                                                offset: 1, color: '#0d63e5' // 100% 处的颜色
                                            }],
                                            globalCoord: false // 缺省为 false
                                        }
                                    }
                                },
                                data:[220, 182, 191, 234, 290, 330, 310]
                            }


                        ]
                    };
                    myChart.setOption(option);
                },
                initBarEcharts: function (id) {
                    var myChart = echarts.init(document.getElementById(id));
                    var option = {
                        title: {
                            text: '当月客流量变化趋势',
                            textStyle: {
                                fontWeight: 'normal',              //标题颜色
                                color: '#858585',
                                fontSize: 14
                            },
                        },
                        tooltip : {
                            trigger: 'axis',
                            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                            }
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis : [
                            {
                                type : 'category',
                                data : ['1', '2', '3', '4', '5', '6', '7'],
                                axisLine:{
                                    lineStyle:{
                                        color:'#858585',
                                        width:1,
                                        opacity: 0.7
                                    }
                                },
                                splitLine: {
                                    show: true,
                                    lineStyle: {
                                        color: "#f4f4f4"
                                    }
                                },
                                axisTick: {
                                    show: false
                                },
                            }
                        ],
                        yAxis : [
                            {
                                type : 'value',
                                axisLine:{
                                    lineStyle:{
                                        color:'#858585',
                                        width:1
                                    }
                                },
                                splitLine: {
                                    lineStyle: {
                                        color: "#f4f4f4"
                                    }
                                },
                                axisTick: {
                                    show: false
                                },
            //                    axisLabel: {
            //                        inside: true
            //                    }

                            }
                        ],
                        series : [
                            {
                                name:'人数',
                                type:'bar',
                                barWidth: '60%',
                                itemStyle: {
                                    color: "#3ec2fc"
                                },
                                data:[10, 52, 200, 334, 390, 330, 220]
                            }
                        ]
                    };
                    myChart.setOption(option);
                },
                initPieEcharts: function (id) {
                    var myChart = echarts.init(document.getElementById(id));
                    var option = {
                        title : {
                            text: '设备统计占比',
                            textStyle: {
                                fontWeight: 'normal',              //标题颜色
                                color: '#858585',
                                fontSize: 14
                            },
                        },
                        tooltip : {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        legend: {
                            show: true,
                            type: 'scroll',
                            orient: 'vertical',
                            right: 10,
                            top: 20,
                            bottom: 20,
                        },
                        series : [
                            {
                                name: '设备',
                                type: 'pie',
                                radius : '55%',
                                center: ['40%', '50%'],
                                data:[
                                    {value:335, name:'light-1'},
                                    {value:310, name:'light-2'},
                                    {value:234, name:'light-3'},
                                    {value:135, name:'light-4'},
                                    {value:1548, name:'light-5'}
                                ],
                                label: {
                                    show: false
                                },
                                itemStyle: {
                                    emphasis: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }
                            }
                        ]
                    };
                    myChart.setOption(option);
                },
                getIbeacon: function() {
                    var data = '{"' + MESH_MAC + '": "' + this.deviceInfo.mac + '","' + MESH_REQUEST + '": "' + GET_IBEACON + '"}';
                    var res = window.espmesh.requestDevice(data);
                    if (!this._isEmpty(res)) {
                        this.ibeaconInfo = JSON.parse(res);
                        MINT.Indicator.close();
                    }
                },
                showInfo: function() {
                    this.$refs.ibeaconInfo.show();
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
            },
            components: {
            }

        });

        return Reports;
    });