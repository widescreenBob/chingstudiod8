'use strict';

//=======================================================
// Include gulp
//=======================================================
var gulp = require('gulp');

//=======================================================
// Include Our Plugins
//=======================================================
var sass       = require('gulp-sass');
var prefix     = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var sync       = require('browser-sync');
var reload     = sync.reload;
var filter     = require('gulp-filter');
var shell      = require('gulp-shell');
var imagemin   = require('gulp-imagemin');
var pngquant   = require('imagemin-pngquant');
var q          = require('q');
var path       = require('path');
var fs         = require('fs');
var Grunticon  = require( 'grunticon-lib' );

//=======================================================
// Functions
//=======================================================
function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

//=======================================================
// Compile Our Sass
//=======================================================

gulp.task('sass', function() {
  gulp.src('./sass/{,**/}*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'nested'
    }))
    .on('error', handleError)
    .pipe(prefix({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('css'))
    .pipe(filter('*.css'))
    .pipe(sync.reload({
      stream: true
    }));
});

//=======================================================
// Watch and recompile sass.
//=======================================================

gulp.task('watch', function() {

  // BrowserSync proxy setup
  //sync({
      //proxy: 'http://enterLocalUrlHere'
  //});

  // Watch all my sass files and compile sass if a file changes.
  gulp.watch('sass/{,**/}*.scss', ['sass']);

});

//=======================================================
// Generate all styleguides
//=======================================================
gulp.task('styleguide', function() {
  return gulp.src('styleguide/templates/*/index.html')
  .pipe(shell([
    // This basically runs the bellow command on the command line:
    // kss-node [source files to parse] [destination folder] --template [location of template files] --css [location of css to include]
    'kss-node --source <%= source %> --destination <%= destination(file.path) %> --template <%= template(file.path) %> --helpers <%= helpers %>'
  ], {
    templateData: {
      source: 'sass',
      helpers: 'styleguide/helpers',
      template: function (s) {
        return s.replace('/index.html', '')
      },
      destination: function (s) {
        return s.replace('/styleguide/templates/', '/styleguide/dist/').replace('/index.html', '')
      }
    }
  }))
});

//=======================================================
// Grunticon
//=======================================================

gulp.task('icons', function () {
  var deferred = q.defer(),
      //path to icon folder
      iconDir = 'assets/src/icons',
      options = { enhanceSVG: true };

  var files = fs.readdirSync(iconDir).map(function (fileName) {
    return path.join(iconDir, fileName);
  });

  var grunticon = new Grunticon(files, 'assets/dist/icons', options);

  grunticon.process(function () {
    deferred.resolve();
  });

  return deferred.promise;
});

//=======================================================
// Compress assets (images, pngs, svgs).
//=======================================================

gulp.task('compress', function () {
  return gulp.src([
      'assets/src/icons/*',
      'assets/src/images/*'
    ], { base: 'assets/src/' })
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('assets/dist'));
});

//=======================================================
// Default Task
//=======================================================

gulp.task('default', ['sass', 'compress', 'icons']);
