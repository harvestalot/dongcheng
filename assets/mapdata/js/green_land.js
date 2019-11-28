//公园绿地
function GreenLand(){
    this.mainMap = "";
    this.parkingMarkers = [];
}
GreenLand.prototype.init = function(){
    this.loadBanner();
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
var start_green_land = new GreenLand();
start_green_land.init();