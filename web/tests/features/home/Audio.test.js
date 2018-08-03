import React from 'react';
import { shallow } from 'enzyme';
import { Audio } from '../../../src/features/home';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<Audio />);
  expect(renderedComponent.find('.home-audio').length).toBe(1);
});
