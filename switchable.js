/**
 * jQuery Switchable v1.0
 * By: baipan
 * 2014-01-15
 * core.js
 */
(function ($, window, document, undefined) {

    $.switchable = {
        /**
         * 配置
         */
        Config: {
            // 轮播的面板
            panels: '.panels > *',

            // 默认激活项
            initIndex: 0,

            // 切换动画
            effect: 'none',

            // 循环
            loop: false,

            // 切换前的回调
            onBeforeSwitch: null,

            // 切换后的回调
            onSwitch: null
        },

        /**
         * 切换效果
         */
        Effects: {
            "none": function (from, to) {
                var self = this,
                    panels = self.panels;

                panels.slice(from, from + 1).hide();
                panels.slice(to, to + 1).show();
            }
        },

        /**
         * 插件
         */
        Plugins: []
    };

    var Switchable = function (root, cfg) {
        var self = this,
            $self = $(this),
            _onBeforeSwitch = "beforeSwitch",
            _onSwitch = "switch";

        $.extend(self, {
            /**
             * install plugins
             */
            _initPlugins: function () {
                var plugins = $.switchable.Plugins,
                    len = plugins.length,
                    i = 0;

                for (; i < len; i++) {
                    if ($.isFunction(plugins[i].init)) {
                        plugins[i].init(self);
                    }
                }
            },

            _warn: function (msg) {
                if (window.console && window.console.warn) {
                    console.warn(msg);
                }
            },

            /**
             * init Switchable
             * 暴露出来的接口有
             * .root 根节点
             * .panels 切换面板列表
             * .length 面板组个数
             * .index 当前的面板组数
             * ._nextIndex 下一面板组数（不在这里初始化）
             */
            _init: function () {
                self.root = root;
                self.config = cfg;
                var $root = $(root),
                    initPanel;

                // 初始化过后继续调用则不能
                if ($root[0]._switchable) {
                    return;
                }

                // 获取 panels
                if ($root.find(cfg.panels).length) {
                    self.panels = $root.find(cfg.panels);
                } else {
                    self._warn('No panel in switchable');
                    return;
                }

                // 获取 panels 分组长度
                self.length = self.panels.length;

                // if no panel group
                if (self.length < 1) {
                    self._warn('No panel group in switchable');
                    return;
                }

                /**
                 * 事件初始化绑定
                 */
                if ($.isFunction(cfg.onBeforeSwitch)) {
                    $self.on(_onBeforeSwitch, cfg.onBeforeSwitch);
                }
                if ($.isFunction(cfg.onSwitch)) {
                    $self.on(_onSwitch, cfg.onSwitch);
                }

                // 当前自然数索引
                self.index = ((cfg.initIndex % self.length) + self.length) % self.length;

                // 不做初始化（只有在自动播放或者翻页按钮切换时候有用）
                self._nextIndex = self.index;

                // 动画初始化（none 的初始化，其他动画由插件的 init() 初始化）
                initPanel = self.panels.slice(self.index, self.index + 1);
                if (cfg.effect.toLowerCase() === 'none') {
                    self.panels.not(initPanel).hide();
                    initPanel.show();
                }

                $root[0]._switchable = this;
                return true;
            },

            /**
             * 切换面板
             */
            _switchPanels: function (from, to) {
                if (to === from) {
                    return;
                }
                cfg.effect = cfg.effect.toLowerCase();
                if (cfg.effect && $.switchable.Effects[cfg.effect]) {
                    $.switchable.Effects[cfg.effect].call(self, from, to);
                } else {
                    self._warn('No switch effect');
                    return;
                }
            },

            /**
             * switch to
             */
            switchTo: function (to) {
                to = to % self.length;

                if (to === self.index) {
                    return self;
                }
                self._nextIndex = to;

                // call beforeSwitch()
                var event = $.Event(_onBeforeSwitch);
                $self.trigger(event, [to]);
                if (event.isDefaultPrevented()) {
                    return;
                }

                // switch panels
                self._switchPanels(self.index, to);

                // update index
                self.index = to;

                // call onSwitch()
                event.type = _onSwitch;
                $self.trigger(event, [to]);

                return self;
            },

            /**
             * get toIndex
             */
            willTo: function () {
                return self._nextIndex;
            },

            /**
             * destroy
             */
            destroy: function () {
                self._destroyPlugins();
                self._destroy();
            },

            /**
             * destroy plugins
             */
            _destroyPlugins: function () {
                var plugins = $.switchable.Plugins,
                    len = plugins.length,
                    i = 0;

                for (; i < len; i++) {
                    if ($.isFunction(plugins[i].destroy)) {
                        plugins[i].destroy(self);
                    }
                }
            },

            /**
             * destroy
             */
            _destroy: function () {
                var index;
                delete $(root)[0]._switchable;
                for (index in self) {
                    delete(self[index]);
                }
            }
        });

        // 初始化并安装插件
        if (self._init()) {
            self._initPlugins();
        } else {
            return $(root)[0]._switchable;
        }
    };


    $.fn.switchable = function (cfg) {
        var $self = $(this),
            length = $self.length,
            apis = [],
            i;

        cfg = $.extend({}, $.switchable.Config, cfg);

        for (i = 0; i < length; i++) {
            apis[i] = new Switchable($self.eq(i), cfg);
        }

        return apis[0];
    };
})(jQuery, window, document); 
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
/**
 * jQuery Switchable v1.0
 * Plugin: Easing
 * By: baipan
 * 2014-01-15
 * easing.js
 * 动画函数
 */
