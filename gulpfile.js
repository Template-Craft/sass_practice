"use strict";

// Импортируем плагины
import gulp from "gulp";

import browserSync, { watch } from "browser-sync";
import dartSass from "sass";
import gulpSass from "gulp-sass";

import cssAutoprefixer from "gulp-autoprefixer";
import gcmq from "gulp-group-css-media-queries";

import { deleteAsync } from "del";

import notify from "gulp-notify";
import plumber from "gulp-plumber";

const sass = gulpSass(dartSass);

// Храним пути в массиве
const paths = {
  views: {
    src: "./src/index.html",
    build: "./build/",
    watch: "./src/index.html",
  },
  styles: {
    src: "./src/main.scss",
    build: "./build/",
    watch: "./src/main.scss",
  },
  baseDir: "./build/",
};

// Задания для gulp

// -> Обрабатываем html
gulp.task("html", () => {
  return gulp
    .src(paths.views.src)
    .pipe(
      plumber({
        errorHandler: notify.onError(function (err) {
          return {
            title: "HTML",
            sound: false,
            message: err.message,
          };
        }),
      })
    )
    .pipe(gulp.dest(paths.views.build))
    .pipe(browserSync.reload({ stream: true }));
});

// -> Обрабатываем scss
gulp.task("styles", () => {
  return gulp
    .src(paths.styles.src)
    .pipe(
      plumber({
        errorHandler: notify.onError(function (err) {
          return {
            title: "STYLES",
            sound: false,
            message: err.message,
          };
        }),
      })
    )
    .pipe(sass.sync().on("error", sass.logError))
    .pipe(
      cssAutoprefixer({
        overrideBrowserslist: ["last 6 versions"],
      })
    )
    .pipe(gcmq())
    .pipe(gulp.dest(paths.styles.build))
    .pipe(browserSync.stream());
});

// Следим за изменениями файлов
gulp.task("watcher", () => {
  watch(paths.views.watch, gulp.parallel("html"));
  watch(paths.styles.watch, gulp.parallel("styles"));
});

// Удаление директории build/
gulp.task("clean:build", function () {
  return deleteAsync(paths.baseDir);
});

// локальный сервер
gulp.task("localServer", () => {
  browserSync.init({
    server: {
      baseDir: paths.baseDir,
    },
    notify: false,
  });
});

// Запуск по команде gulp
gulp.task(
  "default",
  gulp.series(
    gulp.parallel("clean:build"),
    gulp.parallel("html", "styles"),
    gulp.parallel("localServer", "watcher")
  )
);
