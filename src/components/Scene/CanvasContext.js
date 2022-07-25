import React from 'react';


const CanvasContext = React.createContext(null);


 const withCanvas = Component => props => (
  <CanvasContext.Consumer>
    {canvas => <Component {...props} CanvasPrimary={canvas} />}
  </CanvasContext.Consumer>
);

export { CanvasContext, withCanvas};