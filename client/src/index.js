import React from 'react';
import ReactDOM from 'react-dom';

// Create a new component.
  // This component should produce some HTML.
const myPromoter = function() {
  return <div>Welcome to MyPromoter!</div>;
}

// Take this component's generated HTML & render it on the DOM.

ReactDOM.render('<myPromoter/>', document.querySelector('.container'));


