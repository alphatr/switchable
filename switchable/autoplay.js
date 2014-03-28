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