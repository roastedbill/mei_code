import React, { Component } from 'react';
import PropTypes from 'prop-types';

import allBeats from '../../configs/beats.json';

const i = 1;
const next = 3;


export default class BeatsPanel extends Component {
  static propTypes = {
    index: PropTypes.number
  };

  audioRef = React.createRef();
  barRef = React.createRef();

  get beats() {
    return allBeats.musics[i].beats;
  }

  get url() {
    return "/files/" + allBeats.musics[i].file
  }

  createNewBeat(i, duration) {
    // add the beat element
    const beat = document.createElement('img');
    const left = Math.random() * 240;
    beat.className = 'beat';
    beat.style = 
      `left:${left}px;` + 
      `animation-duration: ${duration}ms;`;
    beat.src = '/images/beat.png';
    this._container.appendChild(beat);

    // remove after fallen
    setTimeout(() => {
      this._container.removeChild(beat);
      
      const bar = this.barRef.current;
      if(bar) {
        bar.classList.add('hit');
        setTimeout(() => bar.classList.remove('hit'), 300);
      }
    }, duration);

    // schedule next beats
    let beats = this.beats;
    let t0 = beats[i] * 1000;
    let t1 = beats[i+next] * 1000;
    if(t1) setTimeout(() => this.createNewBeat(i+1, duration), t1-t0);
  }

  startFallingBeats() {
    const duration = 2000;
    this.createNewBeat(0, duration);
    setTimeout(() => this.audioRef.current.play(), duration);
  }

  componentDidMount() {
    this._container = document.getElementById('beats');
  }

  _onAudioLoaded() {
    this.startFallingBeats();
  }

  render() {
    return (
      <div className="home-beats-panel">

        {/* beats */}
        <div className="beats fill" id="beats"></div>

        {/* bottom bar */}
        <div className="bar">
          <div ref={this.barRef}><img style={{width:'360px'}} alt="" src="/images/light.png"/></div>
          <div><img style={{width:'360px', height:'2px'}} alt="" src="/images/bottom.png"/></div>
          <p>STRIKE BY TYPING</p>
        </div>

        <audio 
          ref={this.audioRef} 
          preload="auto"
          src={this.url} 
          onCanPlayThrough={() => this._onAudioLoaded()}
        />
      </div>
    );
  }
}
