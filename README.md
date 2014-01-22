## Switchable

switchable 是提供了 Tabs, Slide, Carousel 等功能的一个 jQuery 切换组件。

### 基础使用

#### HTML 结构
```html
<div class="j-switchable" data-switch='json'><!-- Root 节点 加上 "switchable" Class 后就会自动初始化-->
    <div><!-- overflow: hidden 节点-->
        <ul class="items"><!-- 加上 "items" Class, 则子节点为面板列表 -->
            <li>
                <img src="img1.jpg">
            </li>
            <li>
                <img src="img2.jpg">
            </li>
            <li>
                <img src="img3.jpg">
            </li>
        </ul>
    </div>

    <!-- 上下翻页节点 带上相应 Class（不是必须的） -->
    <a href="###" class="prev disabled">&lt;</a><!-- 当不可用时候 JS 会加上 "disabled" 的 Class-->
    <a href="###" class="next">&gt;</a>

    <!-- trigger Class（不是必须的） -->
    <p class="slide-pagination">
        <a href="#1" class="active">1</a><!-- 当前面板 JS 会加上 "active" 的 Class-->
        <a href="#2" class="">2</a>
        <a href="#3" class="">3</a>
    </p>

    <!-- 指示数字节点（不是必须的） -->
    <div class="slide-text">1/3</div>
</div>
```

#### CSS 样式
```css
.switchable > div { /* 容器 */
    width: 248px;
    height: 116px;
    position: relative;
    overflow: hidden;
}
.switchable .items { /* 面板父类 */
    margin: 0;
}
.switchable .items li {
    float: left; /* 如果是上下切换或者 fade 效果，则不需要 */
}
```

### 初始化配置

可以在 Root dom 节点配置 data-switch 为下面配置的值。

```
/**
 * 核心配置
 */
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

/**
 * 动画配置
 */
// 动画时长
duration: 500,

// 时间因子
easing: "ease"

/**
 * 动画效果：滑动（Scroll）
 */
// 水平滑动（false 为竖直滑动）
horiz: true

/**
 * 自动切换
 */
// 打开自动切换
autoplay: true,

// 切换间隔时间
interval: 3000,

// 鼠标悬停暂停切换
pauseOnHover: true,

// 是否逆序播放
isBackward: false

/**
 * 触发器配置
 */
// 选择器
triggers: '.trigger a',

// 当前 trigger 的 className
currentTrigger: 'active',

// 触发类型
triggerType: 'hover', // or 'click'

// 触发延迟
delay: 000, // 100ms


/**
 * 翻页配置
 */
prev: '.prev', // 翻页选择器
next: '.next',
disabledClass: 'disabled' // 翻页不可用时的 className

/**
 * 显示计数器配置
 */
// index偏移量
indexOffset: 1,

// 返回的格式
numFormat: '[index]/[length]',

// 选择器
switchNum: '.switch-num'

/**
 * lazyload 加载
 */
// DOM lazyload Class
lazyloadCls: 'switchlazyload'
```

### 在 JS 中初始化并传入初始化参数

在 Root 节点不传入 "j-switchable" ClassName，然后使用 JS 进行初始化

```javascript
api = $(element).switchable({"loop":true,"autoplay":true});
```

### 使用 api 进行其他控制

使用 JS 初始化后将返回 api，自动初始化后可以通过取 DOM 上面的 switchable 对象得到 api

```javascript
api = $('.switchable')[0].switchable;
```

#### switchable 提供了以下 API:
```
/**
 * 核心 API
 */
// root 节点 jQuery 对象
api.root

// 面板列表 jQuery 对象
api.panels

// 面板数量
api.length

// 当前位置（从0开始）
api.index

// 切换面板
api.switchTo(integer index); // 返回 API 本身

// 即将切换的下一面板
api.willTo(); // 有时候返回值会不准确（通过 trigger 切换的，无法预知，不影响在 beforeSwitch 中调用）

// 事件
beforeSwitch // 执行切换前调用

switch // 切换事件后调用

/**
 * 自动切换
 */
// 自动切换状态
api.paused

// 自动切换-播放
api.play()

// 自动切换-暂停
api.pause()

/**
 * 触发器配置
 */
// 触发器 jQuery 对象
api.triggers

/**
 * 翻页配置
 */
// 翻页按钮 jQuery 对象
api.prevBtn
api.nextBtn
```

### 事件绑定：

直接在 api 上面绑定 "switch/beforeSwitch" 事件即可
```
$(api).on("switch", function(e){
    console.log(e);
})
```