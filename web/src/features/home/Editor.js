import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import cls from 'classnames';
import * as actions from './redux/actions';

import * as monaco from 'monaco-editor'

import 'antd/dist/antd.css';
import { Modal, Button, Form, Switch } from 'antd';
import BeatsPanel from './BeatsPanel';

import * as beat from './beat/utils';

let welcomed = false;

let spoken = {};

export class Editor extends Component {
  static propTypes = {
    home: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  containerRef = React.createRef();
  narrativeVoiceRef = React.createRef();
  editor = null;

  state = {
    fontSize: 12,
    shake: true,
    game: false,
    gameStart: false,
    setting: false,

    characterStatus: {
      showWelcome: false,
      showGreeting: false,
      showMusic: false,
      showSyntaxError: false,
      showTestFail: false,
      showFinish: false,
      showPlayGame: false,
      mood: null
    },
    iconClassName: "goodDayIcon",
  }

  componentDidMount() {
    // need to delay a bit, otherwise the editor's height will be 0
    setTimeout(() => this._initEditor(), 0);
  }

  componentDidUpdate() {
    this.editor && this.editor.updateOptions(this.state);
  }

  async handleUploadMusic(event) {
    beat.handleFileUpload(event, (timestamps) => {
      console.log('handleUploadMusic got response', JSON.stringify(timestamps));
    });
  }

  clickFightingButton(flag) {
    if (this.state.characterStatus.showPlayGame) {
      this.setState({
        ...this.state,

        characterStatus: {
          ...this.state.characterStatus,
          showPlayGame: false,
        }
      });

      if (flag) {
        this.showGame();
      }
    }
  }

  get gameClassNames() {
    let classes = {
      'home-beats-panel': true,
      'visible': this.state.game
    }
    return classes;
  }

  showGame(show=true) {
    this.setState({ ...this.state, game:show });
  }

  toggleGame() {
    this.showGame(!this.state.game);
  }

  startGame() {
    this.setState({ ...this.state, gameStart:true });
  }

  playNarrative(src) {
    let el = this.narrativeVoiceRef.current;
    if(el && el.src !== src && !spoken[src]) {
      spoken[src] = true;
      el.src = src;
    }

  }

  render() {
    const {characterStatus, iconClassName} = this.state;

    let textBoxClassName = null;
    let textTitle = null;
    let textContent = null;
    let shouldShowIcon = true;
    let shouldShowButtons = false;
    let shouldShowInput = false;
    let mood = characterStatus.mood;

    if (characterStatus.showWelcome) {
      // 1. welcome
      textBoxClassName = 'Good';
      textTitle = "MOMO SAYS…";
      textContent = "Dear master, what a wonderful day! 😊";
      this.playNarrative('/musics/welcome.mp3');
    }
    else if (characterStatus.showGreeting) {
      // 2. (wait 10s, no interaction required) greeting, show input
      textBoxClassName = 'Good';
      textTitle = "MOMO SAYS…";
      textContent = "I'm always readily available to serve. How are you doing today? 🤔️";
      shouldShowInput = true;
      this.playNarrative('/musics/greeting.mp3');
    }
    else if (characterStatus.showMusic) {
      // 3. play music
      textBoxClassName = 'Good';
      textTitle = "MOMO SAYS…";
      textContent = "This is my recommended song, hope it cheers you up ❤️";
      this.playNarrative('/musics/music_suggestion.mp3');
    }
    else if (characterStatus.showSyntaxError) {
      // 4. show syntax error
      textBoxClassName = 'Bad';
      textTitle = "TANTAN SAYS…";
      textContent = "Are you kidding me? You this piece of rubbish! You can't even complete something so simple. 👿";
      this.playNarrative('/musics/syntax_error.mp3');
    }
    // else if (!characterStatus.showFinish) {
    //   // 5. save
    //   textBoxClassName = 'Good';
    //   textTitle = "MOMO SAYS…";
    //   textContent = "You are so fabulous, I like you so much 😘";
    // }
    else if (characterStatus.showTestFail) {
      // 5. show run error alert
      textBoxClassName = 'Bad';
      textTitle = "TANTAN SAYS…";
      textContent = "For the last time, do not repeat such foolish mistake. 👿";
      this.playNarrative('/musics/test_fail.mp3');
    }
    else if (characterStatus.showPlayGame) {
      // 6. show play game modal
      textBoxClassName = 'Good';
      textTitle = "TANTAN SAYS…";
      textContent = "You are a genius, dear master. Can you play game with me? Pls Pls 🙏";
      shouldShowButtons = true;
      this.playNarrative('/musics/play_game.mp3');
    } else {
      shouldShowIcon = false;
    }

    return (
      <div className="home-editor fill vbox">

        <div className="controls hbox">
          {/* <input type="file" onChange={this.handleUploadMusic} /> */}
          <div className="fat"></div>
          <Button onClick={() => this.toggleGame()}>Game</Button>
          <Button onClick={() => this.run()}>Run</Button>
          <Button onClick={() => this.openSettingPanel(true)}>Settings</Button>
        </div>

        <div ref={this.containerRef} className="editor fat"/>

        <BeatsPanel
          className={this.gameClassNames}
          start={this.state.game}
        />

        <div>
          <div className={`textBox ${shouldShowIcon ? `textBox${textBoxClassName} textVisible` : ''}`}>
            
            <div className={`${shouldShowIcon ? `textTitle${textBoxClassName}` : ''}`}>{textTitle}</div>

            <div className={'textContent'}>{textContent}</div>

            {characterStatus.showGreeting && (
              <div className="input">
                <input className="moodInput" placeholder="How are you feeling now?" onKeyDown={e => {
                  if(e.keyCode === 13) {
                    e.preventDefault();
                    this.setState({
                      ...this.state,
                      characterStatus: {
                        ...this.state.characterStatus,
                        showGreeting: false,
                        showMusic: true,
                        mood: e.target.value
                      }
                    })
                  }
                }}/>
              </div>
            )}

            {shouldShowButtons && (
              <div className="buttons">
                <div className='btnYes' onClick={() => this.clickFightingButton(true)}>Yes Please</div>
                <div className='btnNo' onClick={() => this.clickFightingButton(false)}>No Thanks</div>
              </div>
            )}
          </div>
          <div className={`icon ${iconClassName} ${shouldShowIcon ? 'iconVisible' : ''}`} />
        </div>

        {/* setting panel */}
        <Modal
          title="Setting"
          visible={this.state.setting}
          onOk={() => this._onSettingOk()}
          onCancel={() => this._onSettingCancel()}
        >
          <Form>
            <Form.Item label="Shake">
              <Switch checked={this.state.shake} onChange={checked => this.enableShaking(checked)}/>
            </Form.Item>
          </Form>
        </Modal>

        <audio ref={this.narrativeVoiceRef} autoPlay/>
      </div>
    );
  }

  openSettingPanel(open=true) {
    this.setState({ ...this.state, setting:open });
  }

  enableShaking(enable=true) {
    this.setState({ ...this.state, shake:enable });
  }

  changeFontSize({value=0, delta=0}={}) {
    if(delta) {
      this.setState({
        ...this.state,
        fontSize: this.state.fontSize + delta
      })
    }
    else if(value) {
      this.setState({
        ...this.state,
        fontSize: value
      })
    }
  }

  shake() {
    const el = this.containerRef.current;
    if(el) {
      el.classList.add('shake');
      setTimeout(() => el.classList.remove('shake'), 200);
    }
  }

  run() {
    const script = this.editor.getValue().trim();

    try {
      eval(script);

      this.setState({
        ...this.state,

        characterStatus: {
          ...this.state.characterStatus,
          showWelcome: false,
          showGreeting: false,
          showMusic: false,
          showSyntaxError: false,
          showTestFail: false,
          showFinish: false,
          showPlayGame: true,
        },
        iconClassName: "successIcon",
      })
    }
    catch(e) {
      this.setState({
        ...this.state,
        characterStatus: {
          showWelcome: false,
          showGreeting: false,
          showMusic: false,
          showSyntaxError: true,
          showTestFail: false,
          showFinish: false,
          showPlayGame: false,
        },
        iconClassName: "errorIcon",
      });
    }

  }

  _initEditor() {
    const el = this.containerRef.current;

    // validation settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false
    });

    // compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES6,
      allowNonTsExtensions: true
    });

    // create the editor
    this.editor = monaco.editor.create(el, {
      value: '',
      language: 'javascript',
      theme: 'vs-dark',
      fontSize: this.state.fontSize
    });
    window.editor = this.editor;

    this._widgets = [];

    // get error/warning/... markers
    const setModelMarkers = monaco.editor.setModelMarkers;
    monaco.editor.setModelMarkers = (model, owner, markers) => {
      setModelMarkers.call(monaco.editor, model, owner, markers);

      let {showWelcome, showGreeting, showMusic} = this.state.characterStatus;
      if(!showWelcome && !showGreeting && !showMusic) {
        if (markers && markers.length > 0 ) {
          // create new widget
          this.setState({
            ...this.state,
            characterStatus: {
              showWelcome: false,
              showGreeting: false,
              showMusic: false,
              showSyntaxError: true,
              showTestFail: false,
              showFinish: false,
              showPlayGame: false,
            },
            iconClassName: "errorIcon",
          });
        }
        else
        {
          this.setState({
            ...this.state,
            characterStatus: {
              ...this.state.characterStatus,
              showSyntaxError: false,
            }
          });
        }
      }
    }

    el.addEventListener('keydown', this._onKeyDown.bind(this));
  }

  _onKeyDown(e) {
    if(this.state.shake) {
      this.shake();
    }

    if (!welcomed) {
      welcomed = true;
      this.setState({
        ...this.state,
        characterStatus: {
          ...this.state.characterStatus,
          showWelcome: true,
        }
      })
    }

    else if (this.state.characterStatus.showWelcome) {
      this.setState({
        ...this.state,
        characterStatus: {
          ...this.state.characterStatus,
          showWelcome: false,
          showGreeting: true,
        },
        iconClassName: "fightingIcon",
      })
    }
    else if(this.state.characterStatus.showMusic) {
      setTimeout(() => {
        this.setState({
          ...this.state,
          characterStatus: {
            ...this.state.characterStatus,
            showMusic: false
          },
          iconClassName: null
        })
      }, 1000);
    }

    // // Cmd + P
    // if(e.keyCode === 80 && e.metaKey) {
    //   e.preventDefault();
    //   this.editor.trigger('anyString', 'editor.action.quickCommand')
    // }
    // else if(e.keyCode === 187 && e.metaKey) {
    //   e.preventDefault();
    //   this.changeFontSize({delta:+2});
    // }
    // else if(e.keyCode === 189 && e.metaKey) {
    //   e.preventDefault();
    //   this.changeFontSize({delta:-2});
    // }
    // else if(e.keyCode === 48 && e.metaKey) {
    //   e.preventDefault();
    //   this.changeFontSize({value:12});
    // }
    // else if (e.keyCode === 83 && e.metaKey) {
    //   e.preventDefault();
    //   if (!this.state.characterStatus.showSyntaxError) {
    //     this.setState({
    //       ...this.state,
    //       characterStatus: {
    //         showFinish: true,
    //       },
    //       iconClassName: "successIcon"
    //     })
    //   }
    // }
  }

  _onSettingOk() {
    this.openSettingPanel(false);
  }

  _onSettingCancel() {
    this.openSettingPanel(false);
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    home: state.home,
  };
}

/* istanbul ignore next */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...actions }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor);
