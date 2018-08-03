import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import * as beat from './beat/utils';

import Editor from './Editor';

export class DefaultPage extends Component {
  static propTypes = {
    home: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  async handleUploadMusic(event) {
    beat.handleFileUpload(event, (timestamps) => {
      console.log('handleUploadMusic got response', timestamps);
    });
  }

  render() {
    return (
      <div className="home-default-page">
        <Editor />
        {
          // <input type="file" onChange={this.handleUploadMusic} />
        }
      </div>
    );
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
    actions: bindActionCreators({ ...actions }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DefaultPage);
