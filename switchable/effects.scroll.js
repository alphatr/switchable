/**
 * jQuery Switchable v1.0
 * Effect Plugin: Scroll
 * By: baipan
 * 2014-01-16
 * effect.scroll.js
 * 轮播效果
 */
(function ($, window, document, undefined) {
    if (!$.switchable) {
        return;
    }
    var _position = 'position',
        _absolute = 'absolute',
        _relative = 'relative';

    // 新增参数
    $.extend($.switchable.Config, {
        horiz: true
    });

    $.switchable.Effects.scroll = function (from, to) {
        var self = this,
            cfg = self.config,
            data = self._data,
            isBackward = from === 0 && to === data.max,
            isCritical = (isBackward || from === data.max && to === 0) && self._circle,
            props = {},
            beforeAnimate = function () {
                props[data.prop] = isCritical ? self._adjustPosition(isBackward) : -data.size * to;
            },
            afterAnimate = function () {
                if (isCritical) {
                    self._resetPosition(isBackward);
                }
                self._anim = undefined;
            };

        if (self._anim) {
            self._anim.stop(true);
        }

        setTimeout(function () {
            beforeAnimate();
            self._anim = new $.switchable.Animate(data.wrap, props, cfg.duration, cfg.easing, afterAnimate);
        }, 0);
    };


    $.switchable.Plugins.push({
        name: 'scroll effect',

        init: function (host) {
            var cfg = host.config,
                panels = host.panels,
                width = panels.eq(0).outerWidth(true),
                height = panels.eq(0).outerHeight(true),
                props = {},
                data = host._data = {
                    wrap: panels.parent(),
                    max: host.length - 1,
                    prop: cfg.horiz ? 'left' : 'top',
                    size: cfg.horiz ? width : height
                };



            if (cfg.effect.toLowerCase() !== 'scroll') {
                return;
            }

            if (cfg.loop) {
            }

            // 3. 初始化样式
            if (host.root.css(_position) === 'static') {
                host.root.css(_position, _relative);
            }

            props[_position] = _absolute;
            props[data.prop] = -data.size * host.index;
            data.wrap.css(props).css('width', cfg.horiz ? width * host.length : width);

            // 4. 存储动画属性, 便于外部(如 autoplay)调用
            host.isHoriz = cfg.horiz;

            $.extend(host, {
                /**
                 * 调整位置
                 */
                _adjustPosition: function (isBackward) {
                    var start = isBackward ? data.max : 0;

                    props[_position] = _relative;
                    props[data.prop] = (isBackward ? -1 : 1) * data.size * host.length;
                    panels.slice(start, start + 1).css(props);
                    return isBackward ? data.size : -data.size * host.length;
                },

                /**
                 * 复原位置
                 */
                _resetPosition: function (isBackward) {
                    var start = isBackward ? data.max : 0;

                    props[_position] = '';
                    props[data.prop] = '';
                    panels.slice(start, start + 1).css(props);

                    props[_position] = undefined;
                    props[data.prop] = isBackward ? -data.size * data.max : 0;
                    data.wrap.css(props);
                }
            });
        },
        destroy: function (host) {
            if (host._anim) {
                host._anim.stop(true);
            }
        }
    });

})(jQuery, window, document);