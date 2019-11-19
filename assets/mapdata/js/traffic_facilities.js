//教育设施
function TrafficFacilities (){
    this.mainMap = "";
    this.markers = [];
}
TrafficFacilities.prototype.init = function(){
    this.mapInit();
    this.layerInit();
}
//地图初始化
TrafficFacilities.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
	    center: [116.412255,39.908886],
	    zoom: 12,
    });
}
//图层初始化
TrafficFacilities.prototype.layerInit = function(){
    this.loadBoundaryLayer();
    this.loadEducationPointLayer();
}
//各个社区边界范围图层
TrafficFacilities.prototype.loadBoundaryLayer = function(){
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
TrafficFacilities.prototype.loadEducationPointLayer = function(){
	var _this = this;
    $.get(service_config.file_server_url+'traffic_facilities_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
		for(var i = 0; i < data.length; i++){
            var item = data[i];
            var marker;
            // if(_this.mapLegend[item.properties.type]){
                marker = new AMap.Marker({
                    map: _this.mainMap,
                    icon: new AMap.Icon({
                        size: new AMap.Size(16, 16),
                        image: service_config.icon_url + 'jiaotong.png',
                        imageOffset: new AMap.Pixel(0, 0),
                        imageSize: new AMap.Size(-8, -8)
                    }),
                    position: item.lnglat[0],
                    offset: new AMap.Pixel(-10, -10),
                    extData:item.properties
                });
                // marker.on('click', function (ev) {
                //     var properties = ev.target.B.extData;
                //     _this.loadInfo(properties, ev.lnglat);
                // });
                _this.markers.push(marker);
            // }
        }
	})
}
var start_traffic_facilities = new TrafficFacilities();
start_traffic_facilities.init();