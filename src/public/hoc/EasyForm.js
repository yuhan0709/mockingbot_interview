/**
 * EasyForm高阶组件
 * 为组件context中插入props.form
 * 配合EasyFormItem组件 快速绑定表单
 */
import PropTypes from 'prop-types';
import { Form } from 'antd';
import getDisplayName from '../util/getDisplayName';

export default (createOption) => (WrappedComponent) => {

  class EasyFormHOC extends WrappedComponent {
    getChildContext() {
      return {
        form: this.props.form
      };
    }
    static displayName = `EasyFormHOC(${getDisplayName(WrappedComponent)})`
  }
  EasyFormHOC.childContextTypes = {
    form: PropTypes.object
  };
  const CreateEasyFormHOC = Form.create(createOption)(EasyFormHOC);
  return CreateEasyFormHOC;
};
