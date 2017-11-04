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
    prevSelector: '.slider__nav--prev',
    nextSelector: '.slider__nav--next',
    dotSelector: '.slider__dot',
    class: {
      activeDot: 'slider__dot--active'
    },
    // autoWidth: true
    // items: 3,
    // perItem: 2
    // duration: 2000,
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

  var multiPerItemSwipers = new PotatoSwiper( document.querySelectorAll( '.slider__items--perItem' ), {
    loop: true,
    prevSelector: '.slider__nav--prev',
    nextSelector: '.slider__nav--next',
    dotSelector: '.slider__dot',
    class: {
      activeDot: 'slider__dot--active'
    },
    items: 1,
    perItem: 1,
    largeSelector: '.slider__item--large',
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

} )