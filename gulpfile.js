var gulp     = require("gulp");

var sass     = require("gulp-sass");
var jade     = require("gulp-jade");
var prefix   = require("gulp-autoprefixer");
var header   = require("gulp-header");
var server   = require("gulp-webserver");
var plumber  = require("gulp-plumber");
var jshint   = require("gulp-jshint")
var concat   = require("gulp-concat");
var rename   = require("gulp-rename");
var util     = require("gulp-util");

var del        = require("del");
var sequence   = require("run-sequence");
var stringify  = require("stringify");
var browserify = require("browserify");
var source     = require("vinyl-source-stream");


var targets = {
  sass: [
    "./styles/*.scss",
    "./styles/**/*.scss",
    "./styles/**/_*.scss"
  ],

  jade: [
    "./jade/*.jade",
    "./jade/**/*.jade",
    "./jade/**/_*.jade"
  ],

  js: [
    "./js/*.js",
    "./js/**/*.js"
  ],

  venders: {
    css: [
      "./vender/css/normalize.css",
      "./node_modules/flat-ui/bootstrap/css/bootstrap.css",
      "./node_modules/flat-ui/css/flat-ui.css",
      "./node_modules/nanoscroller/bin/css/nanoscroller.css"
    ],

    js: [
      "./rocket.io/rocketio.js",
      "./node_modules/jquery/dist/jquery.js",
      "./node_modules/bootstrap/dist/js/bootstrap.js",
      "./node_modules/vue/dist/vue.js",
      "./node_modules/vue-resource/dist/vue-resource.js",
      "./node_modules/vue-router/dist/vue-router.js",
      "./node_modules/nanoscroller/bin/javascripts/jquery.nanoscroller.js",
      "./node_modules/bucks/bucks.js"
    ],

    icons: [
      "./node_modules/flat-ui/images/icons/png/*.png"
    ],

    fonts: [
      "./node_modules/flat-ui/fonts/**/*",
    ]
  },

  assets: "./assets/*.png"
};

var dists = {
  app:  "app.js",
  venders: {
    js: "venders.js",
    css: "venders.css"
  },

  dest: "./dist/",
  assets: "./dist/assets/",
  fonts: "./dist/fonts/",
}

gulp.watch(targets.sass, ["sass"]);
gulp.watch(targets.jade, ["html"]);
gulp.watch(targets.js, ["js"]);
gulp.watch(targets.assets, ["copy-assets"]);

gulp.task("default", function() {
  gulp.src(dists.dest)
    .pipe(plumber())
    .pipe(server({
      root: dists.dest,
      port: process.env.PORT || 8000,
      livereload: process.env.NODE_ENV == "production" ? false : true,
      open: true
     }));
  sequence("sass", "jade", "js", "venders-concat-js",
           "venders-concat-css", "copy-assets",
           "copy-vendor-icons", "copy-vender-fonts");
});

gulp.task("sass", function() {
  console.log("[TASK] sass processing...");
  return gulp.src(targets.sass)
    .pipe(plumber())
    .pipe(sass())
    .pipe(header('@charset "utf-8";\n'))
    .pipe(gulp.dest(dists.dest))
});

gulp.task("html", function() {
  sequence("jade", "js");
});

gulp.task("jade", function() {
  console.log("[TASK] jade processing...");
  return gulp.src(targets.jade)
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(dists.dest));
});

gulp.task("js", function() {
  sequence("copy-js", "browserify", "jshint");
});

gulp.task("copy-js", function() {
  console.log("[TASK] concat-js processing...");
  return gulp.src(targets.js)
    .pipe(plumber())
    .pipe(gulp.dest(dists.dest));
});

gulp.task("browserify", function() {
  console.log("[TASK] browserify processing...");
  return browserify({
      entries: [dists.dest + dists.app]
    })
    .transform(stringify(['.html']))
    .bundle()
    .on('error', function(err) {
      msg = err.toString()
      util.log(util.colors.red("(Browserify)"), msg);
      this.emit("end");
    })
    .pipe(source(dists.app))
    .pipe(gulp.dest(dists.dest));
});

gulp.task("jshint", function() {
  console.log("[TASK] jshint processing...");
  return gulp.src(targets.js)
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish"));
});

gulp.task("venders-concat-js", function() {
  console.log("[TASK] venders-concat-js processing...");
  return gulp.src(targets.venders.js)
    .pipe(plumber())
    .pipe(concat(dists.venders.js))
    .pipe(gulp.dest(dists.dest));
});

gulp.task("venders-concat-css", function() {
  console.log("[TASK] venders-concat-css processing...");
  return gulp.src(targets.venders.css)
    .pipe(plumber())
    .pipe(concat(dists.venders.css))
    .pipe(gulp.dest(dists.dest));
});

gulp.task("copy-vendor-icons", function() {
  console.log("[TASK] copy-icons processing...");
  return gulp.src(targets.venders.icons)
    .pipe(plumber())
    .pipe(gulp.dest(dists.assets));
});

gulp.task("copy-vender-fonts", function() {
  console.log("[TASK] copy-vender-fonts processing...");
  return gulp.src(targets.venders.fonts)
    .pipe(plumber())
    .pipe(gulp.dest(dists.fonts));
});

gulp.task("copy-assets", function() {
  console.log("[TASK] copy-assets processing...");
  return gulp.src(targets.assets)
    .pipe(plumber())
    .pipe(rename({ prefix: "face-" }))
    .pipe(gulp.dest(dists.assets));
});

gulp.task("clean", function() {
  del([dists.dest + "*.*", dists.dest + "/**/*"]);
});

