( function() {

  if( !Array.prototype.indexOf ) {
    Array.prototype.indexOf = function( el, from ) {

      var arr = this, i, l = arr.length

      from = from || 0

      for( i = from; i < l; i++ ) {
        if( arr[ i ] === el ) return i
      }

      return -1
    }
  }

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

  if( !( 'classList' in Element.prototype ) ) {

    var ClassList = function( el ) {
      this.element = el

      var arr = el.className.split( ' ' ),
        i = 0, l = arr.length

      for( ; i < l; i++ ) {
        this[i] = arr[i]
      }
    }

    Object.assign( ClassList.prototype, {

      contains: function( className ) {
        return this.element.className.split( ' ' ).indexOf( className ) >= 0
      },

      add: function( className ) {
        var _this = this,
          el = _this.element,
          classArr = el.className.split( ' ' )
        
        if( _this.contains( className ) ) return
        
        classArr.push( className )
        el.className = classArr.join( ' ' )
      },
      
      remove: function( className ) {
        var _this = this,
          el = _this.element,
          classArr = el.className.split( ' ' )
        
        if( !_this.contains( className ) ) return

        classArr.splice( classArr.indexOf( className ) )
        el.className = classArr.join( ' ' )
      },

      toggle: function( className ) {
        var _this = this

        return _this.contains( className ) ?
          ( _this.remove( className ), false ) :
          ( _this.add( className ), true )
      },

      replace: function( removeClass, addClass ) {
        var _this = this

        _this.remove( removeClass )
        _this.add( addClass )
      }

    } )

    Object.defineProperty( ClassList.prototype, 'length', {
      get: function() {
        return this.element.className.split( ' ' ).length
      }
    } )

    Object.defineProperty( Element.prototype, 'classList', {
      get: function() {
        return new ClassList( this )
      }
    } )
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
