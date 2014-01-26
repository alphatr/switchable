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


        /**
         * 事件初始化绑定
         */
        if ($.isFunction(cfg.onBeforeSwitch)) {
            $self.on(_onBeforeSwitch, cfg.onBeforeSwitch);
        }
        if ($.isFunction(cfg.onSwitch)) {
            $self.on(_onSwitch, cfg.onSwitch);
        }

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
            }
        });

        // 初始化并安装插件
        self._init();
        self._initPlugins();
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