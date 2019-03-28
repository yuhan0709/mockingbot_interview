import React, { Component } from 'react';
import {  Input, Form, } from 'antd';


const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider a={index} value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends Component {
  getInput = () => {
    if (this.props.cell) {
      if (typeof this.props.cell === 'function') {
        return this.props.cell(this.props);
      }
      return this.props.cell;
    }
    return <Input />;
  };

  render() {
    const {
      editing,
      record,
      getFieldDecorator,
      ...restProps
    } = this.props;
    return (
      <EditableContext.Consumer>
        {(form) => {
          return (
            <td {...restProps}>
              {editing ? (
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(form, record)(this.getInput())}
                </FormItem>
              ) : restProps.children}
            </td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
}

export default {
  row: EditableFormRow,
  cell: EditableCell,
};