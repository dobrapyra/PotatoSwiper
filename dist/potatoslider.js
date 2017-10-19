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

if( !window.requestAnimationFrame ) {
  var w = window
  w.requestAnimationFrame = ( function() {
    return w.requestAnimationFrame ||
      w.webkitRequestAnimationFrame ||
      w.mozRequestAnimationFrame ||
      w.oRequestAnimationFrame ||
      w.msRequestAnimationFrame ||
      function( cb ) {
        return w.setTimeout( cb, 1000 / 60 )
      }
  } )()
}

if( !window.cancelAnimationFrame ) {
  var w = window
  w.cancelAnimationFrame = ( function() {
    return w.cancelAnimationFrame ||
      w.webkitCancelRequestAnimationFrame ||
      w.mozCancelRequestAnimationFrame ||
      w.oCancelRequestAnimationFrame ||
      w.msCancelRequestAnimationFrame ||
      clearTimeout
  } )()
}

/**
 * PotatoSlider Core
 * Author dobrapyra (Michał Zieliński)
 */

var PotatoSlider = function( rootEl, cfg ) { this.preInit( rootEl, cfg ) }
PotatoSlider.prototype = Object.assign( PotatoSlider.prototype, {

  preInit: function( rootEl, cfg ) {
    var _this = this

    rootEl.PotatoSlider = _this

    _this._rootEl = rootEl
    _this._itemsArr = _this._getItemsArr( rootEl )

    _this._cfg = Object.assign( {
      nameSpace: 'potatoSlider',
      autoInit: true,
      loop: true,
      items: 1,
      perItem: 1,
      autoWidth: false,
      prevSelector: '[data-ps-prev]',
      nextSelector: '[data-ps-next]',
      gap: 0,
      largeSize: 2,
      largeSelector: '[data-ps-large]'
    }, cfg )

    if( _this._cfg.autoWidth ) _this._cfg = Object.assign( _this._cfg, {
      items: 1,
      perItem: 1,
      largeSize: 1
    } )

    _this._currIdx = 0

    _this._move = {
      d: 0, // diff
      b: null // begin
    }

    _this._lastTarget = null

    _this._inLoop = false
    _this._raf = null
    _this._fReady = true

    _this._time = {
      d: 0, // diff
      b: 0, // begin
      e: 0 // end
    }
    _this._posX = {
      b: 0, // begin
      e: 0 // end
    }

    if( _this._cfg.autoInit ) _this.init()
  },

  _getItemsArr: function( rootEl ) {
    var rootChildren = rootEl.children,
      i = 0, l = rootChildren.length,
      itemsArr = []

    for( ; i < l; i++ ) {
      itemsArr.push( rootChildren[ i ] )
    }

    return itemsArr
  },

  init: function() {
    this._prepareHtml()
    this._getNav()
    this._bindEvents()
  },

  _prepareHtml: function() {
    var _this = this,
      cfg = _this._cfg,
      rootEl = _this._rootEl,
      itemsArr = _this._itemsArr,
      i = 0, l = itemsArr.length,
      itemEl, psItem,
      itemElW, psItemW,
      rootW, allW = 0,
      itemsCount = 0,
      itemSize,
      psRoot, psWrap, psItems, psItemsArr

    psItemsArr = []

    _this._setStyle( rootEl, {
      overflow: 'hidden',
      height: 0
    } )

    rootW = rootEl.getBoundingClientRect().width

    psRoot = _this._createEl( 'div', '', {
      position: 'relative'
    } )

    psWrap = _this._createEl( 'div', '__wrap', {
      position: 'relative',
      overflow: 'hidden'
    }, psRoot )

    psItems = _this._createEl( 'div', '__items', {
      position: 'relative'
    }, psWrap )

    for( i = 0; i < l; i++ ) {
      itemEl = itemsArr[ i ]

      if( cfg.autoWidth ) {
        psItemW = itemEl.getBoundingClientRect().width
        itemElW = '100%'
      } else {
        psItemW = Math.floor( rootW * 100 / cfg.items ) / 100
        itemElW = ''
      }

      if( itemsCount % cfg.perItem === 0 ) {
        psItem = _this._createEl( 'div', '__item', {
          position: 'relative',
          display: 'inline-block',
          verticalAlign: 'middle',
          top: 0,
          left: 0,
          width: psItemW + 'px'
        }, psItems )

        psItemsArr.push( psItem )
        psItem.PotatoSlider = { items: 0 }

        allW += psItemW
      }

      _this._setStyle( itemEl, {
        position: 'relative',
        top: 0,
        left: 0,
        width: itemElW,
        float: 'none'
      } )
      psItem.appendChild( itemEl )

      itemSize = _this._isLarge( itemEl ) ? cfg.largeSize : 1

      itemsCount += itemSize
      psItem.PotatoSlider.items += itemSize
    }

    psItems._PotatoSlider = { x: 0 }

    _this._setStyle( psItems, {
      width: allW + 'px'
    } )

    _this._setStyle( rootEl, {
      overflow: '',
      height: ''
    } )

    rootEl.appendChild( psRoot )

    _this._psItemsArr = psItemsArr
    _this._psItems = psItems
    _this._psWrap = psWrap
    _this._psRoot = psRoot
  },

  _getNav: function() {
    var _this = this,
      getEl = _this._getEl,
      cfg = _this._cfg
    
    _this._navPrev = getEl( cfg.prevSelector )
    _this._navNext = getEl( cfg.nextSelector )
  },

  _isLarge: function( itemEl ) {
    return itemEl.matches( this._cfg.largeSelector )
  },

  _bindEvents: function() {
    var _this = this,
      addEvent = _this._addEvent.bind( _this ),
      navPrev = _this._navPrev,
      navNext = _this._navNext,
      resizeTimeout = _this._resizeTimeout

    if( navPrev ) addEvent( navPrev, 'click', function( e ) {
      e.preventDefault()
      _this.prev()
    } )

    if( navNext ) addEvent( navNext, 'click', function( e ) {
      e.preventDefault()
      _this.next()
    } )

    addEvent( _this._psItems, 'mousedown', function( e ) {
      e.preventDefault()
      _this._bindDocMouseEvents()
      _this._moveBegin( e )
    } )

    addEvent( _this._psItems, 'touchstart', function( e ) {
      _this._bindDocTouchEvents()
      _this._moveBegin( e )
    } )

    addEvent( window, 'resize', function() {
      clearTimeout( resizeTimeout )
      resizeTimeout = setTimeout( function() {
        _this.refresh()
      }, 200 )
    } )
  },

  _unbindEvents: function() {
    var _this = this,
      remEvent = _this._remEvent

    remEvent( _this._navPrev, 'click' )

    remEvent( _this._navNext, 'click' )

    remEvent( _this._psItems, 'mousedown' )

    remEvent( _this._psItems, 'touchstart' )

    remEvent( window, 'resize' )
  },

  _bindDocMouseEvents: function() {
    var _this = this,
      addEvent = _this._addEvent.bind( _this ),
      doc = document

    addEvent( doc, 'mousemove', function( e ) {
      _this._moveUpdate( e )
    } )

    addEvent( doc, 'mouseup', function( e ) {
      _this._unbindDocMouseEvents()
      _this._moveEnd( e )
    } )

    addEvent( doc, 'mouseleave', function( e ) {
      console.log( 'leave' )
      _this._unbindDocMouseEvents()
      _this._moveEnd( e )
    } )
  },

  _unbindDocMouseEvents: function() {
    var _this = this,
      remEvent = _this._remEvent.bind( _this ),
      doc = document

    remEvent( doc, 'mousemove' )

    remEvent( doc, 'mouseup' )

    remEvent( doc, 'mouseleave' )
  },

  _bindDocTouchEvents: function() {
    var _this = this,
      addEvent = _this._addEvent.bind( _this ),
      doc = document

    addEvent( doc, 'touchmove', function( e ) {
      _this._moveUpdate( e )
    } )

    addEvent( doc, 'touchend', function( e ) {
      _this._unbindDocTouchEvents()
      _this._moveEnd( e )
    } )
  },

  _unbindDocTouchEvents: function() {
    var _this = this,
      remEvent = _this._remEvent.bind( _this ),
      doc = document

    remEvent( doc, 'touchmove' )

    remEvent( doc, 'touchend' )
  },

  refresh: function() {
    this.destroy()
    this.init()
  },

  _addEvent: function( el, eventName, fn ) {
    el._psEvents = el._psEvents || {}
    if( el._psEvents[ eventName ] ) this._remEvent( el, eventName )

    el._psEvents[ eventName ] = fn

    el.addEventListener( eventName, el._psEvents[ eventName ] )
  },

  _remEvent: function( el, eventName ) {
    if( !el._psEvents || !el._psEvents[ eventName ] ) return

    el.removeEventListener( eventName, el._psEvents[ eventName ] )
  },

  _getEl: function( selector, relEl ) {
    return ( relEl || document ).querySelector( selector )
  },

  _createEl: function( selector, elClassSuffix, styleObj, parentEl ) {
    var _this = this,
      el = document.createElement( selector )

    el.setAttribute( 'class', _this._cfg.nameSpace + elClassSuffix )
    _this._setStyle( el, styleObj )

    if( parentEl ) parentEl.appendChild( el )

    return el
  },

  _setStyle: function( el, styleObj ) {
    var elStyle = el.style,
      styleKeys = Object.keys( styleObj ),
      i = 0, l = styleKeys.length,
      styleKey

    for( ; i < l; i++ ) {
      styleKey = styleKeys[ i ]
      elStyle[ styleKey ] = styleObj[ styleKey ]
    }
  },

  _moveBegin: function( e ) {
    var _this = this,
      rootStyle = _this._rootEl.style,
      touch = e.touch || ( e.touches ? e.touches[ 0 ] : false )

    // _this._lastTarget = e.target.closest( 'a[href], button' )

    _this._move.b = touch ? touch.clientX : e.clientX

    rootStyle.userSelect = 'none'
    rootStyle.pointerEvents = 'none'
  },

  _moveUpdate: function( e ) {
    var _this = this,
      touch = e.touch || ( e.touches ? e.touches[ 0 ] : false )

    if( _this._move.b === null ) return

    _this._move.d = touch ? touch.clientX - _this._move.b : e.clientX - _this._move.b

    _this._updatePos( _this._move.d )
  },

  _moveEnd: function() {
    var _this = this,
      rootStyle = _this._rootEl.style,
      dir = ( _this._move.d > _this._treashold ) ? 1 : ( _this._move.d < -_this._treashold ) ? -1 : 0

    _this._move.b = null
    // _this._move.d = 0

    rootStyle.userSelect = ''
    rootStyle.pointerEvents = ''

    if( dir !== 0 ) {
      if( dir < 0 ) {
        _this.next()
      } else {
        _this.prev()
      }
    } else {
      // if( _this._lastTarget ) {
      //   _this._lastTarget.click()
      //   _this._lastTarget = null
      // }
      _this._alignPos()
    }
  },

  _updatePos: function( x ) {
    this._psItems.style.transform = 'matrix(1,0,0,1,' + x +  ',0)'
  },

  _alignPos: function() {
    // _this._psItems.style.transform = ''
    this._animX( 0, 600 )
  },

  _animX: function( x, duration ) {
    var _this = this,
      time = _this._time,
      posX = _this._posX

    time.b = window.performance.now()
    time.e = time.b + duration
    time.d = duration
    posX.b = _this._move.d
    posX.e = x

    _this._startLoop()
  },

  _loop: function() {
    var _this = this,
      fReady = _this._fReady

    _this._setRaf( function() { _this._loop() } )
    if( !fReady ) return

    fReady = false
    _this._update( window.performance.now() )
    fReady = true
  },

  _startLoop: function() {
    var _this = this

    if( _this._inLoop ) return

    _this._inLoop = true
    _this._setRaf( function() { _this._loop() } )
  },

  _stopLoop: function() {
    var _this = this

    _this._setRaf( null )
    _this._inLoop = false
  },

  _update: function( t ) {
    var _this = this,
      time = _this._time,
      fract

    if( t > time.e ) { // complete
      _this._stopLoop()
    }

    fract = ( t - time.b ) / time.d
    if( fract < 0 ) fract = 0
    else if( fract > 1 ) fract = 1
    // fract = this._easing.easeOutCubic( fract )
    // scrollTop( this._bScroll + fract * this._dScroll ) // to remove
    _this._updatePos( ( 1 - fract ) * _this._move.d )
  },

  _setRaf: function( fn ) {
    var _this = this
    
    if( fn ) {
      _this._raf = requestAnimationFrame( fn )
    } else {
      cancelAnimationFrame( _this._raf )
      _this._raf = null
    }
  },

  next: function() {
    console.log( 'next' )
  },
  
  prev: function() {
    console.log( 'prev' )
  },

  _restoreHtml: function() {
    var _this = this,
      itemsArr = _this._itemsArr,
      i = 0, l = itemsArr.length,
      itemEl, rootEl = _this._rootEl

    for( ; i < l; i++ ) {
      itemEl = itemsArr[ i ]

      _this._setStyle( itemEl, {
        position: '',
        top: '',
        left: '',
        width: '',
        float: ''
      } )

      rootEl.appendChild( itemEl )
    }

    rootEl.removeChild( _this._psRoot )
  },

  destroy: function() {
    this._unbindEvents()
    this._restoreHtml()
  }

} )
