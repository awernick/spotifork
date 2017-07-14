let gulp = require('gulp');
let ts = require('gulp-typescript');
let tsConfig = require('./tsconfig.json');
let tsProject = ts.createProject('tsconfig.json');


gulp.task('transpile', function() {
    return gulp.src(tsConfig.include)
        .pipe(ts(tsConfig.compilerOptions))
        .js.pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
  gulp.watch('ts/**/*.ts', ['transpile']);
});

gulp.task('default', ['transpile']);
