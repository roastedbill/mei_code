import React, { Component } from 'react';

export default class BeatsPanel extends Component {
  static propTypes = {

  };

  createNewBeat(duration) {
    const beat = document.createElement('img');
    const left = Math.random() * 240;
    beat.className = 'beat';
    beat.style=`left:${left}px; animation:falling ${duration}ms`;
    beat.src = '/images/beat.png';
    this._container.appendChild(beat);

    setTimeout(() => this._container.removeChild(beat), duration);

    const nextDuration = Math.random() * 1000 + 500;
    const delay = Math.random() * 1000;
    setTimeout(() => this.createNewBeat(nextDuration), delay);
  }

  componentDidMount() {
    this._container = document.getElementById('beats');
    this.createNewBeat(2000);
  }

  render() {
    return (
      <div className="home-beats-panel">

        {/* beats */}
        <div className="beats fill" id="beats"></div>

        {/* bottom bar */}
        <div className="bar">
          <div><img style={{width:'360px'}} alt="" src="/images/light.png"/></div>
          <div><img style={{width:'360px', height:'2px'}} alt="" src="/images/bottom.png"/></div>
          <p>STRIKE BY TYPING</p>
        </div>
      </div>
    );
  }
}
