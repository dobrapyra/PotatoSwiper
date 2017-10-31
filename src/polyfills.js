( function() {

  if( !Object.keys ) {
    Object.keys = function( obj ) {
      // if( obj !== Object( obj ) ) throw new TypeError( 'Object.keys called on a non-object' )
  
      var keysArr = [], key
  
      for( key in obj ) {
        if( obj.hasOwnProperty( key ) ) keysArr.push( key )
      }
  
      return keysArr
    }
  }
  
  if( !Object.assign ) {
    Object.assign = function( obj ) {
      // if( obj !== Object( obj ) ) throw new TypeError( 'Object.keys called on a non-object' )
  
      var resultObj = Object( obj ), tmpSource, keysArr, i, l, j, k, tmpKey
  
      for( i = 1, l = arguments.length; i < l; i++ ) {
        tmpSource = arguments[ i ]
  
        if( !tmpSource ) continue
  
        keysArr = Object.keys( tmpSource )
  
        for( j = 0, k = keysArr.length; j < k; j++ ) {
          tmpKey = keysArr[ j ]
  
          resultObj[ tmpKey ] = tmpSource[ tmpKey ]
        }
      }
  
      return resultObj
    }
  }
  
  if( !Function.prototype.bind ) {
    Function.prototype.bind = function( ctx ) {
      var fn = this, args = Array.prototype.slice.call( arguments, 1 )
  
      return function() {
        fn.apply( ctx, args )
      }
    }
  }
  
  if( !Element.prototype.matches ) {
    var elPrototype = Element.prototype
    elPrototype.matches = ( function() {
      return elPrototype.matches ||
        elPrototype.matchesSelector ||
        elPrototype.webkitMatchesSelector ||
        elPrototype.mozMatchesSelector ||
        elPrototype.oMatchesSelector ||
        elPrototype.msMatchesSelector ||
        function( selector ) {
          var matches = document.querySelectorAll( selector ),
            mi, ml = matches.length
  
          for( mi = 0; mi < ml; mi++ ) {
            if( matches[ mi ] === this ) return true
          }
  
          return false
        }
    } )()
  }
  
  var win = window

  if( !window.requestAnimationFrame ) {
    win.requestAnimationFrame = ( function() {
      return win.requestAnimationFrame ||
        win.webkitRequestAnimationFrame ||
        win.mozRequestAnimationFrame ||
        win.oRequestAnimationFrame ||
        win.msRequestAnimationFrame ||
        function( cb ) {
          return win.setTimeout( cb, 1000 / 60 )
        }
    } )()
  }
  
  if( !window.cancelAnimationFrame ) {
    win.cancelAnimationFrame = ( function() {
      return win.cancelAnimationFrame ||
        win.webkitCancelRequestAnimationFrame ||
        win.mozCancelRequestAnimationFrame ||
        win.oCancelRequestAnimationFrame ||
        win.msCancelRequestAnimationFrame ||
        clearTimeout
    } )()
  }

} )()
