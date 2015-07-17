var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('dist', function() {
	gulp.src(['index.js'])
		//.pipe(uglify())
		.pipe(gulp.dest('dist'));

    gulp.src('lib/*.js')
        //.pipe(uglify())
        .pipe(gulp.dest('dist/lib'));

	gulp.src(['package.json', 'create_account.js'])
		.pipe(gulp.dest('dist'));
});

gulp.task('default',['dist']);
