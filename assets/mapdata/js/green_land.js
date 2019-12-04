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
        {"name":"安定门街道","value":"83.24535698"},
        {"name":"北新桥街道","value":"64.87039533"},
        {"name":"朝阳门街道","value":"55.84170105"},
        {"name":"崇外街道","value":"66.31813528"},
        {"name":"东花市街道","value":"70.93509696"},
        {"name":"东华门街道","value":"89.02332249"},
        {"name":"东四街道","value":"63.61750913"},
        {"name":"东直门街道","value":"47.08230329"},
        {"name":"和平里街道","value":"74.64925791"},
        {"name":"建国门街道","value":"54.75731373"},
        {"name":"交道口街道","value":"55.3354134"},
        {"name":"景山街道","value":"59.98824568"},
        {"name":"龙潭街道","value":"81.80579307"},
        {"name":"前门街道","value":"31.12823581"},
        {"name":"体育馆街道","value":"73.10850882"},
        {"name":"天坛街道","value":"93.76551365"},
        {"name":"永定门街道","value":"62.12940867"}
    ]
    var barChart = echarts.init(document.getElementById("green_land_coverage_content"));
    var bar_option = {
        color: echarts_colors,
        title:get_object_assign({
            text:"绿地500米覆盖率",
        },echart_title),
        tooltip : {
            trigger: 'axis',
            axisPointer : {            
                type : 'shadow'       
            }
        },
        grid: get_object_assign(facilities_bar_config.grid, { top:60 }),
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
            name: '%',
            // minInterval:100,//设置左侧Y轴最小刻度
            axisLabel: coordinate_axis_style.axisLabel,
            axisLine: coordinate_axis_style.axisLine,
            splitLine: coordinate_axis_style.splitLine,
        },
        series :{
            name:'绿地500米覆盖率',
            type:'bar',
            data:[],
            barCategoryGap:5,
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
        {"name":"安定门街道","value":"5.251251657"},
        {"name":"北新桥街道","value":"2.563265858"},
        {"name":"朝阳门街道","value":"1.253742965"},
        {"name":"崇外街道","value":"0.074720748"},
        {"name":"东花市街道","value":"1.132617787"},
        {"name":"东华门街道","value":"11.0881746"},
        {"name":"东四街道","value":"1.360207502"},
        {"name":"东直门街道","value":"0.495070258"},
        {"name":"和平里街道","value":"14.72741632"},
        {"name":"建国门街道","value":"4.651962007"},
        {"name":"交道口街道","value":"0.58070042"},
        {"name":"景山街道","value":"1.397721324"},
        {"name":"龙潭街道","value":"29.36469755"},
        {"name":"前门街道","value":"1.393196412"},
        {"name":"体育馆街道","value":"7.662965557"},
        {"name":"天坛街道","value":"50.22919569"},
        {"name":"永定门街道","value":"2.052995282"}
    ]
    var barChart = echarts.init(document.getElementById("green_land_bar_content"));
    var bar_option = {
        color: echarts_colors,
        title:get_object_assign({
            text:"绿地覆盖率",
        },echart_title),
        tooltip : {
            trigger: 'axis',
            axisPointer : {            
                type : 'shadow'       
            }
        },
        grid: get_object_assign(facilities_bar_config.grid, { top:60 }),
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
                name: '%',
                // minInterval:100,//设置左侧Y轴最小刻度
                axisLabel: coordinate_axis_style.axisLabel,
                axisLine: coordinate_axis_style.axisLine,
                splitLine: coordinate_axis_style.splitLine,
            }
        ],
        series : [
            {
                type:'bar',
                name:'街道绿地覆盖率',
                data:[],
                barCategoryGap:5,
                itemStyle:{
                    normal:{
                    barBorderRadius: [30, 30, 0, 0],
                    }
                }
            }
        ]
    };
    for(var i = 0; i < data.length; i++){
        var item = data[i];
        bar_option.xAxis.data.push(item.name.replace("街道",""));
        bar_option.series[0].data.push(item.value);
    }
    barChart.setOption(bar_option, true);
    window.onresize = function(){
        barChart.resize();
    }
}
var start_green_land = new GreenLand();
start_green_land.init();