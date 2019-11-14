//箭头控制内容滚动
//向上滚动
$(".move-down").on("click", function () {
    moveElem = $(this).parent().parent().children("ul");
    scrollElementMove(moveElem, 'up');
});

//向下滚动
$(".move-up").on("click", function () {
    moveElem = $(this).parent().parent().children("ul");
    scrollElementMove(moveElem, 'down');
});

//滚动函数
function scrollElementMove(moveElem, direction) {
    var jumpDistance = 80;
    var scrollHeight = moveElem[0].scrollHeight;
    var height = moveElem[0].clientHeight;
    var top = moveElem[0].scrollTop;
    var to = direction === 'up' ? top + jumpDistance : top - jumpDistance;
    to = to < 0 ? 0 : to;
    to = to > scrollHeight ? scrollHeight : to;
    moveElem.animate({
        "scrollTop": to
    }, 300);
}