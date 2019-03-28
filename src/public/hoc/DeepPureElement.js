import lodash from 'lodash';
import getDisplayName from '../util/getDisplayName';

export default (WrappedComponent) => {
  return class DeepPureElementHOC extends WrappedComponent {
    shouldComponentUpdate(nextProps, nextState) {
      if (this.state !== nextState) return true;
      const isEquel = lodash.isEqual(this.props, nextProps);
      return !isEquel;
    }
    static displayName = `DeepPureElementHOC(${getDisplayName(WrappedComponent)})`
  };
};