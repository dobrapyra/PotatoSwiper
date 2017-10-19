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

/**
 * PotatoSlider Core
 */

var PotatoSlider = function( rootEl, cfg ) { this.preInit( rootEl, cfg ) }

PotatoSlider.prototype = Object.assign( PotatoSlider.prototype, {

  preInit: function( rootEl, cfg ) {
    rootEl.PotatoSlider = this

    this._rootEl = rootEl
    this._itemsArr = this._getItemsArr( rootEl )

    this._cfg = Object.assign( {
      nameSpace: 'potatoSlider',
      autoInit: true,
      loop: true,
      items: 1,
      perItem: 1,
      autoWidth: false,
      largeSize: 2,
      largeSelector: '[data-ps-large]'
    }, cfg )

    if( this._cfg.autoWidth ) this._cfg = Object.assign( this._cfg, {
      items: 1,
      perItem: 1
    } )

    if( this._cfg.autoInit ) this.init()
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
    this._bindEvents()
  },

  _prepareHtml: function() {
    var cfg = this._cfg,
      rootEl = this._rootEl,
      itemsArr = this._itemsArr,
      i = 0, l = itemsArr.length,
      itemEl, psItem,
      itemElW, psItemW,
      rootW, allW = 0,
      itemsCount = 0

    this._psItemsArr = []

    this._setStyle( rootEl, {
      overflow: 'hidden',
      height: 0
    } )

    rootW = rootEl.getBoundingClientRect().width

    this._psRoot = this._createEl( 'div', '', {
      position: 'relative'
    } )

    this._psWrap = this._createEl( 'div', '__wrap', {
      position: 'relative',
      overflow: 'hidden'
    }, this._psRoot )

    this._psItems = this._createEl( 'div', '__items', {
      position: 'relative'
    }, this._psWrap )
    
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
        psItem = this._createEl( 'div', '__item', {
          position: 'relative',
          display: 'inline-block',
          verticalAlign: 'middle',
          top: 0,
          left: 0,
          width: psItemW + 'px'
        }, this._psItems )

        this._psItemsArr.push( psItem )
        allW += psItemW
      }

      this._setStyle( itemEl, {
        position: 'relative',
        top: 0,
        left: 0,
        width: itemElW,
        float: 'none'
      } )
      psItem.appendChild( itemEl )

      if( this._isLarge( itemEl ) ) {
        itemsCount += 2
      } else {
        itemsCount++
      }
    }

    this._setStyle( this._psItems, {
      width: allW + 'px'
    } )

    this._setStyle( rootEl, {
      overflow: '',
      height: ''
    } )

    this._rootEl.appendChild( this._psRoot )
  },

  _isLarge: function( itemEl ) {
    return itemEl.matches( this._cfg.largeSelector )
  },

  _bindEvents: function() {
    var _this = this

    this._addEvent( window, 'resize', function(){

      clearTimeout( _this._resizeTimeout )
      _this._resizeTimeout = setTimeout( function(){
        _this.refresh()
      }, 200 )
    } )
  },

  _unbindEvents: function() {
    this._removeEvent( window, 'resize' )
  },

  refresh: function() {
    this.destroy()
    this.init()
  },

  _addEvent: function( el, eventName, fn ) {
    el._psEvents = el._psEvents || {}
    if( el._psEvents[ eventName ] ) this._removeEvent( el, eventName )

    el._psEvents[ eventName ] = fn

    el.addEventListener( eventName, el._psEvents[ eventName ] )
  },
  
  _removeEvent: function( el, eventName ) {
    if( !el._psEvents || el._psEvents[ eventName ] ) return

    el.removeEventListener( eventName, el._psEvents[ eventName ] )
  },

  next: function() {

  },

  prev: function() {

  },

  _createEl: function( selector, elClassSuffix, styleObj, parentEl ) {
    var el = document.createElement( selector )

    el.setAttribute( 'class', this._cfg.nameSpace + elClassSuffix )
    this._setStyle( el, styleObj )

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

  _restoreHtml: function() {
    var itemsArr = this._itemsArr,
      i = 0, l = itemsArr.length,
      itemEl

    for( ; i < l; i++ ) {
      itemEl = itemsArr[ i ]

      this._setStyle( itemEl, {
        position: '',
        top: '',
        left: '',
        width: '',
        float: ''
      } )

      this._rootEl.appendChild( itemEl )
    }

    this._rootEl.removeChild( this._psRoot )
  },

  destroy: function() {
    this._unbindEvents()
    this._restoreHtml()
  }

} )
