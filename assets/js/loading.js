jQuery.loading = {
    PageLoading: function (options) {
        var defaults = {
            opacity: 1,
            backgroundColor: "#fff",
            borderColor: "#bbb",
            borderWidth: 1,
            borderStyle: "solid",
            loadingTips: "loading...",
            TipsColor: "#666",
            delayTime: 1000,
            zindex: 9999,
            sleep: 0,
            complete: undefined //load执行函数
        }
        var options = $.extend(defaults, options);

        //获取页面宽高
        var _PageHeight = document.documentElement.clientHeight,
            _PageWidth = document.documentElement.clientWidth;

        //在页面未加载完毕之前显示的loading Html自定义内容
        var _LoadingHtml = '<div id="loadingPage" style="position:fixed;left:0;top:0;_position: absolute;width:100%;height:' + _PageHeight + 'px;background:' + options.backgroundColor + ';opacity:' + options.opacity + ';filter:alpha(opacity=' + options.opacity * 100 + ');z-index:' + options.zindex + ';"><div id="loadingTips" style="position: absolute; cursor1: wait; width: auto;border-color:' + options.borderColor + ';border-style:' + options.borderStyle + ';border-width:' + options.borderWidth + 'px; height:80px; line-height:80px; padding-left:80px; padding-right: 5px;border-radius:10px;  background: ' + options.backgroundColor + ' url(assets/img/loading.gif) no-repeat 5px center; color:' + options.TipsColor + ';font-size:20px;text-align:center;">' + options.loadingTips + '</div></div>';

        //呈现loading效果
        $("body").append(_LoadingHtml);

        //获取loading提示框宽高
        var _LoadingTipsH = document.getElementById("loadingTips").clientHeight,
            _LoadingTipsW = document.getElementById("loadingTips").clientWidth;

        //计算距离，让loading提示框保持在屏幕上下左右居中
        var _LoadingTop = _PageHeight > _LoadingTipsH ? (_PageHeight - _LoadingTipsH) / 2 : 0,
            _LoadingLeft = _PageWidth > _LoadingTipsW ? (_PageWidth - _LoadingTipsW) / 2 : 0;

        $("#loadingTips").css({
            "left": _LoadingLeft + "px",
            "top": _LoadingTop + "px"
        });

        //监听页面加载状态
        document.onreadystatechange = PageLoaded;

        //当页面加载完成后执行
        function PageLoaded() {
            if (document.readyState == "complete") {
                var loadingMask = $('#loadingPage');
                setTimeout(function () {
                        loadingMask.animate({
                                "opacity": 0
                            },
                            options.delayTime,
                            function () {
                                $(this).hide();
                            });
                            if (options.complete) {
                                options.complete();
                            }

                    },
                    options.sleep);
            }
        }
    }
}