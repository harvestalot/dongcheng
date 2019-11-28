//教育设施
function EducationFacilities (){
    this.mainMap = "";
    this.parkingMarkers = [];
}
EducationFacilities.prototype.init = function(){
    this.loadBanner();
    this.mapInit();
    this.layerInit();
}
//加载banner
EducationFacilities.prototype.loadBanner = function(){
    serveRequest("get", service_config.data_server_url+"banner/getBannerList",{ type:"EDU" },function(result){
        var data = result.data.resultKey;
        var banner_str = '';
        var toUrl = "./assets/bannerSubPage/education/banner_"
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
//地图初始化
EducationFacilities.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
	    center: [116.412255,39.908886],
	    zoom: 12,
    });
}
//图层初始化
EducationFacilities.prototype.layerInit = function(){
    this.loadBoundaryLayer();
    this.loadEducationPointLayer();
}
//各个社区边界范围图层
EducationFacilities.prototype.loadBoundaryLayer = function(){
    var boundaryLayer = new Loca.LineLayer({
        map: this.mainMap,
        zIndex: 13,
    });
    $.get(service_config.file_server_url+'boundary_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
        boundaryLayer.setData(data,{lnglat: 'lnglat'})
        var idx = 0;
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
//加载教育设施图层
EducationFacilities.prototype.loadEducationPointLayer = function(){
	var _this = this;
    $.get(service_config.file_server_url+'education_facilities_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
		for(var i = 0; i < data.length; i++){
            var item = data[i];
            var marker;
            // if(_this.mapLegend[item.properties.type]){
                marker = new AMap.Marker({
                    map: _this.mainMap,
                    icon: _this.getMarkerIcon(item.properties.type),
                    position: item.lnglat[0],
                    offset: new AMap.Pixel(-10, -10),
                    extData:item.properties
                });
                // marker.on('click', function (ev) {
                //     var properties = ev.target.B.extData;
                //     _this.loadInfo(properties, ev.lnglat);
                // });
                _this.parkingMarkers.push(marker);
            // }
        }
	})
}
//获取Marker对应图标
EducationFacilities.prototype.getMarkerIcon = function(markerType){
    switch (markerType){
        case "幼儿园" :
            // 创建 AMap.Icon 实例：
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16),    // 图标尺寸
                image: service_config.icon_url + 'jiaoyu.png',  // Icon的图像
                imageOffset: new AMap.Pixel(0, 0),  // 图像相对展示区域的偏移量，适于雪碧图等
                imageSize: new AMap.Size(-8, -8)   // 根据所设置的大小拉伸或压缩图片
            });
            break;
        case "小学" :
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16),
                image: service_config.icon_url + 'jiaoyu.png',
                imageOffset: new AMap.Pixel(0, 0), 
                imageSize: new AMap.Size(-8, -8)
            });
            break;
        case "中学" :
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16), 
                image: service_config.icon_url + 'jiaoyu.png', 
                imageOffset: new AMap.Pixel(0, 0),
                imageSize: new AMap.Size(-8, -8) 
            });
            break;
        case "九年一贯制" :
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16), 
                image: service_config.icon_url +'jiaoyu.png', 
                imageOffset: new AMap.Pixel(0, 0), 
                imageSize: new AMap.Size(-8, -8)  
            });
            break;
    }
    return icon;
}
//加载信息窗体
EducationFacilities.prototype.loadInfo = function(name, introduction_text, center){
    var info = [];
    info.push('<div class="info_window">'+name+'</div>');
    info.push(introduction_text?'<div class="info_window text_indent">'+introduction_text+'</div>':"");
    infoWindow = new AMap.InfoWindow({
        content: info.join(""),  //使用默认信息窗体框样式，显示信息内容
    });
    infoWindow.open(this.mainMap, center);
}
var start_education_facilities = new EducationFacilities();
start_education_facilities.init();