import React from 'react';
import { shallow } from 'enzyme';
import { BeatTest } from '../../../src/features/examples';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<BeatTest />);
  expect(renderedComponent.find('.examples-beat-test').length).toBe(1);
});