(function ($, window, document, undefined) {
    if (!$.switchable) {
        return;
    }

    var cubicBezier = function (p) {
        return 'cubic-bezier(' + p + ')';
    },
    makeLookup = function (fn) {
        var lookupTable = [],
                steps = 101,
                i;

        for (i = 0; i <= steps; i++) {
            lookupTable[i] = fn.call(null, i / steps);
        }

        return function (p) {
            if (p === 1) {
                return lookupTable[steps];
            }

            var sp = steps * p,
                    p0 = Math.floor(sp),
                    y1 = lookupTable[p0],
                    y2 = lookupTable[p0 + 1];

            return y1 + (y2 - y1) * (sp - p0);
        };
    },


    // From: http://www.netzgesta.de/dev/cubic-bezier-timing-function.html
    // 1:1 conversion to js from webkit source files
    // UnitBezier.h, WebCore_animation_AnimationBase.cpp
    cubicBezierAtTime = function (t, p1x, p1y, p2x, p2y, duration) {
        var ax, bx, cx, ay, by, cy;
        ax = bx = cx = ay = by = cy = 0;
        // `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function sampleCurveY(t) {
            return ((ay * t + by) * t + cy) * t;
        }
        function sampleCurveDerivativeX(t) {
            return (3.0 * ax * t + 2.0 * bx) * t + cx;
        }
        // The epsilon value to pass given that the animation is going to run over |dur| seconds. The longer the
        // animation, the more precision is needed in the timing function result to avoid ugly discontinuities.
        function solveEpsilon(duration) {
            return 1.0 / (200.0 * duration);
        }
        function solve(x, epsilon) {
            return sampleCurveY(solveCurveX(x, epsilon));
        }
        // Given an x value, find a parametric value it came from.
        function solveCurveX(x, epsilon) {
            var t0, t1, t2, x2, d2, i;
            function fabs(n) {
                if (n >= 0) {
                    return n;
                } else {
                    return 0 - n;
                }
            }
            // First try a few iterations of Newton's method -- normally very fast.
            for (t2 = x, i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (fabs(x2) < epsilon) {
                    return t2;
                }
                d2 = sampleCurveDerivativeX(t2);
                if (fabs(d2) < 1e-6) {
                    break;
                }
                t2 = t2 - x2 / d2;
            }
            // Fall back to the bisection method for reliability.
            t0 = 0.0;
            t1 = 1.0;
            t2 = x;
            if (t2 < t0) {
                return t0;
            }
            if (t2 > t1) {
                return t1;
            }
            while (t0 < t1) {
                x2 = sampleCurveX(t2);
                if (fabs(x2 - x) < epsilon) {
                    return t2;
                }
                if (x > x2) {
                    t0 = t2;
                } else {
                    t1 = t2;
                }
                t2 = (t1 - t0) * 0.5 + t0;
            }
            return t2; // Failure.
        }
        // Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
        cx = 3.0 * p1x;
        bx = 3.0 * (p2x - p1x) - cx;
        ax = 1.0 - cx - bx;
        cy = 3.0 * p1y;
        by = 3.0 * (p2y - p1y) - cy;
        ay = 1.0 - cy - by;
        // Convert from input time to parametric value in curve, then from that to output time.
        return solve(t, solveEpsilon(duration));
    };

    // css3 transition-timing-function
    $.switchable.TimingFn = {
        'ease': cubicBezier('.25, .1, .25, 1'),
        'linear': cubicBezier('0, 0, 1, 1'),
        'ease-in': cubicBezier('.42, 0, 1, 1'),
        'ease-out': cubicBezier('0, 0, .58, 1'),
        'ease-in-out': cubicBezier('.42, 0, .58, 1')/*,
        // jQuery Easing
        easeInQuad: cubicBezier('.55, .085, .68, .53'),
        easeOutQuad: cubicBezier('.25, .46, .45, .94'),
        easeInOutQuad: cubicBezier('.455, .03, .515, .955'),

        easeInCubic: cubicBezier('.55, .055, .675, .19'),
        easeOutCubic: cubicBezier('.215, .61, .355, 1'),
        easeInOutCubic: cubicBezier('.645, .045, .355, 1'),

        easeInQuart: cubicBezier('.895, .03, .685, .22'),
        easeOutQuart: cubicBezier('.165, .84, .44, 1'),
        easeInOutQuart: cubicBezier('.77, 0, .175, 1'),

        easeInQuint: cubicBezier('.755, .05, .855, .06'),
        easeOutQuint: cubicBezier('.23, 1, .32, 1'),
        easeInOutQuint: cubicBezier('.86, 0, .07, 1'),

        easeInSine: cubicBezier('.47, 0, .745, .715'),
        easeOutSine: cubicBezier('.39, .575, .565, 1'),
        easeInOutSine: cubicBezier('.445, .05, .55, .95'),

        easeInExpo: cubicBezier('.95, .05, .795, .035'),
        easeOutExpo: cubicBezier('.19, 1, .22, 1'),
        easeInOutExpo: cubicBezier('1, 0, 0, 1'),

        easeInCirc: cubicBezier('.6, .04, .98, .335'),
        easeOutCirc: cubicBezier('.075, .82, .165, 1'),
        easeInOutCirc: cubicBezier('.785, .135, .15, .86'),

        easeInElastic: null,
        easeOutElastic: null,
        easeInOutElastic: null,

        easeInBack: null,
        easeOutBack: null,
        easeInOutBack: null,

        easeInBounce: null,
        easeOutBounce: null,
        easeInOutBounce: null*/
    };

    $.switchable.Easing = function (param) {
        var name, len, i = 0, lookup;

        param = param.split(',');
        len = param.length;
        for (; i < len; i++) {
            param[i] = parseFloat(param[i]);
        }

        if (len !== 4) {
            window.console && console.warn(cubicBezier(param.join(', ')) + ' missing argument.');
        } else {
            name = 'cubic-bezier-' + param.join('-');

            if (!$.easing[name]) {
                lookup = makeLookup(function (p) {
                    return cubicBezierAtTime(p, param[0], param[1], param[2], param[3], 5.0);
                });

                $.easing[name] = function (p) {
                    return lookup.call(null, p);
                };
            }
        }

        return name;
    };
})(jQuery, window, document); 
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
/**
 * jQuery Switchable v1.0
 * Plugin: AutoPlay
 * By: baipan
 * 2014-01-16
 * autoplay.js
 * 自动播放插件
 */
