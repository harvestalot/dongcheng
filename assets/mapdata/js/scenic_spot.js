//景点(咱在东城玩点啥)
function ScenicSpot(){
    this.mainMap = "";
    this.walkingPathLayer = "";//步行
    this.ridingPathLayer = "";//骑行
    this.transferPathLayer = "";//公交
    this.drivingPathLayer = "";//驾车
    this.scenicSpotMarkers = [];
    this.startLocation = [];
    this.arriveLocation = [];
}
ScenicSpot.prototype.init = function(){
    this.mapInit();
    this.layerInit();
    this.linePathPlanning();
}
//地图初始化
ScenicSpot.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
	    center: [116.412255,39.908886],
	    zoom: 12,
    });
    var _this = this;
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
ScenicSpot.prototype.layerInit = function(){
    // this.loadBoundaryLayer();
    this.loadScenicSpotLayer(); 
}
//选择不同类型出行方式规划相对应线路
ScenicSpot.prototype.linePathPlanning = function(){
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
        _this.walkingPathLayer.clear();
        _this.ridingPathLayer.clear();
        _this.transferPathLayer.clear();
        _this.drivingPathLayer.clear();
        $(this).addClass("active").siblings("li").removeClass("active");
        var type = $(this).attr("data_type");
        switch (type){
            case "walking":
                _this.loadWalkingPathLayer();
            break;
            case "rading":
                _this.loadRidingPathLayer();
            break;
            case "transfer":
                _this.loadTransferPathLayer();
            break;
            case "driving":
                _this.loadDrivingPathLayer();
            break;
        }
    })
}
//各个社区边界范围图层
ScenicSpot.prototype.loadBoundaryLayer = function(){
    var boundaryLayer = new Loca.PolygonLayer({
        map: this.mainMap,
    });
    $.get(service_config.file_server_url+'boundary.js', function (data) {
        boundaryLayer.setData(boundary_data,{lnglat: 'lnglat'})
        // boundaryLayer.setData(JSON.parse(Decrypt(data)), {
        //     lnglat: 'coordinates'
        // });
        var idx = 0;
        boundaryLayer.setOptions({
            style: {
                height: function () {
                    return Math.random() * 20000;
                },
                opacity: 0.8,
                // color:"#3ba0f3",
                color: function () {
                    return echarts_colors[idx++];
                }
            },
            // selectStyle:{
            //     color:"#13EFDC",
            // }
        });
        boundaryLayer.render();
    }); 
}
//加载所有旅游点标识图层
ScenicSpot.prototype.loadScenicSpotLayer = function(){
    var _this = this;
    // _this.markers = [];
    $.get(service_config.file_server_url+'scenic_spot_data.json', function (result) {
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
                    $("#scenic_spot_info .info").html(properties.introduction);
                    $("#scenic_spot_info").removeClass("hide");
                    _this.arriveLocation = ev.lnglat;
                    _this.loadWalkingPathLayer();//规划步行线路
                });
                _this.scenicSpotMarkers.push(marker);
		}
	})
}
//步行线路
ScenicSpot.prototype.loadWalkingPathLayer = function(){
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
ScenicSpot.prototype.loadRidingPathLayer = function(){
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
ScenicSpot.prototype.loadTransferPathLayer = function(){
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
ScenicSpot.prototype.loadDrivingPathLayer = function(){
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
ScenicSpot.prototype.getMarkerIcon = function(){
    var icon = new AMap.Icon({
        size: new AMap.Size(16, 16),
        image: service_config.icon_url + 'scenic_spot/jingdian.png',
        imageOffset: new AMap.Pixel(0, 0), 
        imageSize: new AMap.Size(-8, -8)
    });
    return icon;
}
//加载信息窗体
ScenicSpot.prototype.loadInfo = function(name, introduction_text, center){
    var info = [];
    info.push('<div class="info_window">'+name+'</div>');
    info.push(introduction_text?'<div class="info_window text_indent">'+introduction_text+'</div>':"");
    infoWindow = new AMap.InfoWindow({
        content: info.join(""),  //使用默认信息窗体框样式，显示信息内容
    });
    infoWindow.open(this.mainMap, center);
}
var start_parking_difficult = new ScenicSpot();
start_parking_difficult.init();