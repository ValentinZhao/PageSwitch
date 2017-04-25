(function($) {

    var PageSwitch = (function() {
        function PageSwitch(element, options) {
            this.settings = $.extend(true, $.fn.PageSwitch.default, options || {}); //这里相当于给PageSwitch类一个新的属性，settings，并用extend方法多添加了一些参数进去，也就是settings自己也是一个类了，里面有default内容以及自定义的options
            this.element = element; //element同理
        }

        PageSwitch.prototype = {
            init: function() {
                var me = this; //用me来缓存PageSwitch的this
                me.selector = me.settings.selector; //获得选择器
                me.sections = me.element.find(me.selector.sections); //找到sections的DOM，也就是包裹若干滑动页面的容器
                me.section = me.section.find(me.selector.section);
                me.direction = me.settings.direction === "vertical" ? true : false;
                me.pageCount = me.pageCount();
                me.index = (me.settings.index > 0 && me.settings.index < me.pageCount) ? me.settings.index : 0;
                me.canScroll = true; //现在才为PageSwitch添加的新属性，主要用来阻止画面切换动画播放时用户的其他动作，比如向下切换时用户向上滚动这时若canScroll为false则不会打断当前动画
            },

            pageCount: function() {

            },

        }
    })();

    $.fn.PageSwitch = function(options) {
        return this.each(function() {
            var me = $(this),
                instance = me.data("PageSwitch");
            if (!instance) {
                me.data("PageSwitch", (PageSwitch = new PageSwitch(me, options)));
            }
            if ($.type(options) === "string") {
                return instance[options]();
            }
        });
    };

    $.fn.PageSwitch.default = {
        selector: { //选择器类，通过选择器利用jQ获得真正的DOM结构
            sections: ".sections",
            section: ".section",
            page: ".pages",
            active: ".active"
        },
        index: 0,
        easing: 　 "ease",
        duration: 500,
        loop: false,
        pagination: true,
        keyboard: true,
        direction: "vertical",
        callback: ""
    };
})(jQuery);