(function ($, window, document, undefined) {
    if (!$.switchable) {
        return;
    }

    // 新增参数
    $.extend($.switchable.Config, {
        autoplay: false,

        // 切换间隔时间
        interval: 3000,

        // 鼠标悬停暂停切换
        pauseOnHover: true,

        // 是否逆序播放
        isBackward: false
    });


    /**
     * API:
     *
     * this.paused    =>    Boolean
     * this.play()    =>    Function
     * this.pause() =>    Function
     */
    $.switchable.Plugins.push({
        name: 'autoplay',

        init: function (host) {
            var cfg = host.config,
                pausing = false,
                timer1, timer2,
                to,
                run = function () {
                    to = host.willTo();
                    if (to === false) {
                        host._cancelTimers();
                        return;
                    }
                    if ((to === 0 && !cfg.isBackward) || (to === host.length - 1 && cfg.isBackward)) {
                        host._circle = true;
                    } else {
                        host._circle = false;
                    }
                    host.switchTo(to);
                },
                autoRun = function () {
                    var duration = cfg.duration || 0;
                    timer2 = setInterval(function () {
                        run();
                    }, (cfg.interval + duration));
                },
                setAfter = function (el, to) {
                    if (!cfg.loop && cfg.isBackward && host.index === 0) {
                        return;
                    }

                    if (!cfg.loop && !cfg.isBackward && host.index === host.length - 1) {
                        return;
                    }

                    var num = 1;
                    if (cfg.isBackward) {
                        num = -1;
                    }
                    host._nextIndex = (to + num + host.length) % host.length;
                    host._circle = false;
                };

            if (!cfg.autoplay || host.length <= 1) {
                return;
            }

            // 初始化下一面板
            setAfter(undefined, host.index);

            // 悬停暂停
            if (cfg.pauseOnHover) {
                host.panels.on('mouseenter.switchAutoplay', function () {
                    host._pause();
                }).on('mouseleave.switchAutoplay', function () {
                    if (!pausing) {
                        host._play();
                    }
                });
            }

            // 监听改变，设置下一面板
            $(host).on('switch', setAfter);

            // 增加api
            $.extend(host, {
                /**
                 * 启动
                 */
                _play: function () {
                    host._cancelTimers();

                    // 让外部知道当前的状态
                    host.paused = false;

                    // 让首次(或者暂停后恢复)切换和后续的自动切换的间隔时间保持一致
                    timer1 = setTimeout(function () {
                        run();
                        autoRun();
                    }, cfg.interval);
                },

                /**
                 * 暂停
                 */
                _pause: function () {
                    host._cancelTimers();

                    host.paused = true;
                },

                /**
                 * 取消切换定时器
                 */
                _cancelTimers: function () {
                    if (timer1) {
                        clearTimeout(timer1);
                        timer1 = undefined;
                    }

                    if (timer2) {
                        clearInterval(timer2);
                        timer2 = undefined;
                    }
                },

                /**
                 * 对外api, 使外部可以在暂停后恢复切换
                 */
                play: function () {
                    host._play();
                    pausing = false;
                    return host;
                },

                /**
                 * 对外api, 使外部可以停止自动切换
                 */
                pause: function () {
                    host._pause();
                    pausing = true;
                    return host;
                }

            });

            // start autoplay
            host._play();

        },
        destroy: function (host) {
            if (!host.config.autoplay || host.length <= 1) {
                return;
            }
            host._pause();
            host.panels.off(".switchAutoplay");
        }
    });
})(jQuery, window, document); 
/**
 * jQuery Switchable v1.0
 * Plugin: Trigger
 * By: baipan
 * 2014-01-16
 * trigger.js
 * 切换器
 */
