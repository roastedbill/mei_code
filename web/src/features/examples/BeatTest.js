import React, { Component } from 'react';

import BeatsPanel from '../home/BeatsPanel';

export default class BeatTest extends Component {
  static propTypes = {

  };

  render() {
    return (
      <div className="examples-beat-test fill center">
        <BeatsPanel/>
      </div>
    );
  }
}
