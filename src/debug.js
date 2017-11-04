function debug( message ) {
  var logWin, logItems, logItem, overLimit

  logItems = document.getElementsByClassName('logItems')
  if( !logItems.length ) {

    logWin = document.createElement('div')
    logWin.setAttribute( 'class', 'logWin' )
    Object.assign( logWin.style, {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      overflow: 'auto',
      backgroundColor: '#000',
      color: '#fff',
      fontSize: '10px',
      lineHeight: '12px',
      zIndex: 1000
    } )
    document.getElementsByTagName('body')[0].appendChild( logWin )

    logItems = document.createElement('div')
    logItems.setAttribute( 'class', 'logItems' )
    Object.assign( logItems.style, {
      padding: '0 4px'
    } )
    logWin.appendChild( logItems )

  } else {

    logItems = logItems[0]
    logWin = document.getElementsByClassName('logWin')[0]

  }

  logItem = document.createElement('div')
  logItem.setAttribute( 'class', 'logItem' )
  logItem.innerText = message
  logItems.appendChild( logItem )

  overLimit = logItems.children.length - 20

  for( ; overLimit > 0; overLimit-- ) {
    logItems.removeChild( logItems.children[0] )
  }

  logWin.scrollTop = logWin.scrollHeight
}