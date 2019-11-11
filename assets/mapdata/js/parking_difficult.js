//停车难
function ParkingDifficult(){
    this.mainMap = "";
    this.parkingMarkers = [];
    this.mapLegend = {//默认选中第一个图例
        "工作地停车场": true,
        "商业停车场": false,
        "路边停车场": false,
        "小区停车场": false,
        "其他公共停车场": false,
    };
    this.parkingTypeName =  ["工作地停车场", "商业停车场", "路边停车场",
         "小区停车场", "其他公共停车场"];
}
ParkingDifficult.prototype.init = function(){
    $("#map_legend,#population_legend").addClass("map_legend_animation");
    //默认选中第一个图例
    $("#map_legend input").each(function(i){
        i === 0? $(this).prop("checked",true): $(this).prop("checked",false);
    });
    this.loadBanner();
    this.loadProblemSection();
    this.loadMeasuresSection();
    this.loadFutureSection();
    this.getMapLegend();
    this.mapInit();
    this.layerInit();
    this.loadParkingBarChart();
}
//加载banner
ParkingDifficult.prototype.loadBanner = function(){
    serveRequest("get", service_config.data_server_url+"banner/getBannerList",{ type:"CARPORT" },function(result){
        var data = result.data.resultKey;
        var banner_str = '';
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            banner_str += '<img src='+ service_config.server_img_url + item.url +' width="100%" data-href='+ item.toUrl +' >'
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
ParkingDifficult.prototype.loadProblemSection = function(){
    serveRequest("get", service_config.data_server_url+"problem/getProblemList",{ type:"CARPORT" },function(result){
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
ParkingDifficult.prototype.loadMeasuresSection = function(){
    serveRequest("get", service_config.data_server_url+"solution/getSolutionList",{ type:"CARPORT" },function(result){
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
ParkingDifficult.prototype.loadFutureSection = function(){
    serveRequest("get", service_config.data_server_url+"future/getfutureList",{ type:"CARPORT" },function(result){
        var data = result.data.resultKey;
        var future_str = '';
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            future_str += '<li>'+ item.description +'</li>'
        }
        $("#future_box ul").html(future_str);
    })
}
// 获取地图图例
ParkingDifficult.prototype.getMapLegend = function(){
    var _this = this;
    $("#map_legend input").each(function(i){
        $(this).on("click",function(){
            //清除居住人口所有选中图例
            $("#population_legend input").each(function(i){
                if($(this).prop("checked")){
                    _this.reset();
                    _this.mapInit();
                    _this.layerInit();
                }
                $(this).prop("checked",false);
            });
            _this.mapLegend[$(this).val()] = $(this).prop("checked");
            _this.mainMap.remove(_this.parkingMarkers);
            _this.loadParkingLotLayer();
        })
    });
}
//地图初始化
ParkingDifficult.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
	    // pitch: 50,
        // 隐藏默认楼块--区域面（bg）/道路（road）/建筑物（building）/标注（point）
        // features: ['bg',],
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
	    center: [116.412255,39.908886],
	    zoom: 12,
    });
}
//图层初始化
ParkingDifficult.prototype.layerInit = function(){
    this.loadBoundaryLayer();
    this.loadParkingLotLayer();
    this.loadBoundaryNameLayer();
}
//各个社区边界范围图层
ParkingDifficult.prototype.loadBoundaryLayer = function(){
    var boundaryLayer = new Loca.LineLayer({
        map: this.mainMap,
        zIndex: 13,
        // fitView: true,
        // eventSupport:true,
    });
    $.get(service_config.file_server_url+'boundary_data.json', function (data) {
        // var data = JSON.parse(data);
        var data = data;
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
                // color: function () {
                //     return echarts_colors[idx++];
                // }
            },
        });
        boundaryLayer.render();
    }); 
}
//加载所有停车厂点标识图层
ParkingDifficult.prototype.loadParkingLotLayer = function(){
    var _this = this;
    $.get(service_config.file_server_url+'parking_lot_data.json', function (data) {
        // var data = JSON.parse(data);
        var data = data;
		for(var i = 0; i < data.length; i++){
            var item = data[i];
            var marker;
            if(_this.mapLegend[item.properties.Type]){
                marker = new AMap.Marker({
                    map: _this.mainMap,
                    icon: _this.getMarkerIcon(item.properties.Type),
                    position: item.lnglat,
                    offset: new AMap.Pixel(-10, -10),
                    extData:item.properties
                });
                marker.on('click', function (ev) {
                    var properties = ev.target.B.extData;
                    _this.loadInfo(properties, ev.lnglat);
                });
                _this.parkingMarkers.push(marker);
            }
		}
	})
}
//加载街道名字图层
ParkingDifficult.prototype.loadBoundaryNameLayer = function(){
    //社区名字文字图层
    var layerLabels = new Loca.LabelsLayer({
        map: this.mainMap,
    });
    var _this = this;
    $.get(service_config.file_server_url+'boundary_name_data.json', function (data) {
        var data = data;
        //添加文字标记图层
        layerLabels.setData(data, {
            lnglat: 'lnglat'
        }).setOptions({
            style: {
                direction: 'center',
                offset: [0, 0],
                text: function (item) {
                    return item.value.name;
                },
                fillColor: "#F319A0",
                fontSize: 16,
                strokeWidth: 0
            }
        }).render();
        layerLabels.setzIndex(100);
        layerLabels.show();
    })
}
//获取Marker对应图标
ParkingDifficult.prototype.getMarkerIcon = function(markerType){
    switch (markerType){
        case "工作地停车场" :
            // 创建 AMap.Icon 实例：
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16),    // 图标尺寸
                image: service_config.icon_url + 'parking/'+1+'.png',  // Icon的图像
                imageOffset: new AMap.Pixel(0, 0),  // 图像相对展示区域的偏移量，适于雪碧图等
                imageSize: new AMap.Size(-8, -8)   // 根据所设置的大小拉伸或压缩图片
            });
            break;
        case "商业停车场" :
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16),
                image: service_config.icon_url + 'parking/'+2+'.png',
                imageOffset: new AMap.Pixel(0, 0), 
                imageSize: new AMap.Size(-8, -8)
            });
            break;
        case "路边停车场" :
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16), 
                image: service_config.icon_url + 'parking/'+3+'.png', 
                imageOffset: new AMap.Pixel(0, 0),
                imageSize: new AMap.Size(-8, -8) 
            });
            break;
        case "小区停车场" :
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16), 
                image: service_config.icon_url + 'parking/'+4+'.png', 
                imageOffset: new AMap.Pixel(0, 0), 
                imageSize: new AMap.Size(-8, -8)  
            });
            break;
        case "其他公共停车场" :
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16),
                image: service_config.icon_url + 'parking/'+5+'.png', 
                imageOffset: new AMap.Pixel(0, 0), 
                imageSize: new AMap.Size(-8, -8)
            });
            break;
    }
    return icon;
}
//加载信息窗体
ParkingDifficult.prototype.loadInfo = function(properties, center){
    var info = [];
    info.push('<div class="info_window">名称：'+properties.poi_name+'</div>');
    info.push('<div class="info_window">类型：'+properties.category+'</div>');
    info.push('<div class="info_window">街道：'+properties.poi_street+'</div>');
    info.push('<div class="info_window">地址：'+properties.poi_addres+'</div>');
    infoWindow = new AMap.InfoWindow({
        content: info.join(""),  //使用默认信息窗体框样式，显示信息内容
    });
    infoWindow.open(this.mainMap, center);
}
//加载右侧统计图
ParkingDifficult.prototype.loadParkingBarChart = function(){
    var population_bar_chart = echarts.init(document.getElementById("parking_bar_chart"));
    var seriesLabel = {
        normal: {
            show: true,
            textBorderColor: '#333',
            textBorderWidth: 2
        }
    }
    var bar_option = {
        color: echarts_colors,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            textStyle:{
                color:"#222",
            },
            data: this.parkingTypeName
        },
        grid: {
            left: 50,
            top:80,
            right:10,
            bottom:30,
        },
        xAxis: {
            type: 'value',
            name: '个',
            axisLabel: coordinate_axis_style.axisLabel,
            axisLine: coordinate_axis_style.axisLine,
            splitLine: coordinate_axis_style.splitLine,
        },
        yAxis: {
            type: 'category',
            axisLabel: coordinate_axis_style.axisLabel,
            axisLine: coordinate_axis_style.axisLine,
            splitLine: coordinate_axis_style.splitLine,
            inverse: true,
            data: street_names,
        },
        series: []
    };
    var _this = this;
    serveRequest("get", service_config.data_server_url+"parking/geParkingList",{ },function(result){
        var englishParking = ["jobParking", "commercialParking", "roadsideParking", "communityParking", "othres"];
        var data = result.data.resultKey;
        for(var i = 0; i < englishParking.length; i++){
            bar_option.series[i] = {
                name: _this.parkingTypeName[i],
                type: 'bar',
                stack:"1",
                data: []
            };
            var itemData = [];
            for(var j = 0; j < data.length; j++){
                var item = data[j];
                bar_option.series[i].data.push(item[englishParking[i]]);
            }
        }
        population_bar_chart.setOption(bar_option, true);
        window.onresize = function(){
            population_bar_chart.resize();
        }
    })
}
//重置
ParkingDifficult.prototype.reset = function(){
    this.mapLegend = {//默认选中第一个图例
        "工作地停车场": false,
        "商业停车场": false,
        "路边停车场": false,
        "小区停车场": false,
        "其他公共停车场": false,
    };
}
var start_parking_difficult = new ParkingDifficult();
start_parking_difficult.init();