let gulp = require( 'gulp' ),
  concat = require( 'gulp-concat' ),
  rename = require( 'gulp-rename' ),
  stripdebug = require( 'gulp-strip-debug' ),
  uglify = require( 'gulp-uglify' ),
  notify = require( 'gulp-notify' )

let notifyLogOnly = notify.withReporter( ( options, callback ) => {
  console.log( 'Message:', options.message )
  callback()
} )

notifyLogOnly.logLevel( 1 )

gulp.task( 'buildES5', [ 'buildCore', 'buildEasing' ], function() {
  console.log( 'Message: all build done!' )
} )

gulp.task( 'buildCore', function() {
  return gulp
    .src( [
      './src/polyfills.js',
      './src/core.js'
    ] )
    .pipe( concat( 'potatoswiper.js' ) )
    .pipe( gulp.dest( './dist' ) )
    .pipe( notifyLogOnly( { message: 'core build done!' } ) )
    .pipe( rename( 'potatoswiper.min.js' ) )
    .pipe( stripdebug() )
    .pipe( uglify() )
    .pipe( gulp.dest( './dist' ) )
    .pipe( notifyLogOnly( { message: 'core min build done!' } ) )
} )

gulp.task( 'buildEasing', function() {
  return gulp
    .src( [
      './src/easing.js'
    ] )
    .pipe( rename( 'potatoswiper-easing.js' ) )
    .pipe( gulp.dest( './dist' ) )
    .pipe( notifyLogOnly( { message: 'easing build done!' } ) )
    .pipe( rename( 'potatoswiper-easing.min.js' ) )
    .pipe( stripdebug() )
    .pipe( uglify() )
    .pipe( gulp.dest( './dist' ) )
    .pipe( notifyLogOnly( { message: 'easing min build done!' } ) )
} )

gulp.task( 'watch', [ 'buildES5' ], function() {
  gulp.watch( [ './src/*' ], [ 'buildES5' ] )
} )

// default tasks
gulp.task( 'default', [ 'buildES5' ] )

