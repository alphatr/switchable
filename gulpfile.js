var gulp = require('gulp'),
    concat = require('gulp-concat');

var jsList = [
    "src/core.js",
    "src/animate.js",
    "src/easing.js",
    "src/effects.fade.js",
    "src/effects.scroll.js",
    "src/autoplay.js",
    "src/trigger.js",
    "src/carousel.js",
    "src/switchnum.js",
    "src/lazyload.js",
    "src/autoinit.js",
];

/* JS 合并 */
gulp.task('concat', function () {
    return gulp.src(jsList, {base: 'src'})
        .pipe(concat('switchable.js'))
        .pipe(gulp.dest('build'));
});
