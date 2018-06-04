function ready(fn) {
  if( document.attachEvent ? document.readyState === '"complete' : document.readyState !== 'loading' ) {
    fn()
  } else {
    document.addEventListener( 'DOMContentLoaded', fn )
  }
}

ready( function() {

  var basicSwipers = new PotatoSwiper( document.querySelectorAll( '.slider__items--basic' ), {
    loop: true,
    selector: {
      prev: '.slider__nav--prev',
      next: '.slider__nav--next',
      dot: '.slider__dot'
    },
    class: {
      activeDot: 'slider__dot--active'
    },
    gap: 20,
    items: 1,
    rwd: {
      420: {
        items: 2
      },
      640: {
        items: 3
      },
      960: {
        items: 4
      }
    }
  } )

  var noLoopSwipers = new PotatoSwiper( document.querySelectorAll( '.slider__items--noLoop' ), {
    loop: false,
    selector: {
      prev: '.slider__nav--prev',
      next: '.slider__nav--next',
      dot: '.slider__dot'
    },
    class: {
      activeDot: 'slider__dot--active'
    },
    gap: 15,
    items: 1,
    rwd: {
      520: {
        items: 2
      },
      960: {
        items: 3
      }
    }
  } )

  var multiPerItemSwipers = new PotatoSwiper( document.querySelectorAll( '.slider__items--perItem' ), {
    loop: true,
    selector: {
      prev: '.slider__nav--prev',
      next: '.slider__nav--next',
      dot: '.slider__dot',
      large: '.slider__item--large'
    },
    class: {
      activeDot: 'slider__dot--active'
    },
    items: 1,
    perItem: 1,
    rwd: {
      420: {
        items: 2
      },
      640: {
        items: 3,
        perItem: 2,
      },
      960: {
        items: 4,
        perItem: 2,
      }
    }
  } )

  var noControlsSwipers = new PotatoSwiper( document.querySelectorAll( '.slider__items--noControls' ), {
    loop: true,
    gap: 20,
    items: 1,
    rwd: {
      420: {
        items: 2
      },
      640: {
        items: 3
      },
      960: {
        items: 4
      }
    }
  } )

  var handlersSwipers = new PotatoSwiper( document.querySelectorAll( '.slider__items--handlers' ), {
    loop: true,
    selector: {
      prev: '.slider__nav--prev',
      next: '.slider__nav--next',
      dot: '.slider__dot'
    },
    class: {
      activeDot: 'slider__dot--active'
    },
    gap: 20,
    padding: 60,
    items: 1,
    rwd: {
      420: {
        items: 2
      },
      640: {
        items: 3
      },
      960: {
        items: 4
      }
    },
    handlers: {
      onChange: function( index ){ console.log('change '+index) },
      onChanged: function( index ){ console.log('changed '+index) },
      onDragStart: function( x ){ console.log('drag start '+x) },
      onDragMove: function( x ){ console.log('drag move '+x) },
      onDragEnd: function( x ){ console.log('drag end '+x) },
      onInit: function( index ){ console.log('init '+index) },
      onInited: function( index ){ console.log('inited '+index) },
      onDestroy: function( index ){ console.log('destroy '+index) },
      onDestroyed: function( index ){ console.log('destroyed '+index) }
    }
  } )

  window['basicSwipers'] = basicSwipers
  window['noLoopSwipers'] = noLoopSwipers
  window['multiPerItemSwipers'] = multiPerItemSwipers
  window['noControlsSwipers'] = noControlsSwipers
  window['handlersSwipers'] = handlersSwipers

} )