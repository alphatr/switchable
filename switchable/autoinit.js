/**
 * jQuery Switchable v1.0
 * Plugin: AutoInit
 * By: baipan
 * 2014-01-17
 * autoinit.js
 * 自动初始化
 */
(function ($) {
    $('.j-switchable').each(function (index, el) {
        var conf = $(el).data('switch') || {},
        api = $(el).switchable(conf);
        $.extend(el, {"switchable": api});
    });
})(jQuery);