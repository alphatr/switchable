/**
 * jQuery Switchable v1.0
 * Plugin: SwitchNum
 * By: baipan
 * 2014-01-16
 * switchnum.js
 * 显示计数器
 */
(function ($, window, document, undefined) {
    if (!$.switchable) {
        return;
    }

    // 新增参数
    $.extend($.switchable.Config, {
        // index偏移量
        indexOffset: 1,

        // 返回的格式
        numFormat: '[index]/[length]',

        // 选择器
        switchNum: '.switch-num'
    });

    $.switchable.Plugins.push({
        name: 'switchnum',

        init: function (host) {
            var cfg = host.config,
                textFormat = function (index, length) {
                    var switchText = cfg.numFormat.replace(/\[index\]/ig, index + cfg.indexOffset);
                    return switchText.replace(/\[length\]/ig, length);
                };

            if (!cfg.switchNum && $(host.root).find(cfg.switchNum).length) {
                return;
            }

            // 初始化
            $(host.root).find(cfg.switchNum).html(textFormat(cfg.initIndex, host.length));

            // 监听事件
            $(host).on('switch', function () {
                $(host.root).find(cfg.switchNum).html(textFormat(host.index, host.length));
            });
        }
    });

})(jQuery, window, document);