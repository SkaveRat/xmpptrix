var gulp = require('gulp');
var traceur = require('gulp-traceur');

gulp.task('dist', function() {
	gulp.src(['*.js'])
		//.pipe(traceur())
		.pipe(gulp.dest('dist'));

    gulp.src('lib/*.js')
        //.pipe(traceur())
        .pipe(gulp.dest('dist/lib'));

	gulp.src(['package.json', 'create_account.js', 'setup.js'])
		.pipe(gulp.dest('dist'));
});

gulp.task('default',['dist']);
