import React from 'react';
import TreeNodeTitle from '../../src/app/vadmin/component/TreeNodeTitle';
import renderer from 'react-test-renderer';

describe('TreeNodeTitle组件', () => {
  it('渲染测试', () => {
    const component = renderer.create(
      <TreeNodeTitle/>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});