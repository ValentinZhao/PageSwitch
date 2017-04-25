(function($) {






    $.fn.PageSwitch.default = {
        selector: {
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
    }
})(jQuery);