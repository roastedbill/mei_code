import React from 'react';
import { shallow } from 'enzyme';
import { BeatsPanel } from '../../../src/features/home';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<BeatsPanel />);
  expect(renderedComponent.find('.home-beats-panel').length).toBe(1);
});
