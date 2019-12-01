//公园绿地
function GreenLand(){
    this.mainMap = "";
    this.parkingMarkers = [];
}
GreenLand.prototype.init = function(){
    this.loadBanner();
    this.loadProblemSection();
    this.loadMeasuresSection();
    this.loadFutureSection();
    this.loadGreenLandCoverage();
    this.mapInit();
    this.layerInit();
}
//加载banner
GreenLand.prototype.loadBanner = function(){
    serveRequest("get", service_config.data_server_url+"banner/getBannerList",{ type:"green" },function(result){
        var data = result.data.resultKey;
        var banner_str = '';
        var toUrl = "./assets/bannerSubPage/green_land/banner_"
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            banner_str += '<img src='+ service_config.server_img_url + item.url +' width="100%" data-href='+ toUrl+(i+1)+".html" +' >'
        }
        $("#banner").html(banner_str);
        $("#banner").dnSlide({
            width: 1080,
            height: 265,
            verticalAlign: "middle",
            precentWidth: "56%",
            scale: 0.75,
            autoPlay: true,
            response: true,
            afterClickBtnFn: function (i) {
                //console.log(i)
            }

        });
    })
}
//加载问题栏目
GreenLand.prototype.loadProblemSection = function(){
    serveRequest("get", service_config.data_server_url+"problem/getProblemList",{ type:"green" },function(result){
        var data = result.data.resultKey;
        var problem_str = '';
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            problem_str += '<li>'+ item.description +'</li>'
        }
        $("#problem_box ul").html(problem_str);
    })
}
//加载措施栏目
GreenLand.prototype.loadMeasuresSection = function(){
    serveRequest("get", service_config.data_server_url+"solution/getSolutionList",{ type:"green" },function(result){
        var data = result.data.resultKey;
        var measures_str = '';
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            measures_str += '<li>'+ item.description +'</li>'
        }
        $("#measures_box ul").html(measures_str);
    })
}
//加载未来栏目
GreenLand.prototype.loadFutureSection = function(){
    serveRequest("get", service_config.data_server_url+"future/getfutureList",{ type:"green" },function(result){
        var data = result.data.resultKey;
        var future_str = '';
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            future_str += '<li>'+ item.description +'</li>'
        }
        $("#future_box ul").html(future_str);
    })
}
//加载绿地500m覆盖面积
GreenLand.prototype.loadGreenLandCoverage = function(){
    var _this = this;
    serveRequest("get", service_config.data_server_url+ "/Coverage/getCoverageByCategory",{ category: "medical_care" },function(result){
        _this.get_view_data(JSON.parse(Decrypt(result.data.coverageKey)));
        // _this.load_chart("");
        // _this.click_dom();
        // _this.load_bar_chart();//柱状图
    });
}
//分类拆分数据
GreenLand.prototype.get_view_data = function(result_data){
	for(var i = 0; i < result_data.length; i++){
	}
    this.load_green_land_area_chart();//加载覆盖率图表
    this.load_bar_stack_chart();//加载设施柱状图表
}
//地图初始化
GreenLand.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
	    center: [116.412255,39.908886],
	    zoom: 12,
    });
}
//图层初始化
GreenLand.prototype.layerInit = function(){
    this.loadBoundaryLayer();
    this.loadGreenLandLayer();
}
//各个社区边界范围图层
GreenLand.prototype.loadBoundaryLayer = function(){
    var boundaryLayer = new Loca.LineLayer({
        map: this.mainMap,
        zIndex: 13,
        // fitView: true,
        // eventSupport:true,
    });
    $.get(service_config.file_server_url+'boundary_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
        boundaryLayer.setData(data,{lnglat: 'lnglat'})
        // boundaryLayer.setData(JSON.parse(Decrypt(data)), {
        //     lnglat: 'coordinates'
        // });
        var idx = 0;
        boundaryLayer.setOptions({
            style: {
                height: function () {
                    return Math.random() * 20000;
                },
                opacity: 1,
                color:"#d66349",
            },
            // selectStyle:{
            //     color:"#13EFDC",
            // }
        });
        boundaryLayer.render();
    }); 
}
//各个社区绿地分部图层
GreenLand.prototype.loadGreenLandLayer = function(){
    var boundaryLayer = new Loca.PolygonLayer({
        map: this.mainMap,
        zIndex: 13,
        // fitView: true,
        // eventSupport:true,
    });
    $.get(service_config.file_server_url+'green_land_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
        boundaryLayer.setData(data,{lnglat: 'lnglat'})
        // boundaryLayer.setData(JSON.parse(Decrypt(data)), {
        //     lnglat: 'coordinates'
        // });
        var idx = 0;
        boundaryLayer.setOptions({
            style: {
                height: function () {
                    return Math.random() * 20000;
                },
                opacity: 1,
                color:"#5e61aa",
            },
            // selectStyle:{
            //     color:"#13EFDC",
            // }
        });
        boundaryLayer.render();
    }); 
}
//加载所有再生资源回收站点标识图层
GreenLand.prototype.loadGreenEnvironmentalLayer = function(){
    var _this = this;
    // _this.markers = [];
    $.get(service_config.file_server_url+'recycle_bin_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
		for(var i = 0; i < data.length; i++){
            var item = data[i];
            var marker = new AMap.Marker({
                    map: _this.mainMap,
                    icon: _this.getMarkerIcon(),
                    position: item.lnglat,
                    offset: new AMap.Pixel(-10, -10),
                    extData:item.properties
                });
                marker.on('click', function (ev) {
                    var properties = ev.target.B.extData;
                    _this.loadInfo(properties.street, "", ev.lnglat);
                });
                _this.parkingMarkers.push(marker);
		}
	})
}
//获取Marker对应图标
GreenLand.prototype.getMarkerIcon = function(){
    var icon = new AMap.Icon({
        size: new AMap.Size(16, 16),
        image: service_config.icon_url + 'green/recovery.png',
        imageOffset: new AMap.Pixel(0, 0), 
        imageSize: new AMap.Size(-8, -8)
    });
    return icon;
}
//加载信息窗体
GreenLand.prototype.loadInfo = function(name, introduction_text, center){
    var info = [];
    info.push('<div class="info_window">'+name+'</div>');
    info.push(introduction_text?'<div class="info_window text_indent">'+introduction_text+'</div>':"");
    infoWindow = new AMap.InfoWindow({
        content: info.join(""),  //使用默认信息窗体框样式，显示信息内容
    });
    infoWindow.open(this.mainMap, center);
}
//加载各街道500米服务半径绿地面积图表数据
GreenLand.prototype.load_green_land_area_chart = function(){
    var data = [
        {"name":"安定门街道","value":"1477273.66"},
        {"name":"北新桥街道","value":"1731099.92"},
        {"name":"朝阳门街道","value":"725687.41"},
        {"name":"崇外街道","value":"793457.66"},
        {"name":"东花市街道","value":"1257021.45"},
        {"name":"东华门街道","value":"4808251.77"},
        {"name":"东四街道","value":"906321.41"},
        {"name":"东直门街道","value":"964918.05"},
        {"name":"和平里街道","value":"3656739.07"},
        {"name":"建国门街道","value":"1572063.3"},
        {"name":"交道口街道","value":"879479.86"},
        {"name":"景山街道","value":"882614.19"},
        {"name":"龙潭街道","value":"2476785"},
        {"name":"前门街道","value":"332825.42"},
        {"name":"体育馆街道","value":"1440826.64"},
        {"name":"天坛街道","value":"3776947.39"},
        {"name":"永定门街道","value":"2116273.85"}
    ]
    var barChart = echarts.init(document.getElementById("green_land_coverage_content"));
    var bar_option = {
        color: echarts_colors,
        title:get_object_assign({
            text:"各街道绿地500米覆盖面积",
        },echart_title),
        tooltip : {
            trigger: 'axis',
            axisPointer : {            
                type : 'shadow'       
            }
        },
        grid: get_object_assign(facilities_bar_config.grid, { left:65 }),
        xAxis:{
            type : 'category',
            inverse: true,
            data: [],
            axisLabel: get_object_assign(coordinate_axis_style.axisLabel,{
		        formatter:function(val){
		            return val.split("").join("\n");
		        }
    		}),
            axisLine: coordinate_axis_style.axisLine,
            splitLine: coordinate_axis_style.splitLine,
        },
        yAxis: {
            type : 'value',
            name: '平方米',
            // minInterval:100,//设置左侧Y轴最小刻度
            axisLabel: coordinate_axis_style.axisLabel,
            axisLine: coordinate_axis_style.axisLine,
            splitLine: coordinate_axis_style.splitLine,
        },
        series :{
            type:'bar',
            data:[],
            barWidth:8,
            itemStyle:{
              normal:{
                barBorderRadius: [30, 30, 0, 0],
              }
            }
        },
    };
    for(var i = 0; i < data.length; i++){
        var item = data[i];
        bar_option.xAxis.data.push(item.name.replace("街道",""));
        bar_option.series.data.push(item.value);
    }
    barChart.setOption(bar_option, true);
    window.onresize = function(){
        barChart.resize();
    }
}
//加载各社区绿地覆盖面积和人均绿地面积图表数据
GreenLand.prototype.load_bar_stack_chart = function(){
    var data = [
        {"name":"安定门街道","per_capita":"1.756 ","value":"93188.81"},
        {"name":"北新桥街道","per_capita":"0.078 ","value":"68402.07"},
        {"name":"朝阳门街道","per_capita":"0.376 ","value":"16292.94"},
        {"name":"崇外街道","per_capita":"0.022 ","value":"893.99"},
        {"name":"东花市街道","per_capita":"0.442 ","value":"20070.81"},
        {"name":"东华门街道","per_capita":"8.833 ","value":"598885.03"},
        {"name":"东四街道","per_capita":"0.426 ","value":"19378.08"},
        {"name":"东直门街道","per_capita":"0.240 ","value":"10146.11"},
        {"name":"和平里街道","per_capita":"5.744 ","value":"721431.4"},
        {"name":"建国门街道","per_capita":"2.857 ","value":"133556.2"},
        {"name":"交道口街道","per_capita":"0.171 ","value":"9229.43"},
        {"name":"景山街道","per_capita":"0.511 ","value":"20564.84"},
        {"name":"龙潭街道","per_capita":"13.878 ","value":"889057.36"},
        {"name":"前门街道","per_capita":"0.744 ","value":"14896.16"},
        {"name":"体育馆街道","per_capita":"3.413 ","value":"151022.16"},
        {"name":"天坛街道","per_capita":"39.588 ","value":"2023270.84"},
        {"name":"永定门街道","per_capita":"0.838 ","value":"69929.85"}
    ]
    var barChart = echarts.init(document.getElementById("green_land_bar_content"));
    var bar_option = {
        color: echarts_colors,
        title:get_object_assign({
            text:"各街道绿地覆盖面积和人均绿地面积",
        },echart_title),
        tooltip : {
            trigger: 'axis',
            axisPointer : {            
                type : 'shadow'       
            }
        },
        grid: get_object_assign(facilities_bar_config.grid, { left:65 }),
        legend: {
            data: ["街道绿地面积", "人均绿地面积"],
            top: "10%",
            textStyle: {
                color: "#222"
            }
        },
        xAxis:{
            type : 'category',
            inverse: true,
            data: [],
            axisLabel: get_object_assign(coordinate_axis_style.axisLabel,{
		        formatter:function(val){
		            return val.split("").join("\n");
		        }
    		}),
            axisLine: coordinate_axis_style.axisLine,
            splitLine: coordinate_axis_style.splitLine,
        },
        yAxis:[
            {
                type : 'value',
                name: '平方米',
                // minInterval:100,//设置左侧Y轴最小刻度
                axisLabel: coordinate_axis_style.axisLabel,
                axisLine: coordinate_axis_style.axisLine,
                splitLine: coordinate_axis_style.splitLine,
            },
            {
                type: 'value',
                name: '平方公里',
                position: 'right',
                splitLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                axisLabel: coordinate_axis_style.axisLabel,
            }
        ],
        series : [
            {
                type:'bar',
                name:'街道绿地面积',
                data:[],
                barWidth:8,
                itemStyle:{
                    normal:{
                    barBorderRadius: [30, 30, 0, 0],
                    }
                }
            },
            {
                name:'人均绿地面积',
                type:'line',
                smooth: true,
                showAllSymbol: true,
                symbol: 'emptyCircle',
                symbolSize: 3,
                yAxisIndex: 1,
                itemStyle:{
                    normal:{
                        color:'#ff9933'
                    }
                },
                data:[],
            }
        ]
    };
    for(var i = 0; i < data.length; i++){
        var item = data[i];
        bar_option.xAxis.data.push(item.name.replace("街道",""));
        bar_option.series[0].data.push(item.value);
        bar_option.series[1].data.push(item.per_capita);
    }
    barChart.setOption(bar_option, true);
    window.onresize = function(){
        barChart.resize();
    }
}
var start_green_land = new GreenLand();
start_green_land.init();