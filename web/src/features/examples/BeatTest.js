import React, { Component } from 'react';

import { Button } from 'antd';
import BeatsPanel from '../home/BeatsPanel';

export default class BeatTest extends Component {
  static propTypes = {

  };

  state = { start:false }

  render() {
    return (
      <div className="examples-beat-test fill center">
        <BeatsPanel start={this.state.start}/>
        <Button onClick={() => this.setState({...this.state, start:true})}>Start</Button>
      </div>
    );
  }
}