(function ($, window, document, undefined) {
    if (!$.switchable) {
        return;
    }

    // 新增参数
    $.extend($.switchable.Config, {
        // 选择器
        triggers: '.trigger a',

        // 当前 trigger 的 className
        currentTrigger: 'active',

        // 触发类型
        triggerType: 'hover', // or 'click'

        // 触发延迟
        delay: 100 // 100ms
    });


    /**
     * API:
     *
     * this.trigger    =>    jQuery
     */
    $.switchable.Plugins.push({
        name: 'trigger',

        init: function (host) {
            var cfg = host.config,
                $root = $(host.root),
                index,
                pausing,
                triggerLength = $root.find(cfg.triggers).length;

            if (!triggerLength) {
                return;
            }

            while (triggerLength < host.length) {
                $root.find(cfg.triggers).slice(0, 1).clone().insertAfter($root.find(cfg.triggers).last());
                triggerLength = $root.find(cfg.triggers).length;
            }

            host.triggers = $root.find(cfg.triggers).slice(0, host.length);

            // 为激活项对应的 trigger 添加 currentTrigger
            host.triggers.removeClass(cfg.currentTrigger).eq(host.index).addClass(cfg.currentTrigger);

            // bind event
            host.triggers.on("click.switchTrigger", function (e) {
                e.preventDefault();
                index = $(this).index();

                host._cancelDelayTimer();
                host.switchTo(index);
            });

            if (cfg.triggerType === 'hover') {
                host.triggers.on('mouseenter.switchTrigger', function () {
                    index = $(this).index();

                    host._delayTimer = setTimeout(function () {
                        host.switchTo(index);
                    }, cfg.delay);

                }).on('mouseleave.switchTrigger', function () {
                    host._cancelDelayTimer();
                });
            }

            // 切换触发器
            $(host).on('switch', function (el, index) {
                host._switchTrigger(index);
            });

            // 自动播放暂停
            if (cfg.autoplay && cfg.pauseOnHover) {
                host.triggers.on('mouseenter.switchTrigger', function () {
                    pausing = host.paused;
                    host._pause();
                }).on('mouseleave.switchTrigger', function () {
                    if (!pausing) {
                        host._play();
                    }
                });
            }

            // 增加api
            $.extend(host, {
                /**
                 * cancel delay timer
                 */
                _cancelDelayTimer: function () {
                    if (host._delayTimer) {
                        clearTimeout(host._delayTimer);
                        host._delayTimer = undefined;
                    }
                },

                /**
                 * switch a trigger
                 */
                _switchTrigger: function (to) {
                    host.triggers.removeClass(cfg.currentTrigger).eq(to).addClass(cfg.currentTrigger);
                }
            });
        },
        destroy: function (host) {
            if ($(host.root).find(host.config.triggers).length) {
                host.triggers.off("click.switchTrigger");
                host.triggers.off(".switchTrigger");
            }
        }
    });
})(jQuery, window, document); 
/**
 * jQuery Switchable v1.0
 * Plugin: Carousel
 * By: baipan
 * 2014-01-16
 * carousel.js
 * 翻页按钮
 */
