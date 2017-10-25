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

/**
 * PotatoSwiper Core
 * Author: dobrapyra (Michał Zieliński)
 * Version: 2017-10-24
 */

var PotatoSwiper = function( rootEl, cfg ) {

  if( rootEl.length ) {
    return this._multiInit( rootEl, cfg )
  } else {
    this._preInit( rootEl, cfg )
    // return this
  }

}

Object.assign( PotatoSwiper.prototype, {

  _easing: {
    easeOutCubic: function( f ) {
      f = 1 - f
      return 1 - ( f * f * f )
    }
  },

  _multiInit: function( rootArr, cfg ) {
    var swipersArr = [],
      i = 0, l = rootArr.length

    for( ; i < l; i++ ) {
      swipersArr.push( new PotatoSwiper( rootArr[ i ], cfg ) )
    }

    for( i = 0; i < l; i++ ) {
      rootArr[ i ].PotatoSwiper.refresh()
    }

    return swipersArr
  },

  _preInit: function( rootEl, cfg ) {
    var _this = this

    rootEl.PotatoSwiper = _this

    _this._rootEl = rootEl
    _this._itemsArr = _this._getItemsArr( rootEl )

    // default config
    _this._mainCfg = Object.assign( {
      nameSpace: 'potatoSwiper',
      autoInit: true,
      loop: true,
      items: 1,
      perItem: 1,
      autoWidth: false,
      navScopeEl: rootEl.parentElement,
      prevSelector: '[data-ps-prev]',
      nextSelector: '[data-ps-next]',
      gap: 0,
      largeSize: 2,
      largeSelector: '[data-ps-large]',
      duration: 500, // ms
      easing: 'easeOutCubic',
      rwdMobileFirst: true,
      rwd: {}
    }, cfg )
    _this._cfg = {}

    _this._treashold = 20

    _this._currIdx = 0
    _this._maxIdx = 0

    _this._firstL = 0
    _this._loopW = 0
    _this._psX = 0
    _this._psD = 0

    // _this._lastTarget = null

    _this._move = {
      d: 0, // diff
      b: null // begin
    }

    _this._inLoop = false
    _this._raf = null
    _this._fReady = true

    _this._time = {
      d: 0, // diff
      b: 0, // begin
      e: 0 // end
    }

    if( _this._mainCfg.autoInit ) _this.init()
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

  _setRWDCfg: function() {
    var _this = this,
      mainCfg = _this._mainCfg,
      cfg, rwdCfg = {}, rwdArr = [],
      bodyW = _this._getEl( 'body' ).offsetWidth,
      i = 0, m

    if( mainCfg.rwd ) {
      rwdArr = Object.keys( mainCfg.rwd ) // maybe sort required
      m = rwdArr.length - 1

      for( ; i <= m; i++ ) {
        if( mainCfg.rwdMobileFirst ) {
          if( rwdArr[ i ] <= bodyW ) {
            rwdCfg = mainCfg.rwd[ rwdArr[ i ] ]
          } else {
            break
          }
        } else {
          if( rwdArr[ m - i ] >= bodyW ) {
            rwdCfg = mainCfg.rwd[ rwdArr[ m - i ] ]
          } else {
            break
          }
        }
      }
    }

    cfg = Object.assign( {}, mainCfg, {
      rwd: {}
    }, rwdCfg )

    if( cfg.autoWidth ) Object.assign( cfg, {
      items: 1,
      perItem: 1,
      largeSize: 1
    } )

    return _this._cfg = cfg
  },

  init: function() {
    this._prepareHtml()
    this._bindEvents()
  },

  _prepareHtml: function() {
    var _this = this,
      cfg,
      getElW = _this._getElW,
      setStyle = _this._setStyle,
      createEl = _this._createEl.bind( _this ),
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

    setStyle( rootEl, {
      overflow: 'hidden',
      height: 0
    } )

    cfg = _this._setRWDCfg()

    rootW = getElW( rootEl )

    psRoot = createEl( 'div', '', {
      position: 'relative'
    } )

    psWrap = createEl( 'div', '__wrap', {
      position: 'relative',
      overflow: 'hidden'
    }, psRoot )

    psItems = createEl( 'div', '__items', {
      position: 'relative'
    }, psWrap )

    for( ; i < l; i++ ) {
      itemEl = itemsArr[ i ]

      if( cfg.autoWidth ) {
        psItemW = getElW( itemEl )
        itemElW = '100%'
      } else {
        psItemW = Math.floor( rootW * 100 / cfg.items ) / 100
        itemElW = ''
      }

      if( itemsCount % cfg.perItem === 0 ) {
        psItem = createEl( 'div', '__item', {
          position: 'relative',
          display: 'inline-block',
          verticalAlign: 'middle',
          top: 0,
          left: 0,
          width: psItemW + 'px'
        }, psItems )

        psItemsArr.push( psItem )
        psItem._psItemSize = 0
        psItem._psItemW = psItemW

        allW += psItemW
      }

      setStyle( itemEl, {
        position: 'relative',
        top: 0,
        left: 0,
        width: itemElW,
        float: 'none'
      }, true )
      psItem.appendChild( itemEl )

      itemSize = _this._isLarge( itemEl ) ? cfg.largeSize : 1

      itemsCount += itemSize
      psItem._psItemSize += itemSize
    }

    _this._maxIdx = psItemsArr.length - 1

    _this._psItemsArr = psItemsArr
    _this._psItems = psItems
    _this._psWrap = psWrap
    _this._psRoot = psRoot

    rootEl.appendChild( psRoot )

    _this._firstL = psItemsArr[0]._psItemL
    _this._loopW = allW
    if( cfg.loop ) allW = _this._cloneItems( allW )

    setStyle( psItems, {
      width: allW + 'px',
    } )

    setStyle( rootEl, {
      overflow: '',
      height: ''
    } )

    _this._cacheLeft()

    setStyle( psItems, {
      left: -psItemsArr[ _this._currIdx ]._psItemL + 'px'
    } )
    _this._updatePos( 0 )

    _this._getNav()
  },

  _getNav: function() {
    var _this = this,
      getEl = _this._getEl,
      cfg = _this._cfg,
      navScopeEl = cfg.navScopeEl

    _this._navPrev = getEl( cfg.prevSelector, navScopeEl )
    _this._navNext = getEl( cfg.nextSelector, navScopeEl )
  },

  _isLarge: function( itemEl ) {
    return itemEl.matches( this._cfg.largeSelector )
  },

  _cloneItems: function( allW ) {
    var _this = this,
      getElW = _this._getElW,
      cloneItem = _this._cloneItem,
      psItems = _this._psItems,
      psItemsArr = _this._psItemsArr,
      psItem, clonesW,
      wrapW = getElW( _this._psWrap ),
      i, l = psItemsArr.length

    // after
    i = 0
    clonesW = 0
    while( clonesW < wrapW ) {
      psItem = psItemsArr[ i % l ]
      clonesW += getElW( psItem )
      psItems.appendChild( cloneItem( psItem ) )
      i++
    }
    allW += clonesW

    // before
    i = -1
    clonesW = 0
    while( clonesW < wrapW ) {
      psItem = psItemsArr[ ( i + l ) % l ]
      clonesW += getElW( psItem )
      psItems.insertBefore( cloneItem( psItem ), psItems.children[0] )
      i--
    }
    allW += clonesW

    return allW
  },

  _cloneItem: function( item ) {
    var itemClass = item.getAttribute( 'class' ),
      cloneItem = item.cloneNode( true )

    cloneItem.setAttribute( 'class', itemClass + ' ' + itemClass + '--clone' )

    return cloneItem
  },

  _cacheLeft: function() {
    var _this = this,
      psItemsArr = _this._psItemsArr,
      getElL = _this._getElL,
      i = 0, l = psItemsArr.length,
      psItem
    
    for( ; i < l; i++ ) {
      psItem = psItemsArr[ i ]
      psItem._psItemL = getElL( psItem )
    }
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
      remEvent = _this._remEvent.bind( _this )

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
    var _this = this,
      psRoot, elEvents

    if( el === window || el === document ) {
      psRoot = _this._psRoot
      elEvents = psRoot._psEvents = psRoot._psEvents || {}
    } else {
      elEvents = el._psEvents = el._psEvents || {}
    }

    if( elEvents[ eventName ] ) this._remEvent( el, eventName )

    elEvents[ eventName ] = fn

    el.addEventListener( eventName, elEvents[ eventName ] )
  },

  _remEvent: function( el, eventName ) {
    var _this = this,
      elEvents

    elEvents = ( el === window || el === document ) ? _this._psRoot._psEvents : el._psEvents

    if( !elEvents || !elEvents[ eventName ] ) return

    el.removeEventListener( eventName, elEvents[ eventName ] )
  },

  _getEl: function( selector, scopeEl ) {
    return ( scopeEl || document ).querySelector( selector )
  },

  _getElW: function( el ) {
    return el.getBoundingClientRect().width
  },

  _getElL: function( el ) {
    return el.getBoundingClientRect().left - el.offsetParent.getBoundingClientRect().left
  },

  _createEl: function( selector, elClassSuffix, styleObj, parentEl ) {
    var _this = this,
      el = document.createElement( selector )

    el.setAttribute( 'class', _this._cfg.nameSpace + elClassSuffix )
    _this._setStyle( el, styleObj )

    if( parentEl ) parentEl.appendChild( el )

    return el
  },

  _setStyle: function( el, styleObj, backup ) {
    var elStyle = el.style,
      styleKeys = Object.keys( styleObj ),
      i = 0, l = styleKeys.length,
      styleKey

    el._psStyleCopy = el._psStyleCopy || {}
    for( ; i < l; i++ ) {
      styleKey = styleKeys[ i ]
      if( backup == 1 ) el._psStyleCopy[ styleKey ] = elStyle[ styleKey ]
      elStyle[ styleKey ] = styleObj[ styleKey ]
    }
  },

  _moveBegin: function( e ) {
    var _this = this,
      rootStyle = _this._rootEl.style,
      touch = e.touch || ( e.touches ? e.touches[ 0 ] : false )

    _this._stopLoop()

    // _this._lastTarget = e.target.closest( 'a[href], button' )

    _this._move.b = touch ? touch.clientX : e.clientX
    _this._psD = _this._psX

    rootStyle.userSelect = 'none'
    rootStyle.pointerEvents = 'none'
  },

  _moveUpdate: function( e ) {
    var _this = this,
      touch = e.touch || ( e.touches ? e.touches[ 0 ] : false )

    if( _this._move.b === null ) return

    _this._move.d = touch ? touch.clientX - _this._move.b : e.clientX - _this._move.b

    _this._updatePos( _this._psD + _this._move.d )
  },

  _moveEnd: function() {
    var _this = this,
      rootStyle = _this._rootEl.style,
      dir = ( _this._move.d > _this._treashold ) ? 1 : ( _this._move.d < -_this._treashold ) ? -1 : 0
     
    _this._move.b = null
    _this._move.d = 0

    _this._psD = _this._psX

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
      _this._animPos( _this._cfg.duration )
    }
  },

  _updatePos: function( x ) {
    var _this = this,
      loopW = _this._loopW

    x = x % loopW
    // x = ( ( ( x % loopW ) + loopW ) % loopW ) - loopW

    _this._psX = x
    _this._psItems.style.transform = 'matrix(1,0,0,1,' + x + ',0)'
  },

  _animPos: function( duration ) {
    var _this = this,
      time = _this._time

    time.b = window.performance.now()
    time.e = time.b + duration
    time.d = duration

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

    fract = _this._easing[ _this._cfg.easing ]( fract )

    _this._updatePos( ( 1 - fract ) * _this._psD )
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
    this.goBy( 1 )
  },

  prev: function() {
    this.goBy( -1 )
  },

  goBy: function( offset ) {
    var _this = this

    _this._psD = _this._psX
    _this.goTo( _this._currIdx + offset )
  },

  goTo: function( itemIdx ) {
    var _this = this,
      psItemsArr = _this._psItemsArr,
      psItems = _this._psItems,
      maxIdx = _this._maxIdx,
      loopCfg = _this._cfg.loop,
      newL = 0

    if( itemIdx === _this._currIdx ) return

    if( itemIdx > maxIdx ) itemIdx = loopCfg ? 0 : maxIdx
    if( itemIdx < 0 ) itemIdx = loopCfg ? maxIdx : 0
    
    newL = -psItemsArr[ itemIdx ]._psItemL
    _this._psD -= newL + psItemsArr[ _this._currIdx ]._psItemL

    _this._setStyle( psItems, {
      left: newL + 'px'
    } )
    _this._animPos( _this._cfg.duration )
  
    _this._currIdx = itemIdx
  },

  _restoreHtml: function() {
    var _this = this,
      itemsArr = _this._itemsArr,
      i = 0, l = itemsArr.length,
      itemEl, rootEl = _this._rootEl

    for( ; i < l; i++ ) {
      itemEl = itemsArr[ i ]

      _this._setStyle( itemEl, itemEl._psStyleCopy )

      rootEl.appendChild( itemEl )
    }

    rootEl.removeChild( _this._psRoot )
  },

  destroy: function() {
    this._unbindEvents()
    this._restoreHtml()
  }

} )
