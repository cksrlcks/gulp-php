var gulp = require("gulp");
var concat = require("gulp-concat");
var order = require("gulp-order");
//js
var babel = require("gulp-babel");
var uglify = require("gulp-uglify");
//css
var sass = require("gulp-sass");
var minificss = require("gulp-minify-css");
var autoprefixer = require("gulp-autoprefixer");
//img
var imagemin = require("gulp-imagemin");
var changed = require("gulp-changed");
var del = require("del");
//php live server
var phpConnect = require("gulp-connect-php");
var browsersync = require("browser-sync");
//path
var devsrc = "dev_share";
var pubsrc = "share";
var paths = {
  dev: {
    js: devsrc + "/js/*.js",
    vendor_js: devsrc + "/js/vendor/*.js",
    scss: devsrc + "/css/**/*.scss",
    img: devsrc + "/img/*+(png|jpg|gif)",
  },
  pub: {
    js: pubsrc + "/js",
    css: pubsrc + "/css",
    img: pubsrc + "/img",
  },
};

function gulp_js() {
  return gulp
    .src(paths.dev.js, { sourcemaps: true })
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat("scripts.js"))
    .pipe(gulp.dest(paths.pub.js))
    .pipe(browsersync.reload({ stream: true }));
}

function gulp_vendor_js() {
  return gulp
    .src(paths.dev.vendor_js)
    .pipe(gulp.dest(paths.pub.js + "/vendor"))
    .pipe(browsersync.reload({ stream: true }));
}

function gulp_scss() {
  return gulp
    .src(paths.dev.scss, { sourcemaps: true })
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(
      order(["lib/*.scss", "fonts.scss", "reset.scss", "layout.scss", "*.scss"]) //우선순위 적용
    )
    .pipe(sass().on("error", sass.logError))
    .pipe(minificss())
    .pipe(concat("style.css"))
    .pipe(gulp.dest(paths.pub.css))
    .pipe(browsersync.reload({ stream: true }));
}
function imgmin() {
  return gulp
    .src(paths.dev.img)
    .pipe(changed(paths.pub.img))
    .pipe(imagemin([imagemin.optipng({ optimizationLevel: 5 })]))
    .pipe(gulp.dest(paths.pub.img))
    .pipe(browsersync.reload({ stream: true }));
}

function gulp_watch() {
  gulp.watch(paths.dev.js, gulp_js);
  gulp.watch(paths.dev.vendor_js, gulp_vendor_js);
  gulp.watch(paths.dev.scss, gulp_scss);
  gulp.watch(paths.dev.img, imgmin);
  gulp.watch("./**/**/*.php", browserSyncReload);
}

function connectsync() {
  phpConnect.server(
    {
      port: 8000,
      keepalive: true,
      base: ".",
    },
    function () {
      browsersync({
        proxy: "127.0.0.1:8000",
      });
    }
  );
}

function browserSyncReload(done) {
  browsersync.reload();
  done();
}

function clean() {
  return del(["./share/css", "./share/img", "./share/js"]);
}

gulp.task(
  "default",
  gulp.series(
    clean,
    gulp.parallel(
      gulp.series(gulp_js, gulp_vendor_js, gulp_scss, imgmin),
      gulp_watch,
      connectsync
    )
  )
);
