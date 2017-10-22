/**
 * PotatoSlider Core
 * Author: dobrapyra (Michał Zieliński)
 * Version: 2017-10-22
 */

var PotatoSlider = function( rootEl, cfg ) { this.preInit( rootEl, cfg ) }
Object.assign( PotatoSlider.prototype, {

  _easing: {
    easeOutCubic: function( f ) {
      f = 1 - f
      return 1 - ( f * f * f )
    }
  },

  preInit: function( rootEl, cfg ) {
    var _this = this

    rootEl.PotatoSlider = _this

    _this._rootEl = rootEl
    _this._itemsArr = _this._getItemsArr( rootEl )

    // default config
    _this._mainCfg = Object.assign( {
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
      largeSelector: '[data-ps-large]',
      duration: 500, // ms
      easing: 'easeOutCubic',
      rwdMobileFirst: true,
      rwd: {}
    }, cfg )
    _this._cfg = {}

    _this._currIdx = 0
    _this._maxIdx = 0

    _this._move = {
      d: 0, // diff
      b: null // begin
    }

    // _this._lastTarget = null

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
      i, m

    if( mainCfg.rwd ) {
      rwdArr = Object.keys( mainCfg.rwd ) // maybe sort required
      m = rwdArr.length - 1

      for( i = 0; i <= m; i++ ) {
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
      i, l = itemsArr.length,
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

    for( i = 0; i < l; i++ ) {
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
        psItem._PotatoSlider = { items: 0 }

        allW += psItemW
      }

      setStyle( itemEl, {
        position: 'relative',
        top: 0,
        left: 0,
        width: itemElW,
        float: 'none'
      } )
      psItem.appendChild( itemEl )

      itemSize = _this._isLarge( itemEl ) ? cfg.largeSize : 1

      itemsCount += itemSize
      psItem._PotatoSlider.items += itemSize
    }

    _this._maxIdx = psItemsArr.length - 1

    _this._psItemsArr = psItemsArr
    _this._psItems = psItems
    _this._psWrap = psWrap
    _this._psRoot = psRoot

    rootEl.appendChild( psRoot )

    if( cfg.loop ) allW = _this._cloneItems( allW )

    setStyle( psItems, {
      width: allW + 'px',
    } )

    setStyle( rootEl, {
      overflow: '',
      height: ''
    } )

    setStyle( psItems, {
      left: -_this._getElL( psItemsArr[ _this._currIdx ] ) + 'px'
    } )

    _this._getNav()
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

    _this._stopLoop()

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
    this._psItems.style.transform = 'matrix(1,0,0,1,' + x + ',0)'
  },

  _alignPos: function() {
    var _this = this
    // _this._psItems.style.transform = ''
    _this._animPos( _this._cfg.duration )
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
    var _this = this

    _this.goTo( _this._currIdx + 1 )
  },

  prev: function() {
    var _this = this

    _this.goTo( _this._currIdx - 1 )
  },

  goTo: function( itemIdx ) {
    var _this = this,
      maxIdx = _this._maxIdx,
      loopCfg = _this._cfg.loop

    if( itemIdx === _this._currIdx ) return

    if( itemIdx > maxIdx ) itemIdx = loopCfg ? 0 : maxIdx
    if( itemIdx < 0 ) itemIdx = loopCfg ? maxIdx : 0

    _this._currIdx = itemIdx
    // console.log( 'goto: ', itemIdx )
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
