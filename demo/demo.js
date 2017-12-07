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

  window['basicSwipers'] = basicSwipers
  window['noLoopSwipers'] = noLoopSwipers
  window['multiPerItemSwipers'] = multiPerItemSwipers
  window['noControlsSwipers'] = noControlsSwipers

} )