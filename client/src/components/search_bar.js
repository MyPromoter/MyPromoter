// Search-Bar Component for myTube //

import React, { Component } from 'react';
// OR //
// import React from 'react'; //
// const Component = React.Component; //

// Define a new Class Component called "SearchBar", & give it access to all functionality from the React.Component Class
// Every Class MUST have a render() which returns JSX //

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = { searchInput: '' };
  }

  render() {
    return (
      <div>
        <input
          value={this.state.searchInput}
          onChange={event => this.setState({ searchInput: event.target.value })} />
      </div>
    );
  }
}

// To render this SearchBar, index.js must have access to this component //
export default SearchBar;