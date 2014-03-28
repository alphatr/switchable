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