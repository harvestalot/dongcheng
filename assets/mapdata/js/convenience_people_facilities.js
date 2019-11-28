//便民生活设施
function ConveniencePeopleFacilities (){
    this.mainMap = "";
    this.markers = [];
}
ConveniencePeopleFacilities.prototype.init = function(){
    this.loadBanner();
    this.mapInit();
    this.layerInit();
}
//加载banner
ConveniencePeopleFacilities.prototype.loadBanner = function(){
    serveRequest("get", service_config.data_server_url+"banner/getBannerList",{ type:"facilitate" },function(result){
        var data = result.data.resultKey;
        var banner_str = '';
        var toUrl = "./assets/bannerSubPage/convenience_people/banner_"
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
ConveniencePeopleFacilities.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
	    center: [116.412255,39.908886],
	    zoom: 12,
    });
}
//图层初始化
ConveniencePeopleFacilities.prototype.layerInit = function(){
    this.loadBoundaryLayer();
    this.loadConveniencePeoplePointLayer();
}
//各个社区边界范围图层
ConveniencePeopleFacilities.prototype.loadBoundaryLayer = function(){
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
//加载便民设施图层
ConveniencePeopleFacilities.prototype.loadConveniencePeoplePointLayer = function(){
	var _this = this;
    $.get(service_config.file_server_url+'convenience_people_facilities_data.json', function (result) {
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
                        image: service_config.icon_url + 'bianmin.png',
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
var start_convenience_people_facilities = new ConveniencePeopleFacilities();
start_convenience_people_facilities.init();