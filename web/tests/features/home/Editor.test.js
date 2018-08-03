import React from 'react';
import { shallow } from 'enzyme';
import { Editor } from '../../../src/features/home/Editor';

describe('home/Editor', () => {
  it('renders node with correct class name', () => {
    const props = {
      home: {},
      actions: {},
    };
    const renderedComponent = shallow(
      <Editor {...props} />
    );

    expect(
      renderedComponent.find('.home-editor').length
    ).toBe(1);
  });
});
