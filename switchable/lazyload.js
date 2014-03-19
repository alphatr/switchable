/**
 * jQuery Switchable v1.0
 * Plugin: LazyLoad
 * By: baipan
 * 2014-01-16
 * autoplay.js
 * 延迟加载
 */
// lazyload.js
(function ($, window, document, undefined) {
    // 新增参数
    $.extend($.switchable.Config, {
        // DOM lazyload Class
        lazyloadCls: 'switchlazyload'
    });

    $.switchable.Plugins.push({
        name: 'lazyload',

        init: function (host) {
            var lazyloadCls = host.config.lazyloadCls,
            loadLazyDom = function ($el) {
                if ($el.hasClass(lazyloadCls)) {
                    var lazyDom = $el.val().trim();
                    $el.replaceWith(lazyDom);
                    return true;
                }
                return false;
            };

            // 监听事件
            $(host).on('beforeSwitch', function () {
                $(host.panels).each(function (index, el) {
                    if (!loadLazyDom($(el))) {
                        loadLazyDom($(el).find("." + lazyloadCls));
                    }
                });
            });
        }
    });
})(jQuery, window, document);