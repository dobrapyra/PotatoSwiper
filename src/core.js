/*!
 * PotatoSwiper Core
 * Author: dobrapyra (Michał Zieliński)
 * Version: 2018-06-04
 * Url: https://github.com/dobrapyra/PotatoSwiper
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
      gap: 0, // px
      largeSize: 2,
      duration: 500, // ms
      threshold: 20, // px
      easing: 'easeOutCubic',
      rwdMobileFirst: true,
      scopeEl: rootEl.parentElement,
      selector: {
        prev: '[data-ps-prev]',
        next: '[data-ps-next]',
        dot: '[data-ps-dot]',
        large: '[data-ps-large]'
      },
      class: {},
      rwd: {}
    }, cfg )
    _this._cfg = {}

    _this._inited = false

    _this._currIdx = 0
    _this._allIdx = 0
    _this._maxIdx = 0

    _this._loopW = 0
    _this._currItemX = 0
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

    if( _this._mainCfg.autoInit ) {
      _this.init()
      setTimeout( function() { _this.refresh() }, 0 ) // mibile winW fix
    }
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
      winW = window.innerWidth,
      i = 0, m

    if( mainCfg.rwd ) {
      rwdArr = Object.keys( mainCfg.rwd ) // maybe sort required
      m = rwdArr.length - 1

      for( ; i <= m; i++ ) {
        if( mainCfg.rwdMobileFirst ) {
          if( rwdArr[ i ] <= winW ) {
            rwdCfg = mainCfg.rwd[ rwdArr[ i ] ]
          } else {
            break
          }
        } else {
          if( rwdArr[ m - i ] >= winW ) {
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
    var _this = this

    _this._prepareHtml()
    _this._prepareDots()
    _this._bindEvents()
    _this._inited = true
  },

  _prepareHtml: function() {
    var _this = this,
      cfg, gap,
      getElW = _this._getElW,
      setStyle = _this._setStyle,
      createEl = _this._createEl.bind( _this ),
      rootEl = _this._rootEl,
      itemsArr = _this._itemsArr,
      i = 0, l = itemsArr.length,
      itemEl, psItem,
      itemElW, psItemW,
      psItemStyle,
      psItemMargin,
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
    gap = cfg.gap

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
        psItemW = Math.floor( ( rootW + gap ) * 100 / cfg.items ) / 100
        itemElW = ''
      }

      if( itemsCount % cfg.perItem === 0 ) {

        psItemStyle = {
          position: 'relative',
          display: 'inline-block',
          verticalAlign: 'middle',
          top: 0,
          left: 0,
          width: ( psItemW - gap ) + 'px',
        }
        psItemMargin = 'marginRight'
        psItemStyle[psItemMargin] = gap + 'px'

        psItem = createEl( 'div', '__item', psItemStyle, psItems )

        psItemsArr.push( psItem )
        psItem._psItemSize = 0
        psItem._psItemW = psItemW

        allW += psItemW
      }

      itemEl._psStyleCopy = Object.assign( {}, itemEl.style )
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
      psItem._psItemSize += itemSize
    }

    _this._allIdx = psItemsArr.length
    _this._maxIdx = _this._allIdx - 1

    _this._psItemsArr = psItemsArr
    _this._psItems = psItems
    _this._psWrap = psWrap
    _this._psRoot = psRoot

    rootEl.appendChild( psRoot )

    _this._loopW = allW
    if( cfg.loop ) allW = _this._cloneItems( allW )

    setStyle( psItems, {
      width: allW + 'px',
    } )

    setStyle( rootEl, {
      overflow: '',
      height: ''
    } )

    _this._cacheItemsData()

    if( _this._currIdx > _this._maxIdx ) _this._setCurrIdx( _this._maxIdx )
    _this._currItemX = psItemsArr[ _this._currIdx ]._psItemX

    setStyle( psItems, {
      left: -psItemsArr[ _this._currIdx ]._psItemL + 'px'
    } )
    _this._updatePos( 0 )

    _this._getNav()
  },

  _prepareDots: function() {
    var _this = this,
      cfg = _this._cfg,
      psItemsArr = _this._psItemsArr,
      i = 0, l = _this._allIdx,
      psItemW, pageW, page = 0,
      wrapGapW = _this._getElW( _this._psWrap ) + cfg.gap,
      dot, dotsEl, dotTpl = _this._getEl( cfg.selector.dot, cfg.scopeEl )
    
    _this._dotsArr = []
    if( dotTpl ) {
      dotTpl._psPageGoTo = 0

      _this._dotTpl = dot = dotTpl.cloneNode( true )
      _this._dotsEl = dotsEl = dotTpl.parentElement
      dotsEl.innerHTML = ''

      pageW = wrapGapW
      for( ; i < l; i++ ) {
        psItemW = psItemsArr[ i ]._psItemW

        pageW += psItemW
        if( pageW > wrapGapW ) {
          page++
          pageW = psItemW
          dot = dotTpl.cloneNode( true )
          dot.innerHTML = dot.innerHTML.replace( /{{#}}/g, page )
          dot._psPageGoTo = i
          _this._addEvent( dot, 'click', function( e ) {
            e.preventDefault()
            _this.goTo( e.currentTarget._psPageGoTo )
          } )
          dotsEl.appendChild( dot )
        }
      }

      _this._dotsArr = dotsEl.children
    }

    _this._setCurrIdx( _this._currIdx )
  },

  _getNav: function() {
    var _this = this,
      getEl = _this._getEl,
      cfg = _this._cfg,
      scopeEl = cfg.scopeEl,
      selectorCfg = cfg.selector

    _this._navPrev = getEl( selectorCfg.prev, scopeEl )
    _this._navNext = getEl( selectorCfg.next, scopeEl )
  },

  _isLarge: function( itemEl ) {
    return itemEl.matches( this._cfg.selector.large )
  },

  _cloneItems: function( allW ) {
    var _this = this,
      cloneItem = _this._cloneItem,
      psItems = _this._psItems,
      psItemsArr = _this._psItemsArr,
      psItem, clonesW,
      wrapW = _this._getElW( _this._psWrap ),
      i, l = _this._allIdx

    // after
    i = 0
    clonesW = 0
    while( clonesW < wrapW ) {
      psItem = psItemsArr[ i % l ]
      clonesW += psItem._psItemW
      psItems.appendChild( cloneItem( psItem ) )
      i++
    }
    allW += clonesW

    // before
    i = -1
    clonesW = 0
    while( clonesW < wrapW ) {
      psItem = psItemsArr[ ( ( i % l ) + l ) % l ]
      clonesW += psItem._psItemW
      psItems.insertBefore( cloneItem( psItem ), psItems.children[ 0 ] )
      i--
    }
    allW += clonesW

    return allW
  },

  _cloneItem: function( item ) {
    var cloneItem = item.cloneNode( true )

    cloneItem.classList.add( item.getAttribute( 'class' ) + '--clone' )

    return cloneItem
  },

  _cacheItemsData: function() {
    var _this = this,
      psItemsArr = _this._psItemsArr,
      getElL = _this._getElL,
      i = 0, l = _this._allIdx,
      firstL = getElL( psItemsArr[ 0 ] ),
      psItem

    for( ; i < l; i++ ) {
      psItem = psItemsArr[ i ]
      psItem._psItemL = getElL( psItem )
      psItem._psItemX = psItem._psItemL - firstL
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

    if( _this._navPrev ) remEvent( _this._navPrev, 'click' )

    if( _this._navNext ) remEvent( _this._navNext, 'click' )

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
    var _this = this
    
    if( !_this._inited ) return
    _this.destroy()
    _this.init()
  },

  _addEvent: function( el, eventName, fn ) {
    var _this = this,
      psRoot = _this._psRoot,
      elEvents

    if( el === window || el === document ) {
      elEvents = psRoot._psEvents = psRoot._psEvents || {}
    } else {
      elEvents = el._psEvents = el._psEvents || {}
    }

    if( elEvents[ eventName ] ) _this._remEvent( el, eventName )

    elEvents[ eventName ] = fn

    el.addEventListener( eventName, elEvents[ eventName ] )
  },

  _remEvent: function( el, eventName ) {
    var _this = this,
      elEvents = ( el === window || el === document ) ? _this._psRoot._psEvents : el._psEvents

    if( !elEvents || !elEvents[ eventName ] ) return

    el.removeEventListener( eventName, elEvents[ eventName ] )
    delete elEvents[ eventName ]
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

    el.classList.add( _this._cfg.nameSpace + elClassSuffix )
    _this._setStyle( el, styleObj )

    if( parentEl ) parentEl.appendChild( el )

    return el
  },

  _setStyle: function( el, styleObj ) {
    Object.assign( el.style, styleObj )
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
      psItemsArr = _this._psItemsArr,
      psItems = _this._psItems,
      rootStyle = _this._rootEl.style,
      moveD = _this._move.d,
      loopW = _this._loopW,
      maxIdx = _this._maxIdx,
      i = 1, l = _this._allIdx,
      diffA, diffB, diffX = 0,
      currItemsL, currItemsX,
      tmpX, modX, closestIdx = null,
      cfg = _this._cfg,
      threshold = cfg.threshold,
      halfGap = cfg.gap / 2,
      loopCfg = cfg.loop,
      duration = cfg.duration

    _this._move.b = null
    _this._move.d = 0

    rootStyle.userSelect = ''
    rootStyle.pointerEvents = ''

    if( moveD > threshold || moveD < -threshold ) {
      modX = tmpX = _this._currItemX - ( _this._psD + moveD )
      modX = ( loopCfg ? ( ( modX % loopW + loopW ) % loopW ) : modX ) + halfGap

      for( ; i <= l; i++ ) {
        if( !loopCfg && i === l ) break
  
        diffA = modX - psItemsArr[ i - 1 ]._psItemX
        diffB = i !== l ? modX - psItemsArr[ i ]._psItemX : modX - loopW

        if( diffA > 0 && diffB < 0 ) {

          closestIdx = moveD > 0 ? ( diffX = diffA, i - 1 ) : ( diffX = diffB, i )
          
          // // real closest
          // closestIdx = diffA < -diffB ? ( diffX = diffA, i - 1 ) : ( diffX = diffB, i )

          closestIdx %= l
          break
        }

        if( !closestIdx ) { 
          closestIdx = moveD > 0 ? 0 : maxIdx
          diffX = moveD > 0 ? tmpX : tmpX - psItemsArr[ maxIdx ]._psItemX
        }
      }

      currItemsL = -psItemsArr[ closestIdx ]._psItemL
      currItemsX = psItemsArr[ closestIdx ]._psItemX
      _this._psD = halfGap - diffX

      _this._setStyle( psItems, {
        left: currItemsL + 'px'
      } )
      _this._animPos( duration )

      _this._setCurrIdx( closestIdx )
      _this._currItemX = currItemsX
    } else {
      // if( _this._lastTarget ) {
      //   _this._lastTarget.click()
      //   _this._lastTarget = null
      // }
      if( !moveD ) return // mobile sometimes not unbind event error bypass
      _this._psD = _this._psX
      _this._animPos( duration )
    }
  },

  _updatePos: function( x ) {
    var _this = this,
      loopW = _this._loopW,
      currItemX = _this._currItemX

    if( _this._cfg.loop ) {
      x = ( ( x % loopW + loopW ) % loopW - currItemX ) % loopW + currItemX
      x = ( x > currItemX ) ? x - loopW : x
    }

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

  _setCurrIdx: function( idx ) {
    var _this = this,
      activeDotClass = _this._cfg.class.activeDot,
      dotsArr = _this._dotsArr,
      i = 0, l = dotsArr.length,
      dot, active

    _this._currIdx = idx

    if( l <= 0 ) return

    for( ; i < l; i++ ) {
      dot = dotsArr[ i ]

      dot.classList.remove( activeDotClass )

      if( dot._psPageGoTo <= idx ) active = i
    }

    dotsArr[ active ].classList.add( activeDotClass )
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

    _this.goTo( _this._currIdx + offset )
  },

  goTo: function( targetIdx ) {
    var _this = this,
      psItemsArr = _this._psItemsArr,
      psItems = _this._psItems,
      allIdx = _this._allIdx,
      maxIdx = _this._maxIdx,
      loopW = _this._loopW,
      modIdx, loops, currItemsL = 0,
      cfg = _this._cfg,
      loopCfg = cfg.loop

    if( targetIdx === _this._currIdx ) return

    modIdx = loopCfg ? ( ( targetIdx % allIdx + allIdx ) % allIdx ) : ( targetIdx > maxIdx ) ? maxIdx : ( targetIdx < 0 ) ? 0 : targetIdx
    
    if( !loopCfg && modIdx === _this._currIdx ) return

    loops = ( targetIdx - modIdx ) / allIdx

    currItemsL = -psItemsArr[ modIdx ]._psItemL
    _this._psD = -( currItemsL + psItemsArr[ _this._currIdx ]._psItemL - ( loops * loopW ) ) + _this._psX
    _this._psD += ( ( targetIdx > _this._currIdx ) && _this._psX < 0 ) ? loopW : 0

    _this._setStyle( psItems, {
      left: currItemsL + 'px'
    } )
    _this._animPos( cfg.duration )

    _this._setCurrIdx( modIdx )
    _this._currItemX = _this._psItemsArr[ modIdx ]._psItemX
  },

  _restoreDots: function() {
    var _this = this,
      dotsEl = _this._dotsEl

    if( !dotsEl ) return

    dotsEl.innerHTML = ''
    dotsEl.appendChild( _this._dotTpl.cloneNode( true ) )
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
    var _this = this

    _this._unbindEvents()
    _this._restoreDots()
    _this._restoreHtml()
    _this._inited = false
  }

} )
