//东城活力
function Vitality(){
    this.lenged_data = ["音乐", "戏剧", "展览", "电影",
        "公益", "讲座", "聚会", "课程", "其他"];
    this.radar_chart_indicator_data = [];
    this.radar_chart_data = {};
    this.mainMap = "";
    this.populationVitalityLayer = "";//人口活力人力图层
    this.cultureVitalityLayer = "";//文化活力图层
    this.vitalityPointBorderLayer = "";//活力点边界图层
    this.currentVitalityPointBorderLayer = "";//当前活力点高亮图层
    this.currentTime = "00:00";
    this.mainVitalityPointName = "";//重要活力点
    this.vitality_type = "";//活力图层类型
    this.isCheckedVitality = false;//是佛选中图层类型
    this.current_type = "";
}
Vitality.prototype.init = function(){
    $("#vitality_legend").addClass("map_legend_animation");
    var _this = this;
    $("#vitality_legend input").each(function(i){
        $(this).on("click",function(){
            $(this).parent(".input-item").siblings().children("input").prop("checked",false);
            _this.isCheckedVitality = $(this).prop("checked");
            _this.vitality_type = $(this).val();
            _this.layerInit();
        })
    });
    this.loadBanner();
    this.get_view_chart_data();
    this.mapInit();
    this.loadVitalityPointBorderLayer();//默认加载所有重要区域边界
    this.handleDom();//加载侧边DOM操作
    var _this = this;
    // 点击左侧活力点触发
    $("#vitality_point li").on("click", function () {
        _this.mainVitalityPointName = $(this).html();
        _this.loadCurrentVitalityPointBorderLayer();
    });
}
//加载banner
Vitality.prototype.loadBanner = function(){
    serveRequest("get", service_config.data_server_url+"banner/getBannerList",{ type:"VIGOUR" },function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        var banner_str = '';
        var toUrl = "./assets/bannerSubPage/vitality/banner_"
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            banner_str += '<img src='+ service_config.server_img_url + item.url +' width="100%" data-href='+  toUrl+(i+1)+".html" +' >'
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
Vitality.prototype.mapInit = function(){
    //加载主地图
	this.mainMap = new AMap.Map("main_map", {
        // features: ['bg',],
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
	    center: [116.412255,39.908886],
	    zoom: 12,
    });
    //加载人口热力图图层
    this.populationVitalityLayer = new Loca.HeatmapLayer({
        map: this.mainMap,
    });
    //加载文化热力图图层
    this.cultureVitalityLayer = new Loca.HeatmapLayer({
        map: this.mainMap,
    });
    //活力点边界图层
    this.vitalityPointBorderLayer = new Loca.LineLayer({
        map: this.mainMap,
        eventSupport:true,
        // fitView: true,
    });
    //点击左侧活力点触发当前活力点高亮
    this.currentVitalityPointBorderLayer = new Loca.LineLayer({
        map: this.mainMap,
    });
}
//DOM元素操作
Vitality.prototype.handleDom = function(){
    var _this = this;
    //默认加载文化遗产类别
    _this.loadVitalityPointList("文化遗产");
    $(".heat-sidebar .catalog li").on("click", function () {
        if ($(this).hasClass("active")) return;
        $(".heat-sidebar .catalog li").removeClass("active");
        $(this).addClass("active");
        var current_type = $(this).attr("data-cat");
        _this.current_type = current_type;
         _this.loadVitalityPointList(current_type);
    });
    //搜索输入框enter触发
    $("#search_text").on("keydown",function(event){
        if(event.keyCode==13){
            $(".search-btn").trigger("click");
        }
    })
    //搜索触发
    $(".search-btn").on("click", function () {
        $.get(service_config.file_server_url+'important_culture_area_border_data.json', function (result) {
            // var data = JSON.parse(result);
            var data = result;
            var new_data = "";
            for(var i = 0; i < data.length; i++){
                var item = data[i];
                if(item.properties.name.indexOf($("#search_text").val()) !== -1){
                    new_data += "<li>"+item.properties.name+"</li>";
                }
            }
            $("#vitality_point").html(new_data);
            $("#vitality_point li").on("click", function () {
                $(this).addClass("active").siblings("li").removeClass('active');
                var img_url = "images/culturalheritage/";//文化遗产
                if(_this.current_type === "历史街区"){
                    img_url = "images/street/";
                }else if(_this.current_type === "公园"){
                    img_url = "images/park/";
                }else if(_this.current_type === "商圈"){
                    img_url = "images/business/";
                }
                $("#scenic_spot_info .name").html($(this).html());
                $("#scenic_spot_info .pointer-cover").html('<img src='+service_config.server_img_url+ img_url +(($(this).html()).replace(/\s*/g,""))+".jpg"+' />');
                $("#scenic_spot_info").removeClass("hide");
                _this.mainVitalityPointName = $(this).html();
                _this.loadCurrentVitalityPointBorderLayer()
            });

        })
    });
}
// 根据选择类型加载活力点列表
Vitality.prototype.loadVitalityPointList = function(name){
    var _this = this;
    $.get(service_config.file_server_url+'important_culture_area_border_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
        var new_data = "";
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            if(item.properties.type === name){
                new_data += "<li>"+item.properties.name+"</li>";
            }
        }
        $("#vitality_point").html(new_data);
        $("#vitality_point li").on("click", function () {
            $(this).addClass("active").siblings("li").removeClass('active');
            var img_url = "images/culturalheritage/";//文化遗产
            if(_this.current_type === "历史街区"){
                img_url = "images/street/";
            }else if(_this.current_type === "公园"){
                img_url = "images/park/";
            }else if(_this.current_type === "商圈"){
                img_url = "images/business/";
            }
            $("#scenic_spot_info .name").html($(this).html());
            $("#scenic_spot_info .pointer-cover").html('<img src='+service_config.server_img_url+ img_url +(($(this).html()).replace(/\s*/g,""))+".jpg"+' />');
            $("#scenic_spot_info").removeClass("hide");
            _this.mainVitalityPointName = $(this).html();
            _this.loadCurrentVitalityPointBorderLayer()
        });

    })
}
//图层初始化
Vitality.prototype.layerInit = function(){
    // this.loadBoundaryLayer();
    // 
    if(this.isCheckedVitality){
        if(this.vitality_type === "population"){
            this.cultureVitalityLayer.hide();
            this.loadPopulationVitalityLayer()
            this.timeline();
            $("#timeline").fadeIn(300);
        }else{
            $("#timeline").fadeOut(300);
            this.populationVitalityLayer.hide();
            this.loadCultureVitalityLayer();
        }
    }else{
        $("#timeline").fadeOut(300);
        this.populationVitalityLayer.hide();
        this.cultureVitalityLayer.hide();
    }
}
//各个社区边界范围图层
Vitality.prototype.loadBoundaryLayer = function(){
    var boundaryLayer = new Loca.PolygonLayer({
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
//加载人口活力图层
Vitality.prototype.loadPopulationVitalityLayer = function(){
    var _this = this;
    $.get(service_config.file_server_url+'population_vitality_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;

        _this.populationVitalityLayer.setData(data["10:00"], {
            lnglat: 'lnglat',
            value: 'count'
        });
        _this.populationVitalityLayer.setOptions({
            style: {
                radius: 10,
                color: {
                    // 0.5: '#2c7bb6',
                    // 0.65: '#abd9e9',
                    // 0.7: '#ffffbf',
                    // 0.9: '#fde468',
                    // 1.0: '#d7191c',
                    0.1:"#2892C6",
                    0.2:"#81B3AA",
                    0.3: '#BFD38B',
                    0.4: '#FAFA64',
                    0.5: '#FCB344',
                    0.7: '#FD0100',
                    1:"#A80000",
                },
                // opacity:[0.1,0.5]
            }
        });
        _this.populationVitalityLayer.render();
        _this.populationVitalityLayer.show();
	})
}
//文化热力图层
Vitality.prototype.loadCultureVitalityLayer = function(){
    var _this = this;
    $.get(service_config.file_server_url+'culture_vitality.csv', function (result) {
        // var data = JSON.parse(result);
        var data = result;
        _this.cultureVitalityLayer.setData(data, {
            // lnglat: '经纬度',
            // 或者使用回调函数构造经纬度坐标
             lnglat: function (obj) {
                if (obj.value) {
                     var value = obj.value;
                     var lnglat = [value['X'], value['Y']];
                     return lnglat;
                }
             },
             
            // 指定数据类型
            type: 'csv'
        });
        _this.cultureVitalityLayer.setOptions({
            style: {
                radius: 5,
                // color: function(res){
                //     var val = res.value.value*1;
                //     if(0 <= val && val <=  3000){
                //         return "#2892C6";
                //     }else if(3001 <= val && val <= 7000){
                //         return "#81B3AA";
                //     }else if(7001 <= val && val <= 12000){
                //         return "#BFD38B";
                //     }else if(12001 <= val && val <= 15000){
                //         return "#FAFA64";
                //     }else if(15001 <= val && val <= 18000){
                //         return "#FCB344";
                //     }else if(18001 <= val && val <= 26000){
                //         return "#FD0100";
                //     }else if(26001 <= val && val <= 49038){
                //         return "#A80000"
                //     }
                // },
                color: {
                    0.1:"#2892C6",
                    0.2:"#81B3AA",
                    0.3: '#BFD38B',
                    0.4: '#FAFA64',
                    0.5: '#FCB344',
                    0.7: '#FD0100',
                    1:"#A80000",
                },
                opacity:[0.1,0.5]
            }
        });
        _this.cultureVitalityLayer.render();
        _this.cultureVitalityLayer.show();
    })
}
//重要活力点范围边界
Vitality.prototype.loadVitalityPointBorderLayer= function(){
    var _this = this;
    $.get(service_config.file_server_url+'important_culture_area_border_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
        _this.vitalityPointBorderLayer.setData(data, {
            lnglat: 'lnglat',
        });
        _this.vitalityPointBorderLayer.setOptions({
            style: {
                borderWidth: 2,
                opacity: 1,
                // color: '#86100F',
                color: function(res){
                    console.log(res)
                    var type = res.value.properties.type;
                    var color ="#5abfba";
                    switch (type){
                        case "公园":
                            color = "#5e61aa";
                        break;
                        case "文化遗产":
                            color = "#c6826f";
                        break;
                        case "商圈":
                            color = "#70a8da";
                        break;
                        case "历史街区":
                            color = '#5abfba';
                        break;
                    }
                    return color;
                },
            }
        });
        _this.vitalityPointBorderLayer.render();
    })
}
//点击左侧活力点加载当前范围边界
Vitality.prototype.loadCurrentVitalityPointBorderLayer= function(){
    var _this = this;
    $.get(service_config.file_server_url+'important_culture_area_border_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            if(item.properties.name === _this.mainVitalityPointName){
                _this.currentVitalityPointBorderLayer.setData([item], {
                    lnglat: 'lnglat',
                });
                $("#current_vitality_potion_text").html(item.properties.introduce_text);
                $(".brief-content").removeClass("less with-btn");
                if ($(".point-brief-box .text").height() > 100) {
                    //内容高度超过150，截取内容, 显示『显示更多』 按钮
                    $(".brief-content").addClass("less with-btn");
                }
            }else{
            }
        }
        _this.currentVitalityPointBorderLayer.setOptions({
            style: {
                borderWidth: 3,
                opacity: 1,
                color: '#FCA600',
            }
        });
        _this.currentVitalityPointBorderLayer.render();
    })
}
//时间轴
Vitality.prototype.timeline = function(){
    var option = {
        timeline: {
            left:10,
            right:10,
            bottom:10,
            axisType: 'category',
            // realtime: false,
            // loop: false,
            autoPlay: true,
            // currentIndex: 0,
            playInterval: 3000,
            controlStyle: {
                // show: false,
                showNextBtn: false,
                showPrevBtn: false,
            },
            data: timeLine,
            checkpointStyle:{
                symbolSize:16,
                color:"#86100F",
            },
            label: {
                color:"#fff",
                lineHeight: 30,
            }
        }
    };
    var timelineChart = echarts.init(document.getElementById("timeline"));
    timelineChart.setOption(option, true);
    var _this = this;
    timelineChart.on("timelinechanged",function(params) {
        _this.currentTime = timeLine[params.currentIndex];
        // _this.vitality_type === "population" && _this.isCheckedVitality
        //     ?_this.loadPopulationVitalityLayer():"";
    })
}
//分类拆分数据
Vitality.prototype.get_view_chart_data = function(){
    var _this = this;
    serveRequest("get", service_config.data_server_url+"vigour/getVigourList",{},function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            _this.radar_chart_indicator_data.push({
                name: item.streetName.replace("街道",""),
                // max:100,
                color:'#222',
                rotate:90
            })
        }
        var lenged_english_data = ["music", "theatre", "display", "film", "publicWelfare", "lecture", "party", "curriculun", "others"];
        for(var i = 0; i < lenged_english_data.length; i++){
            var itemData = [];
            for(var j = 0; j < data.length; j++){
                var item = data[j];
                itemData.push(item[lenged_english_data[i]]);
            }
            _this.radar_chart_data[_this.lenged_data[i]] = itemData;
        }
        _this.load_radar_chart();
    })
}
//文化活力项目覆盖率雷达图图表数据
Vitality.prototype.load_radar_chart = function(){
    var radarChart = echarts.init(document.getElementById("culture_coverage_content"));
    var radar_option = {
        color: echarts_colors,
        // title:get_object_assign({
        //     text:"各类型文化活动数量统计图",
        // },echart_title),
        legend: {
            show: true,
            left:20,
            top:0,
            textStyle: {
                "fontSize": 12,
                "color": "#222"
            },
            "data": this.lenged_data,
            selected: {
                '音乐': true,
                '戏剧': false,
                '展览': false,
                '电影': false,
                '公益': false,
                '讲座': false,
                '聚会': false,
                '课程': false,
                '其他': false,
            }
        },
        tooltip: {
            show: true,
            trigger: "item"
        },
        radar: {
            center: ["50%", "50%"],
            radius: "60%",
            startAngle: 90,
            splitNumber: 4,
            shape: "circle",
            splitArea: {
                "areaStyle": {
                    "color": ["transparent"]
                }
            },
            // axisLabel: {
            //     "show": false,
            //     "fontSize": 18,
            //     "color": "#666",
            //     "fontStyle": "normal",
            //     "fontWeight": "normal",
            //     rotate:90,
            // },
            axisLine: {
                "show": true,
                "lineStyle": {
                    "color": "grey"//
                }
            },
            splitLine: {
                "show": true,
                "lineStyle": {
                    "color": "grey"//
                }
            },
            indicator: this.radar_chart_indicator_data
        },
        "series": []
    };
    for(var i = 0; i < this.lenged_data.length; i++){
        radar_option.series.push(
            {
                "name": this.lenged_data[i],
                "type": "radar",
                "symbol": "circle",
                "symbolSize": 5,
                "areaStyle": {
                    "normal": {
                        "color": echarts_colors[i],
                        opacity:0.5,
                    }
                },
                itemStyle:{
                    color:echarts_colors[i],
                    borderColor:echarts_colors[i],
                    borderWidth:5,
                    opacity:0.5,
                },
                "lineStyle": {
                    "normal": {
                        "type": "dashed",
                        "color": echarts_colors[i],
                        "width": 2,
                        opacity:0.3,
                    }
                },
                "data": [
                    this.radar_chart_data[this.lenged_data[i]]
                ]
            }); 
    }
    radarChart.setOption(radar_option, true);
    window.onresize = function(){
        radarChart.resize();
    }
}
var start_parking_difficult = new Vitality();
start_parking_difficult.init(); 