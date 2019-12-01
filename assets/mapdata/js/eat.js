//吃(咱在东城吃点啥)
function Eat(){
    this.mainMap = "";
    this.current_line_path_type  = "walking";
    this.walkingPathLayer = "";//步行
    this.ridingPathLayer = "";//骑行
    this.transferPathLayer = "";//公交
    this.drivingPathLayer = "";//驾车
    this.scenicSpotMarkers = [];
    this.startLocation = [];
    this.arriveLocation = [];
    this.restaurant_params = {//旅游景点分类搜索条件
        type:"京城老字号",
        name:"",
    }
    this.restaurant_list_data = [];
    this.current_marker = "";//当前的marker
}
Eat.prototype.init = function(){
    this.loadBanner();
    this.loadTimeHonoredRestaurants();
    this.handleDomElement();
    this.mapInit();
    this.layerInit();
    this.linePathPlanning();
}
//加载banner
Eat.prototype.loadBanner = function(){
    serveRequest("get", service_config.data_server_url+"banner/getBannerList",{ type:"EAT" },function(result){
        var data = result.data.resultKey;
        var banner_str = '';
        var toUrl = "./assets/bannerSubPage/eat/banner_"
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
//加载京城老字号数据
Eat.prototype.loadTimeHonoredRestaurants = function(){
    var _this = this;
    serveRequest("get", service_config.data_server_url+"honored/getHonoredList",this.restaurant_params,function(result){
        var data = result.data.resultKey;
        _this.restaurant_list_data = data;
        var restaurant_list_str = "";
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            restaurant_list_str += "<li>"+ item.name +"</li>";
        }
        _this.loadRestaurantList(restaurant_list_str);
    })
}
//加载人气前100餐馆数据
Eat.prototype.loadRankingListRestaurants = function(){
    var _this = this;
    serveRequest("get", service_config.data_server_url+"honored/getTopList",this.restaurant_params,function(result){
        var data = result.data.resultKey;
        _this.restaurant_list_data = data;
        var restaurant_list_str = "";
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            restaurant_list_str += "<li>"+ item.name +"</li>";
        }
        _this.loadRestaurantList(restaurant_list_str);
    })
}
//加载左侧搜索景点列表并操作点击事件
Eat.prototype.loadRestaurantList = function(list_dom_str){
    var _this = this;
    $("#restaurant_list").html(list_dom_str);
    var marker = "";
    $("#restaurant_list li").on("click", function(){
        $(this).addClass("active").siblings("li").removeClass("active");
        $("#line_path_type li").eq(0).addClass("active").siblings("li").removeClass("active");
        _this.initClear();
        _this.current_marker? _this.mainMap.remove(_this.current_marker):"";
        var data_row = {};
        for(var i = 0; i < _this.restaurant_list_data.length; i++){
            var item = _this.restaurant_list_data[i];
            if(item.name === $(this).html()){
                item.lnglat  = wgs84togcj02(item.lng, item.lat)
                data_row = item;
                $(".brief-content").removeClass("less with-btn");
                if ($(".point-brief-box .text-wrap .text").height() > 50) {
                    //内容高度超过150，截取内容, 显示『显示更多』 按钮
                    $(".brief-content").addClass("less with-btn");
                }
                break;
            }
        }
        _this.current_marker = new AMap.Marker({
            map: _this.mainMap,
            icon:new AMap.Icon({
                size: new AMap.Size(32, 32),
                image: service_config.icon_url + 'scenic_spot/jingdian_1.png',
                imageOffset: new AMap.Pixel(0, 0), 
                imageSize: new AMap.Size(-16, -16)
            }),
            position: data_row.lnglat,
            offset: new AMap.Pixel(-10, -10),
            extData:data_row
        });
        _this.current_marker.on('click', function (ev) {
            var properties = ev.target.B.extData;
            $("#scenic_spot_info .name").html(properties.name);
            $("#scenic_spot_info .info").html(properties.address);
            $("#scenic_spot_info").removeClass("hide");
            _this.arriveLocation = ev.lnglat;
            _this.loadWalkingPathLayer();//规划步行线路
        });
    })
}
//左侧筛选操作DOM
Eat.prototype.handleDomElement = function(){
    var _this = this;
    //搜索输入框enter触发
    $("#search_text").on("keydown",function(event){
        if(event.keyCode==13){
            $("#search_btn").trigger("click");
        }
    })
    //搜索触发
    $("#search_btn").on("click", function () {
        _this.initClear();
        _this.current_marker? _this.mainMap.remove(_this.current_marker):"";
        _this.restaurant_params.name = $("#search_text").val();
        if(_this.restaurant_params.type === "京城老字号"){
            _this.loadTimeHonoredRestaurants();
            // $(".intro-content, .price-content, .line-content").show();
        }else{
            _this.loadRankingListRestaurants();
            // $(".intro-content, .price-content, .line-content").hide();
        }
    });
    //点击分类类型筛选对应数据
    $("#scenic_spot_type li").on("click", function () {
        if ($(this).hasClass("active")) return;
        _this.initClear();
        _this.current_marker? _this.mainMap.remove(_this.current_marker):"";
        $(this).addClass("active").siblings("li").removeClass("active");
        _this.restaurant_params.type= $(this).attr("data-cat");
        if(_this.restaurant_params.type === "京城老字号"){
            _this.loadTimeHonoredRestaurants();
            // $(".intro-content, .price-content, .line-content").show();
        }else{
            _this.loadRankingListRestaurants();
            // $(".intro-content, .price-content, .line-content").hide();
        }
    });
}
//地图初始化
Eat.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
	    center: [116.412255,39.908886],
	    zoom: 12,
    });
    var _this = this;
    //点击地图区域
    this.mainMap.on('click', function(event){
        _this.startLocation = [event.lnglat.lng, event.lnglat.lat];
        _this.loadLinePath();
    });
    //定位当前位置
    this.mainMap.plugin('AMap.Geolocation', function() {
        _this.mainMap.addControl(new AMap.Geolocation());
        var geolocation = new AMap.Geolocation({
            timeout: 10000,
            // 定位按钮的停靠位置的偏移量，默认：Pixel(10, 20)
            buttonOffset: new AMap.Pixel(10, 20),
            // zoomToAccuracy: true,     
            buttonPosition: 'LB'
        });
        geolocation.getCurrentPosition();
        AMap.event.addListener(geolocation, 'complete', function(results){
            _this.startLocation = [results.position.lng, results.position.lat];
        })
    })
}
//图层初始化
Eat.prototype.layerInit = function(){
    this.loadBoundaryLayer();
    this.loadScenicSpotLayer();
}
//选择不同类型出行方式规划相对应线路
Eat.prototype.linePathPlanning = function(){
    //步行导航
    this.walkingPathLayer = new AMap.Walking({
        map: this.mainMap,
        panel: "linePath"
    });
    //骑行导航
    this.ridingPathLayer = new AMap.Riding({
        map: this.mainMap,
        panel: "linePath"
    });
    //公交导航
    this.transferPathLayer = new AMap.Transfer({
        map: this.mainMap,
        panel: "linePath",
        city: '北京市',
        // policy: AMap.TransferPolicy.LEAST_TIME
    });
    //驾车导航
    this.drivingPathLayer = new AMap.Driving({
        map: this.mainMap,
        panel: "linePath"
    });
    var _this = this;
    $("#line_path_type li").on("click",function(){
        $(this).addClass("active").siblings("li").removeClass("active");
        _this.current_line_path_type = $(this).attr("data_type");
        _this.loadLinePath();
    })
}
//根据出行方式获取线路数据
Eat.prototype.loadLinePath = function(){
    this.initClear();
    switch (this.current_line_path_type){
        case "walking":
            this.loadWalkingPathLayer();
        break;
        case "rading":
            this.loadRidingPathLayer();
        break;
        case "transfer":
            this.loadTransferPathLayer();
        break;
        case "driving":
            this.loadDrivingPathLayer();
        break;
    }
}
//各个社区边界范围图层
Eat.prototype.loadBoundaryLayer = function(){
    var boundaryLayer = new Loca.LineLayer({
        map: this.mainMap,
    });
    $.get(service_config.file_server_url+'boundary_data.json', function (data) {
        var boundary_data = data;
        boundaryLayer.setData(boundary_data,{lnglat: 'lnglat'})
        // boundaryLayer.setData(JSON.parse(Decrypt(data)), {
        //     lnglat: 'coordinates'
        // });
        boundaryLayer.setOptions({
            style: {
                height: function () {
                    return Math.random() * 20000;
                },
                opacity: 1,
                color:"#d66349",
            },
        });
        boundaryLayer.render();
    }); 
}
//加载所有餐馆点标识图层
Eat.prototype.loadScenicSpotLayer = function(){
    var _this = this;
    // _this.markers = [];
    $.get(service_config.file_server_url+'time_honored_restaurant.json', function (result) {
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
                    // _this.loadInfo(properties.name, properties.introduction, ev.lnglat);
                    $("#scenic_spot_info .name").html(properties.name);
                    $("#scenic_spot_info .info").html("菜系："+ properties.cuisine);
                    $("#scenic_spot_info .info").html("餐馆地址："+ properties.address);
                    // $("#scenic_spot_info .pointer-cover").html('<img src='+properties.url+' />');
                    $("#scenic_spot_info").removeClass("hide");
                    _this.arriveLocation = ev.lnglat;
                    _this.loadWalkingPathLayer();//规划步行线路
                });
                _this.scenicSpotMarkers.push(marker);
		}
	})
}
//步行线路
Eat.prototype.loadWalkingPathLayer = function(){
    //根据起终点坐标规划步行路线
    this.walkingPathLayer.search(this.startLocation, this.arriveLocation, 
        function(status, result) {
            if (status === 'complete') {
                // console.log(result)
            } else {
            } 
    });
}
//骑行线路
Eat.prototype.loadRidingPathLayer = function(){
    //根据起终点坐标规划步行路线
    this.ridingPathLayer.search(this.startLocation, this.arriveLocation, 
        function(status, result) {
            if (status === 'complete') {
                // console.log(result)
            } else {
            } 
    });
}
//公交线路
Eat.prototype.loadTransferPathLayer = function(){
    //根据起终点坐标规划步行路线
    this.transferPathLayer.search(this.startLocation, this.arriveLocation, 
        function(status, result) {
            if (status === 'complete') {
                // console.log(result)
            } else {
            } 
    });
}
//驾车线路
Eat.prototype.loadDrivingPathLayer = function(){
    //根据起终点坐标规划步行路线
    this.drivingPathLayer.search(this.startLocation, this.arriveLocation, 
        function(status, result) {
            if (status === 'complete') {
                // console.log(result)
            } else {
            } 
    });
}
//获取Marker对应图标
Eat.prototype.getMarkerIcon = function(){
    var icon = new AMap.Icon({
        size: new AMap.Size(16, 16),
        image: service_config.icon_url + 'eat.png',
        imageOffset: new AMap.Pixel(0, 0), 
        imageSize: new AMap.Size(-8, -8)
    });
    return icon;
}
//加载信息窗体
Eat.prototype.loadInfo = function(name, introduction_text, center){
    var info = [];
    info.push('<div class="info_window">'+name+'</div>');
    info.push(introduction_text?'<div class="info_window text_indent">'+introduction_text+'</div>':"");
    infoWindow = new AMap.InfoWindow({
        content: info.join(""),  //使用默认信息窗体框样式，显示信息内容
    });
    infoWindow.open(this.mainMap, center);
}
//清除图层
Eat.prototype.initClear = function(){
    this.walkingPathLayer.clear();
    this.ridingPathLayer.clear();
    this.transferPathLayer.clear();
    this.drivingPathLayer.clear();
} 
var start_eat = new Eat();
start_eat.init();