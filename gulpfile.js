var gulp = require("gulp");
var concat = require("gulp-concat");
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
var pubsrc = "share/dist";
var paths = {
  dev: {
    js: devsrc + "/js/*.js",
    css: devsrc + "/css/*.scss",
    scss: devsrc + "/css/scss/*.scss",
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
    .src(paths.dev.js)
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat("scripts.js"))
    .pipe(gulp.dest(paths.pub.js))
    .pipe(browsersync.reload({ stream: true }));
}

function gulp_css() {
  return gulp
    .src(paths.dev.css)
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(sass().on("error", sass.logError))
    .pipe(minificss())
    .pipe(gulp.dest(paths.pub.css))
    .pipe(browsersync.reload({ stream: true }));
}
function imgmin() {
  return gulp
    .src(paths.dev.img)
    .pipe(changed(paths.pub.img))
    .pipe(imagemin([imagemin.optipng({ optimizationLevel: 6 })]))
    .pipe(gulp.dest(paths.pub.img))
    .pipe(browsersync.reload({ stream: true }));
}

function gulp_watch() {
  gulp.watch(paths.dev.js, gulp_js);
  gulp.watch(paths.dev.css, gulp_css);
  gulp.watch(paths.dev.scss, gulp_css);
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
      gulp.series(gulp_js, gulp_css, imgmin),
      gulp_watch,
      connectsync
    )
  )
);
