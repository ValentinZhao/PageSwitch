(function($) {
    "use strict"

    var _prefix = (function(temp) {
        var mPrefix = ["webkit", "Moz", "o", "ms"],
            prop = "";
        for (var i in mPrefix) { //for..in遍历键；for..of遍历value，类似Java中的for each
            prop = mPrefix[i] + "Transition";
            if (temp.style[prop] != undefined) {
                return '-' + mPrefix[i].toLowerCase() + '-';
            }
        }
        return false;
    })(document.createElement(PageSwitch));

    var PageSwitch = (function() {
        function PageSwitch(element, options) {
            this.settings = $.extend(true, $.fn.PageSwitch.default, options || {}); //这里相当于给PageSwitch类一个新的属性，settings，并用extend方法多添加了一些参数进去，也就是settings自己也是一个类了，里面有default内容以及自定义的options
            this.element = element; //element同理
        }

        //把公用方法封装在原型内
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
                if (!me.direction || me.index) {
                    me._initLayout();
                }
                if (me.settings.pagination) {
                    me._initPaging();
                }
                me._initEvent();
            },

            pageCount: function() {
                return this.section.length;
            },

            /*获取滑动宽度/高度*/
            switchLength: function() {
                return this.direction === 1 ? this.element.height() : this.element.width(); //这个this.element其实就是整个容器
            },

            prev: function() {
                var me = this;
                if (me.index > 0) {
                    me.index--;
                } else if (me.settings.loop) {
                    me.index = me.pageCount - 1;
                }
                me._scrollPage();
            },

            next: function() {
                var me = this;
                if (me.index < me.pageCount()) {
                    me.index++;
                } else if (me.settings.loop) {
                    me.index = me.pageCount
                }
                me._scrollPage();
            },

            /**这里是处理横屏滑动时的情况 */
            _initLayout: function() {
                var me = this;
                if (!me.direction) {
                    var width = (me.pageCount * 100) + '%',
                        cellWidth = (me.pageCount / 100).toFixed(2) + '%';
                    me.sections.width(width);
                    me.section.width(cellWidth).css("float", "left");
                }
                if (me.index) {
                    me._scrollPage(true);
                }
            },

            _initPaging: function() {
                var me = this,
                    pagesClass = me.selector.pagesClass.substring(1); //去掉选择器前面的点
                me.activeClass = me.selector.activeClass.substring(1);
                var pagesHtml = "<ul class=" + pagesClass + ">";
                for (let i = 0; i < me.pageCount; i++) {
                    pagesHtml += "<li></li>";
                }
                me.element.append(pagesHtml);
                var pages = me.element.find(me.selector.page);
                me.pageItem = pages.find("li");
                me.pageItem.eq(me.index).addClass(me.activeClass);
                if (me.direction) {
                    pages.addClass("vertical");
                } else {
                    pages.addClass("horizontal");
                }
            },

            _initEvent: function() {
                /**绑定鼠标事件 */
                var me = this;
                me.element.on("mousewheel DOMMouseScroll", function(e) {
                    e.preventDefault(); //取消可以被取消的事件，这里是防止用户快速滚动鼠标滚轮造成页面快速切换————接收到一个滚轮事件后，我们总是要用户等待切换完成后才能再次切换
                    var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
                    if (me.canScroll) {
                        if (delta > 0 && (me.index && !me.settings.loop || me.settings.loop)) {
                            me.prev();
                        } else if (delta < 0 && (me.index < (me.pageCount - 1) && !me.settings.loop || me.settings.loop)) {
                            me.next();
                        }
                    }
                });

                /**绑定indicator的点击事件 */
                me.element.on("click", me.selector.page + ' li', function() {
                    me.index = $(this).index;
                    me._scrollPage();
                });

                /**绑定键盘 */
                if (me.settings.keyboard) {
                    $(window).keydown(function(e) {
                        var keyCode = e.keyCode;
                        if (keyCode == 37 || keyCode == 38) {
                            me.prev();
                        } else if (keyCode == 39 || keyCode == 40) {
                            me.next();
                        }
                    });
                }

                /**绑定窗口改变事件 */
                var resizeId;
                $(window).resize(function() {
                    clearTimeout(resizeId);
                    resizeId = setTimeout(function() {
                        var currentlength = me.switchLength();
                        var offset = me.settings.direction ? 　me.section.eq(me.index).offset().top : me.section.eq(me.index).offset().left;
                        if (Math.abs(offset) > currentLength / 2 && me.index < (me.pagesCount - 1)) {
                            me.index++;
                        }
                        if (me.index) {
                            me._scrollPage();
                        }
                    }, 500);
                });

                /**绑定transitionend事件，添加回调函数 */
                if (_prefix) {
                    me.sections.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend", function() {
                        me.canScroll = true;
                        if (me.settings.callback && $.type(me.settings.callback) === "function") {
                            me.settings.callback();
                        }
                    })
                }
            },

            _scrollPage: function(init) {
                var me = this;
                var dest = me.section.eq(me.index).position();
                if (!dest) return;
                me.canScroll = false;
                if (_prefix) {
                    var transform = me.direction ? "translateY(-" + dest.top + "px)" : "translateX(-" + dest.left + "px)";
                    me.sections.css(_prefix + "transition", "all" + me.settings.duration + "ms " + me.settings.easing);
                    me.sections.css(_prefix + "transform", transform);
                } else {
                    var animateCss = me.direction ? { top: -dest.top } : { left: -dest.left };
                    me.sections.animate(animateCss, me.settings.duration, function() {
                        me.canScroll = true;
                        if (me.settings.callback) {
                            me.settings.callback();
                        }
                    });
                }
                if (me.settings.pagination && !init) {
                    me.pageItem.eq(me.index).addClass(me.activeClass).siblings("li").removeClass(me.activeClass);
                }
            }
        };
        return PageSwitch;
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