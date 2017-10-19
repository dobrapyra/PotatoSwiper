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

gulp.task( 'buildES5', function() {
  return gulp
    .src( [
      './src/polyfills.js',
      './src/core.js'
    ] )
    .pipe( concat( 'potatoslider.js' ) )
    .pipe( gulp.dest( './dist' ) )
    .pipe( notifyLogOnly( { message: 'ES5 build done!' } ) )
    .pipe( rename( 'potatoslider.min.js' ) )
    .pipe( stripdebug() )
    .pipe( uglify() )
    .pipe( gulp.dest( './dist' ) )
    .pipe( notifyLogOnly( { message: 'ES5 min build done!' } ) )
    .pipe( notify( { message: 'ES5 all build done!' } ) )
} )

gulp.task( 'watch', [ 'buildES5' ], function() {
  gulp.watch( [ './src/*' ], [ 'buildES5' ] )
} )

// default tasks
gulp.task( 'default', [ 'buildES5' ] )

