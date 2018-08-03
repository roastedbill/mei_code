import React, { Component } from 'react';

import Audio from '../home/Audio';

export default class AudioTest extends Component {
  static propTypes = {

  };

  render() {
    return (
      <div className="examples-audio-test">
        <Audio index={0}/>
      </div>
    );
  }
}
