import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from './redux/actions';

import * as monaco from 'monaco-editor'

export class Editor extends Component {
  static propTypes = {
    home: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  containerRef = React.createRef();
  editor = null;
  state = {
    fontSize: 12
  }

  componentDidMount() {
    // need to delay a bit, otherwise the editor's height will be 0
    setTimeout(() => this._initEditor(), 0);
  }

  componentDidUpdate() {
    this.editor && this.editor.updateOptions(this.state);
  }

  render() {
    return (
      <div ref={this.containerRef} className="home-editor fill"></div>
    );
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

  _initEditor() {
    const el = this.containerRef.current;

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
      if(markers) {

        // clear all widgets
        this._widgets.forEach(widget => {
          this.editor.removeContentWidget(widget);
        });

        // get position of last error of each line
        const positions = markers.reduce(([lastLine, ...rest], marker) => {
          if(!lastLine) {
            return [ {line:marker.endLineNumber, column:marker.endColumn}, ...rest ];
          }
          else if(lastLine.line !== marker.endLineNumber) {
            return [ {line:marker.endLineNumber, column:marker.endColumn}, lastLine, ...rest ];
          }
          else if(lastLine.column < marker.endColumn) {
            return [ {line:marker.endLineNumber, column:marker.endColumn}, ...rest ];
          }
          else {
            return [ lastLine, ...rest ]
          }
        }, []).reverse();

        // create new widget
        this._widgets = positions.map(({line, column}) => {
          const widget = {
            domNode: null,
            getId: () => `widget-${line}-${column}`,
            getDomNode: function() {
              if (!this.domNode) {
                this.domNode = document.createElement('div');
                this.domNode.className = 'errorWidget';
                this.domNode.innerHTML = '<img src="https://tu.jiuwa.net/pic/20171129/1511964433976429.gif"/>';
              }
              return this.domNode;
            },
            getPosition: () => ({
              position: {
                lineNumber: line,
                column: column
              },
              preference: [
                monaco.editor.ContentWidgetPositionPreference.BELOW
              ]
            })
          }

          this.editor.addContentWidget(widget);
          return widget;
        })
      }
    }

    el.addEventListener('keydown', this._onKeyDown.bind(this));
  }

  _onKeyDown(e) {
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