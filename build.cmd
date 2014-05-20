@echo off
::以unicode作为默认页字符集
chcp 65001

type src\core.js > switchable.js
echo. >> switchable.js

type src\animate.js >> switchable.js
echo. >> switchable.js

type src\easing.js >> switchable.js
echo. >> switchable.js

type src\effects.fade.js >> switchable.js
echo. >> switchable.js

type src\effects.scroll.js >> switchable.js
echo. >> switchable.js

type src\autoplay.js >> switchable.js
echo. >> switchable.js

type src\trigger.js >> switchable.js
echo. >> switchable.js

type src\carousel.js >> switchable.js
echo. >> switchable.js

type src\switchnum.js >> switchable.js
echo. >> switchable.js

type src\lazyload.js >> switchable.js
echo. >> switchable.js

type src\autoinit.js >> switchable.js
echo. >> switchable.js