//东城简介
function Introduction(){

}
Introduction.prototype.init = function(){
    this.loadLandAreaChart();
    this.loadPopulationChart();
    this.loadPopulationDensityChart();
    this.loadLegalEntityChart();
}
//东城区各街道土地面积
Introduction.prototype.loadLandAreaChart = function(){
    var chartInstance = echarts.init(document.getElementById("land_area_content"));
    var option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            top: '15%',
            right: '3%',
            left: '5%',
            bottom: '12%'
        },
        xAxis: [{
            type: 'category',
            data: ['工作票', '操作票', '抢修', '用电调查', '设备巡视', '现场勘查', '到岗到位'],
            axisLine: {
                lineStyle: {
                    color: 'rgba(255,255,255,0.12)'
                }
            },
            axisLabel: {
                margin: 10,
                color: '#e2e9ff',
                textStyle: {
                    fontSize: 14
                },
            },
        }],
        yAxis: [{
            axisLabel: {
                formatter: '{value}',
                color: '#e2e9ff',
            },
            axisLine: {
                show: false
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255,255,255,0.12)'
                }
            }
        }],
        series: [{
            type: 'bar',
            data: [300, 450, 770, 203, 255, 188, 156],
            barWidth: '20px',
            itemStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgba(0,244,255,1)' // 0% 处的颜色
                    }, {
                        offset: 1,
                        color: 'rgba(0,77,167,1)' // 100% 处的颜色
                    }], false),
                    barBorderRadius: [30, 30, 30, 30],
                    shadowColor: 'rgba(0,160,221,1)',
                    shadowBlur: 4,
                }
            },
            label: {
                normal: {
                    show: true,
                    lineHeight: 30,
                    width: 80,
                    height: 30,
                    backgroundColor: 'rgba(0,160,221,0.1)',
                    borderRadius: 200,
                    position: ['-8', '-60'],
                    distance: 1,
                    formatter: [
                        '    {d|●}',
                        ' {a|{c}}     \n',
                        '    {b|}'
                    ].join(','),
                    rich: {
                        d: {
                            color: '#3CDDCF',
                        },
                        a: {
                            color: '#fff',
                            align: 'center',
                        },
                        b: {
                            width: 1,
                            height: 30,
                            borderWidth: 1,
                            borderColor: '#234e6c',
                            align: 'left'
                        },
                    }
                }
            }
        }]
    };
    chartInstance.setOption(option, true);
    window.onresize = function(){
        chartInstance.resize();
    }
}
//东城区各街道人口数量
Introduction.prototype.loadPopulationChart = function(){
    
}
//东城区各街道人口密度比较
Introduction.prototype.loadPopulationDensityChart = function(){
    
}
//东城区各街道（限额）以上法人单位基本情况比较
Introduction.prototype.loadLegalEntityChart = function(){
    
}
var start_introduction = new Introduction();
start_introduction.init(); 