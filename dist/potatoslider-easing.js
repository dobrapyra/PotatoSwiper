/**
 * PotatoSlider Easing pack
 * Author dobrapyra (Michał Zieliński)
 */

PotatoSlider.prototype._easing = Object.assign( PotatoSlider.prototype._easing, {

  linear: function( f ) {
    return f
  },

  easeInQuad: function( f ) {
    return f * f
  },

  easeOutQuad: function( f ) {
    f = 1 - f
    return 1 - ( f * f )
  },

  easeInOutQuad: function( f ) {
    f *= 2
    if( f <= 1 ) {
      return ( f * f ) / 2
    } else {
      f = 2 - f
      return 1 - ( ( f * f ) / 2 )
    }
  },

  easeInCubic: function( f ) {
    return f * f * f
  },

  easeOutCubic: function( f ) {
    f = 1 - f
    return 1 - ( f * f * f )
  },

  easeInOutCubic: function( f ) {
    f *= 2
    if( f <= 1 ) {
      return ( f * f * f ) / 2
    } else {
      f = 2 - f
      return 1 - ( ( f * f * f ) / 2 )
    }
  },

  easeInQuart: function( f ) {
    return f * f * f * f
  },

  easeOutQuart: function( f ) {
    f = 1 - f
    return 1 - ( f * f * f * f )
  },

  easeInOutQuart: function( f ) {
    f *= 2
    if( f <= 1 ) {
      return ( f * f * f * f ) / 2
    } else {
      f = 2 - f
      return 1 - ( ( f * f * f * f ) / 2 )
    }
  }

} )
