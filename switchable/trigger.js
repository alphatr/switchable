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
        delay: 000, // 100ms
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
                pausing;

            if (!$root.find(cfg.triggers).length) {
                return;
            }

            host.triggers = $root.find(cfg.triggers).slice(0, host.length);
            
            // 为激活项对应的 trigger 添加 currentTrigger
            host.triggers.eq(host.index).addClass(cfg.currentTrigger);

            // bind event
            host.triggers.on("click", function (e) {
                e.preventDefault();
                index = $(this).index();

                // 避免重复触发
                if (!host._triggerIsValid(index)) {
                    return;
                }

                host._cancelDelayTimer();
                host.switchTo(index);
            });

            if (cfg.triggerType === 'hover') {
                host.triggers.hover(function () {
                    index = $(this).index();

                    // 避免重复触发
                    if (!host._triggerIsValid(index)) {
                        return;
                    }

                    host._delayTimer = setTimeout(function () {
                        host.switchTo(index);
                    }, cfg.delay);

                }, function () {
                    host._cancelDelayTimer();
                });
            }

            // 切换触发器
            $(host).on('switch', function (el, index) {
                host._switchTrigger(index);
            });

            // 自动播放暂停
            if (cfg.autoplay && cfg.pauseOnHover) {
                host.triggers.hover(function () {
                    pausing = host.paused;
                    host._pause();
                }, function () {
                    if (!pausing) {
                        host._play();
                    }
                });
            }

            // 增加api
            $.extend(host, {
                /**
                 * is repeat?
                 */
                _triggerIsValid: function (to) {
                    return host.index !== to;
                },

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
        }
    });
})(jQuery, window, document);