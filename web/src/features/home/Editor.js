import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from './redux/actions';

import * as monaco from 'monaco-editor'

import 'antd/dist/antd.css';
import { Modal, Button, Form, Switch } from 'antd';
import BeatsPanel from './BeatsPanel';

import * as beat from './beat/utils';

export class Editor extends Component {
  static propTypes = {
    home: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  containerRef = React.createRef();
  editor = null;

  state = {
    fontSize: 12,
    shake: true,
    setting: false,
    characterStatus: {
      showError: false,
      showSuccess: false,
      showWelcome: false,
      showFighting: false,
    },
    characterSize: 0,
    characterIcon: null,
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

  render() {
    const {characterStatus, characterSize, characterIcon} = this.state;

    let textBoxClassName = null;
    let textTitle = null;
    let shouldShowIcon = true;
    if (!!characterStatus.showError) {
      textBoxClassName = 'Bad';
      textTitle = "TANTAN SAYS…";
    } else if (!!characterStatus.showSuccess) {
      // characterIcon = "images/loveyou.png";
      textBoxClassName = 'Good';
      textTitle = "TANTAN SAYS…";
    } else if (!!characterStatus.showWelcome) {
      // characterIcon = "images/goodday.png";
      textBoxClassName = 'Good';
      textTitle = "TANTAN SAYS…";
    } else if (!!characterStatus.showFighting) {
      // characterIcon = "images/comeon.png";
      textBoxClassName = 'Good';
      textTitle = "TANTAN SAYS…";
    } else {
      shouldShowIcon = false;
    }

    return (
      <div className="home-editor fill vbox">

        <div className="controls hbox">
          {/* <input type="file" onChange={this.handleUploadMusic} /> */}
          <div className="fat"></div>
          <Button onClick={() => this.run()}>Run</Button>
          <Button onClick={() => this.openSettingPanel(true)}>Settings</Button>
        </div>

        <div ref={this.containerRef} className="editor fat"/>

        <BeatsPanel/>

        <div>
          <div className={`textBox ${shouldShowIcon ? `textBox${textBoxClassName} textVisible` : ''}`}>
            <div className={`${shouldShowIcon ? `textTitle${textBoxClassName}` : ''}`}>
            {textTitle}
            </div>
            <div className={'textContent'}>
            Could you give me an example of the improvements you have mentioned?<br/>
            This painting is a marvellous example of her work.
            </div>
          </div>
          <div className={`characterIcon ${shouldShowIcon ? 'characterVisible' : ''}`}>
            <img width={characterSize} height={characterSize} src={characterIcon} />
          </div>
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
    const script = this.editor.getValue();
    try {
      eval(script);
      Modal.success({
        title: 'Congratulations!',
        content: 'Your code run successfully!!'
      })
    }
    catch(e) {
      Modal.error({
        title: '-__-',
        content: e.toString()
      })
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
      value: 'console.log("Hello, wo"rld")',
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
      if (markers && markers.length > 0) {
        // create new widget
        this.setState({
          characterStatus: {
            ...this.state.characterStatus,
            showError: true,
          },
          characterSize: 444,
          characterIcon: "images/evil.png",
        });
        // // clear all widgets
        // this._widgets.forEach(widget => {
        //   this.editor.removeContentWidget(widget);
        // });
        //
        // // get position of last error of each line
        // const positions = markers.reduce(([lastLine, ...rest], marker) => {
        //   if(!lastLine) {
        //     return [ {line:marker.endLineNumber, column:marker.endColumn}, ...rest ];
        //   }
        //   else if(lastLine.line !== marker.endLineNumber) {
        //     return [ {line:marker.endLineNumber, column:marker.endColumn}, lastLine, ...rest ];
        //   }
        //   else if(lastLine.column < marker.endColumn) {
        //     return [ {line:marker.endLineNumber, column:marker.endColumn}, ...rest ];
        //   }
        //   else {
        //     return [ lastLine, ...rest ]
        //   }
        // }, []).reverse();
        //
        // // create new widget
        // this._widgets = positions.map(({line, column}) => {
        //   const widget = {
        //     domNode: null,
        //     getId: () => `widget-${line}-${column}`,
        //     getDomNode: function() {
        //       if (!this.domNode) {
        //         this.domNode = document.createElement('div');
        //         this.domNode.className = 'errorWidget';
        //         this.domNode.innerHTML = '<img width=444 height=444 src="images/evil.png" />';
        //       }
        //       return this.domNode;
        //     },
        //     getPosition: () => ({
        //       position: {
        //         lineNumber: line,
        //         column: column
        //       },
        //       preference: [
        //         monaco.editor.ContentWidgetPositionPreference.BELOW
        //       ]
        //     })
        //   }
        //
        //   this.editor.addContentWidget(widget);
        //   return widget;
        // })
      }
      else
      {
        console.log('fixed errors');
        this.setState({
          characterStatus: {
            ...this.state.characterStatus,
            showError: false,
          }
        });
      }
    }

    el.addEventListener('keydown', this._onKeyDown.bind(this));
  }

  _onKeyDown(e) {
    if(this.state.shake) {
      this.shake();
    }

    // Cmd + P
    if(e.keyCode === 80 && e.metaKey) {
      e.preventDefault();
      this.editor.trigger('anyString', 'editor.action.quickCommand')
    }
    else if(e.keyCode === 187 && e.metaKey) {
      e.preventDefault();
      this.changeFontSize({delta:+2});
    }
    else if(e.keyCode === 189 && e.metaKey) {
      e.preventDefault();
      this.changeFontSize({delta:-2});
    }
    else if(e.keyCode === 48 && e.metaKey) {
      e.preventDefault();
      this.changeFontSize({value:12});
    }
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
