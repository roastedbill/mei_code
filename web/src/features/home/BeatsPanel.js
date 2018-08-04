import React, { Component } from 'react';
import PropTypes from 'prop-types';

import allBeats from '../../configs/beats.json';


let t0 = 0;


export default class BeatsPanel extends Component {
  static propTypes = {
    start: PropTypes.bool,
    index: PropTypes.number,
    difficulty: PropTypes.number
  };

  static defaultProps = {
    start: false,
    index: 1,
    difficulty: 2
  }

  audioRef = React.createRef();
  barRef   = React.createRef();
  scoreRef = React.createRef();

  state = {
    beats: allBeats.musics[this.props.index].beats.reduce((result, t, i) => {
      if(i % this.props.difficulty === 0) {
        return [ ...result, t ]
      }
      else return result;
    }, []),

    totalScore: 0,
    lastScore: 0,
    bestScore: 0
  }

  get url() {
    return "/files/" + allBeats.musics[this.props.index].file
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
      
      // trigger bar's flash animation
      const bar = this.barRef.current;
      if(bar) {
        bar.classList.add('hit');
        setTimeout(() => bar.classList.remove('hit'), 300);
      }
    }, duration);

    // schedule next beats
    let beats = this.state.beats;
    let t0 = beats[i] * 1000;
    let t1 = beats[i+1] * 1000;
    if(t1) setTimeout(() => this.createNewBeat(i+1, duration), t1-t0);
  }

  startFallingBeats() {
    const duration = 2000;
    this.createNewBeat(0, duration);
    setTimeout(() => this.audioRef.current.play(), duration);
    t0 = (new Date().getTime() + duration)/1000;
  }

  addScore(score) {
    this.setState({
      ...this.state,
      lastScore: score,
      totalScore: this.state.totalScore + score,
      bestScore: Math.max(this.state.bestScore, score)
    });

    this.scoreRef.current.classList.add('play');
    setTimeout(() => this.scoreRef.current.classList.remove('play'), 500);
  }

  componentDidMount() {
    this._container = document.getElementById('beats');
    document.addEventListener('keydown', e => this._onKeyDown(e));
  }

  componentDidUpdate(preProps) {
    if(!preProps.start && this.props.start) {
      this.startFallingBeats();
    }
  }

  _onKeyDown(e) {
    const dt = new Date().getTime()/1000 - t0;
    const range = 0.3;

    let score = Math.min( ...this.state.beats.map(t => Math.abs(t-dt)) )
    if(0 < score && score < range) {
      const finalScore = Math.round( ((range - score) * 1200 + 100)/10 )*10;
      this.addScore(finalScore);
    }
  }

  render() {
    return (
      <div className="home-beats-panel">

        <div className="wave">
          <img src="/images/soundwave.png"/>
          <img src="/images/soundwave.png"/>
        </div>

        {/* beats */}
        <div className="beats fill" id="beats"></div>

        {/* bottom bar */}
        <div className="bar">
          <div ref={this.barRef}><img style={{width:'360px'}} alt="" src="/images/light.png"/></div>
          <div><img style={{width:'360px', height:'2px'}} alt="" src="/images/bottom.png"/></div>
          <p>STRIKE BY TYPING</p>
        </div>

        <div className="totalScore">NOW: { this.state.totalScore }</div>
        <div className="currentScore" ref={this.scoreRef}>+ { this.state.lastScore }</div>
        <div className="bestScore">BEST: { this.state.bestScore }</div>

        <audio ref={this.audioRef} preload="auto" src={this.url}/>
      </div>
    );
  }
}
