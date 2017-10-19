function ready(fn) {
  if( document.attachEvent ? document.readyState === '"complete' : document.readyState !== 'loading' ) {
    fn()
  } else {
    document.addEventListener( 'DOMContentLoaded', fn )
  }
}

ready( function() {

  window['psSlider'] = new PotatoSlider( document.querySelector( '.slider' ), {
    loop: true,
    autoWidth: true
    // items: 3,
    // perItem: 2
  } )

} )