(function ($, window, document, undefined) {
    if (!$.switchable) {
        return;
    }

    // 新增参数
    $.extend($.switchable.Config, {
        // 选择器
        prev: '.prev',
        next: '.next',
        disabledClass: 'disabled',
        respondinAnimating: true
    });


    /**
     * API:
     *
     * this.prevBtn    =>    jQuery
     * this.nextBtn    =>    jQuery
     */
    $.switchable.Plugins.push({
        name: 'carousel',

        init: function (host) {
            var cfg = host.config,
                prefix = ['prev', 'next'],
                _prefix,
                _cfg,
                i = 0,
                to,
                pausing,
                setNext = function (index, isPrev) {
                    if (!cfg.loop && isPrev && index === 0) {
                        return;
                    }

                    if (!cfg.loop && !isPrev && index === host.length - 1) {
                        return;
                    }

                    var num = 1;
                    if (isPrev) {
                        num = -1;
                    }
                    host._nextIndex = (index + num + host.length) % host.length;
                };

            if (!$(host.root).find(cfg.prev).length && !$(host.root).find(cfg.next).length) {
                return;
            }

            for (; i < 2; i++) {
                _prefix = prefix[i];
                _cfg = $(host.root).find(cfg[_prefix]);
                if (!_cfg.length) {
                    continue;
                }
                host[_prefix + 'Btn'] = _cfg;
            }

            $(host.root).find(cfg.prev).on('click.switchCarousel', function (e) {
                e.preventDefault();
                if (!$(this).hasClass(cfg.disabledClass)) {
                    if (host._anim) {
                        if (cfg.respondinAnimating) {
                            host._anim.stop(true);
                        } else {
                            return;
                        }
                    }
                    setNext(host.index, true);
                    to = host.willTo();
                    if (to === host.length - 1) {
                        host._circle = true;
                    } else {
                        host._circle = false;
                    }
                    host.switchTo(to);
                }
            });

            $(host.root).find(cfg.next).on('click.switchCarousel', function (e) {
                e.preventDefault();
                if (!$(this).hasClass(cfg.disabledClass)) {
                    if (host._anim) {
                        if (cfg.respondinAnimating) {
                            host._anim.stop(true);
                        } else {
                            return;
                        }
                    }
                    setNext(host.index, false);
                    to = host.willTo();
                    if (to === 0) {
                        host._circle = true;
                    } else {
                        host._circle = false;
                    }
                    host.switchTo(to);
                }
            });

            if (cfg.autoplay && cfg.pauseOnHover) {
                $(host.root).find(cfg.prev + ', ' + cfg.next).on('mouseenter.switchCarousel', function () {
                    pausing = host.paused;
                    host._pause();
                }).on('mouseleave.switchCarousel', function () {
                    if (!pausing) {
                        host._play();
                    }
                });
            }

            $(host).on('switch', function () {

                if (host.nextBtn) {
                    host.nextBtn.removeClass(cfg.disabledClass);
                    if (!cfg.loop && host.index === (host.length - 1)) {
                        host.nextBtn.addClass(cfg.disabledClass);
                    }
                }

                if (host.prevBtn) {
                    host.prevBtn.removeClass(cfg.disabledClass);
                    if (!cfg.loop && host.index === 0) {
                        host.prevBtn.addClass(cfg.disabledClass);
                    }
                }

                host._circle = false;
            });
        },
        destroy: function (host) {
            if ($(host.root).find(host.config.prev).length) {
                $(host.root).find(host.config.prev).off('.switchCarousel');
            }
            if ($(host.root).find(host.config.next).length) {
                $(host.root).find(host.config.next).off('.switchCarousel');
            }
        }
    });
})(jQuery, window, document); 
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
                    var lazyDom = $.trim($el.val());
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
