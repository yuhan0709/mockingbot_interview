
import React, { Component } from 'react';
import {  Select, Input, InputNumber, Form, } from 'antd';

const Option = Select.Option;

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
    let { inputtype, editable, dropdownmatchselectwidth } = this.props;
    switch (inputtype.Type) {
    case 'enum':
      return <Select showSearch style={{ width: 100 }} disabled={editable === '0'} dropdownMatchSelectWidth={dropdownmatchselectwidth === '1'}>
        {inputtype.List.map(ele => {
          return <Option key={ele.Value} value={ele.Value}>{ele.DisplayName}</Option>;
        })}
      </Select>;
    case 'input:int':
      return <InputNumber precision={0} disabled={editable === '0'} min={0} />;
    case 'input:double':
      return <InputNumber disabled={editable === '0'} min={0} />;
    default:
      return <Input disabled={editable === '0'}/>;
    }
  };

  render() {
    const {
      editing,
      dataindex,
      title,
      idEdit,
      inputtype,
      record,
      //index,
      ...restProps
    } = this.props;
    return (
      <EditableContext.Consumer>
        {(form) => {
          const { getFieldDecorator } = form;
          return (
            <td {...restProps}>
              {editing && (!idEdit || !record[dataindex])
                ? (
                  <FormItem style={{ margin: 0 }}>
                    {getFieldDecorator(dataindex, {
                      rules: [{
                        required: true,
                        message: `请输入${title}`,
                      }],
                      getValueFromEvent: val => {
                        if (dataindex === 'Id') {
                          form.setFieldsValue(inputtype.productMap[val]);
                        }
                        return val;
                      },
                      initialValue: record[dataindex],
                    })(this.getInput())}
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
  EditableContext,
  body: {
    row: EditableFormRow,
    cell: EditableCell,
  },
};