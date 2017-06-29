let gulp = require('gulp');
let ts = require('gulp-typescript');
let tsProject = ts.createProject('tsconfig.json');


gulp.task('transpile', function() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
  gulp.watch('ts/**/*.ts', ['transpile']);
});

gulp.task('default', ['transpile']);
