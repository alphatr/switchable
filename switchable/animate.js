/**
 * jQuery Switchable v1.0
 * Plugin: Animate
 * By: baipan
 * 2014-01-15
 * animate.js
 * 动画函数
 */
(function ($, window, document, undefined) {
    if (!$.switchable) {
        return;
    }

    /*
     * 新增的配置项
     */
    $.extend($.switchable.Config, {
        // 动画时长
        duration: 500,

        // 时间因子
        easing: "ease"
    });

    // 动画类
    $.switchable.Animate = function ($el, props, duration, easing, callback) {
        var self = this,
            transition = {},
            css3,
            timer;

        // 检测浏览器是否支持CSS3 Transition, 并缓存结果
        if ($.switchable.Transition === undefined) {
            $.switchable.Transition = supportTransition();
        }
        css3 = $.switchable.Transition;

        $.extend(self, {
            isAnimated: false,

            run: function () {
                // already started
                if (self.isAnimated) {
                    return;
                }

                var index,
                    cssList = [];

                for (index in props) {
                    cssList.push(index);
                }

                if (css3) {
                    transition[css3 + 'Property'] = cssList.join(', ') || 'all';
                    transition[css3 + 'Duration'] = duration + 'ms';
                    transition[css3 + 'TimingFunction'] = easing;

                    $el.css($.extend(props, transition));

                    // 动画结束后执行回调
                    timer = setTimeout(function () {
                        // 清除 css3 transition
                        self._clearCss();

                        self._complete();
                    }, duration);

                } else {
                    var regex = /cubic-bezier\(([\s\d.,]+)\)/,
                        cbMatch = easing.match(regex),
                        timingFn = $.switchable.TimingFn[easing];

                    // 处理 easing
                    if (timingFn || cbMatch) {
                        easing = $.switchable.Easing(cbMatch ? cbMatch[1] : timingFn.match(regex)[1]);
                    }

                    $el.animate(props, duration, easing, function () {
                        self._complete();
                    });
                }

                self.isAnimated = true;

                return self;
            },

            /*
             * params[:gotoEnd]    A Boolean indicating whether to complete the current animation immediately. Defaults to false.
             */
            stop: function (gotoEnd) {
                // already stopped
                if (!self.isAnimated) {
                    return;
                }

                if (css3) {
                    // 阻止回调执行
                    clearTimeout(timer);
                    timer = undefined;
                    if (gotoEnd) {
                        self._clearCss();
                        self._complete();
                    }
                } else {
                    // stop jQuery animation
                    $el.stop(false, gotoEnd);
                }


                self.isAnimated = false;

                return self;
            },

            _complete: function () {
                if ($.isFunction(callback)) {
                    callback();
                }
            },

            _clearCss: function () {
                transition[css3 + 'Property'] = 'none';
                // transition[css3 + 'Duration'] = '';
                // transition[css3 + 'TimingFunction'] = '';
                $el.css(transition);
            }
        });

        self.run();
    };

    // 检测客户端是否支持CSS3 Transition
    var supportTransition = function () {
        var el = document.documentElement,
        prefix = ['Webkit', 'Moz'/*, 'O'*/],
        name = 'transition',
        support = '',
        i;

        if (el.style[name] !== undefined) {
            support = name;
        } else {
            for (i = 0; i < 2; i++) {
                if (el.style[(name = prefix[i] + 'Transition')] !== undefined) {
                    support = name;
                    break;
                }
            }
        }
        return support;
    };
})(jQuery, window, document);