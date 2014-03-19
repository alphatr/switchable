/**
 * jQuery Switchable v1.0
 * Effect Plugin: Fade
 * By: baipan
 * 2014-01-15
 * effect.fade.js
 * 淡入淡出效果
 */
(function ($, window, document, undefined) {
    if (!$.switchable) {
        return;
    }

    $.switchable.Effects.fade = function (from, to) {
        var self = this,
            cfg = self.config,
            panels = self.panels,
            fromPanel = panels.slice(from, from + 1),
            toPanel = panels.slice(to, to + 1),
            beforeAnimate = function () {
                toPanel.css({opacity: 1});
            },
            afterAnimate = function () {
                toPanel.css({zIndex: self.length});
                fromPanel.css({zIndex: 1});
                self._anim = undefined;
            };

        if (self._anim) {
            self._anim.stop(true);
        }

        beforeAnimate();

        self._anim = new $.switchable.Animate(fromPanel, {opacity: 0}, cfg.duration, cfg.easing, afterAnimate);
    };


    $.switchable.Plugins.push({
        name: 'fade effect',

        init: function (host) {
            var cfg = host.config,
                panels = host.panels,
                index = host.index,
                initPanel = panels.slice(index, index + 1);

            if (cfg.effect.toLowerCase() === 'fade') {
                // init styles
                panels.css({position: "absolute", top: 0, left: 0});
                panels.not(initPanel).css({opacity: 0, zIndex: 1});
                initPanel.css({opacity: 1, zIndex: host.length});
            }
        },
        destroy: function (host) {
            if (host._anim) {
                host._anim.stop(true);
            }
        }
    });
})(jQuery, window, document);