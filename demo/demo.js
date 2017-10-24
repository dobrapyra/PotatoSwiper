function ready(fn) {
  if( document.attachEvent ? document.readyState === '"complete' : document.readyState !== 'loading' ) {
    fn()
  } else {
    document.addEventListener( 'DOMContentLoaded', fn )
  }
}

ready( function() {

  window['psSlider'] = new PotatoSwiper( document.querySelectorAll( '.slider__items' ), {
    loop: true,
    prevSelector: '.slider__nav--prev',
    nextSelector: '.slider__nav--next',
    // autoWidth: true
    // items: 3,
    // perItem: 2
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

} )