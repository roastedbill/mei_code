import React from 'react';
import { shallow } from 'enzyme';
import { Sprite } from '../../../src/features/home';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<Sprite />);
  expect(renderedComponent.find('.home-sprite').length).toBe(1);
});
