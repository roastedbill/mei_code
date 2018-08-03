import React, { Component } from 'react';
import PropTypes from 'prop-types';

import musics from '../../configs/musics.json';

export default class Audio extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired
  };

  get config() {
    return musics.items[this.props.index];
  }

  render() {
    return (
      <audio controls>
        <source src={ this.config.mp4 } type="audio/mp3"/>
        <source src={ this.config.ogg } type="audio/ogg"/>
      </audio>
    );
  }
}
