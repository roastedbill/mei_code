import React from 'react';
import { shallow } from 'enzyme';
import { AudioTest } from '../../../src/features/examples';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<AudioTest />);
  expect(renderedComponent.find('.examples-audio-test').length).toBe(1);
});
