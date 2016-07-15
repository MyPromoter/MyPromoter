// Import React & ReactDOM //
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// End Import React & ReactDOM //

// Save YouTube API_KEY & Import Module //
const API_KEY = 'AIzaSyCeNq13ZJ4p0ImDlD9dyC74eqWdkvIOBgo';
import YTSearch from 'youtube-api-search';
// End YouTube API_KEY & Import Module //

// Import Components //
import SearchBar from './components/search_bar';
import VideoList from './components/video_list';
import VideoDetail from './components/video_detail';
// End Import Components //


// YTSearch Example /
// End YTSearch Example //

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      videos: [],
      selectedVideo: null
    };

    YTSearch({key: API_KEY, term: 'Young Thug'}, (searchResults) => {
      this.setState({
        videos: searchResults,
        selectedVideo: searchResults[0]
      });
    });
  }

  render() {
    return (
      <div>
        <SearchBar />
        <VideoDetail video={this.state.selectedVideo}/>
        <VideoList
          onVideoSelect={ (selectedVideo) => this.setState({selectedVideo: selectedVideo})}
          videos={this.state.videos} />
      </div>
    );
  }
};

ReactDOM.render(<App />, document.querySelector('.container'));



