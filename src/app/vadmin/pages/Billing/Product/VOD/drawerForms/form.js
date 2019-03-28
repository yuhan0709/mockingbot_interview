import React, { Component } from 'react';
import { Table, Input, Form } from 'antd';

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form} index={index}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends Component {
  state = {
    editing: false,
  }

  componentDidMount() {
    if (this.props.editable) {
      document.addEventListener('click', this.handleClickOutside, true);
    }
  }

  componentWillUnmount() {
    if (this.props.editable) {
      document.removeEventListener('click', this.handleClickOutside, true);
    }
  }

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  }

  handleClickOutside = (e) => {
    const { editing } = this.state;
    if (editing && this.cell !== e.target && !this.cell.contains(e.target)) {
      this.save();
    }
  }

  save = () => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error) {
        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  }

  render() {
    const { editing } = this.state;
    const {
      editable,
      dataIndex,
      record,
      handleSave,
      ...restProps
    } = this.props;

    return (
      <td ref={node => (this.cell = node)} {...restProps}>
        {editable ? (
          <EditableContext.Consumer>
            {(form) => {
              this.form = form;
              return (
                editing ? (
                  <FormItem
                    temp={handleSave}
                    style={{ margin: 0 }}
                  >
                    {form.getFieldDecorator(dataIndex, {
                      initialValue: record[dataIndex],
                    })(
                      <Input
                        ref={node => (this.input = node)}
                        onPressEnter={this.save}
                      />
                    )}
                  </FormItem>
                ) : (
                  <div
                    className="editable-cell-value-wrap"
                    style={{ paddingRight: 24 }}
                    onClick={this.toggleEdit}
                  >
                    {restProps.children}
                  </div>
                )
              );
            }}
          </EditableContext.Consumer>
        ) : restProps.children}
      </td>
    );
  }
}

class EditableTable extends Component {
  constructor(props) {
    super(props);

  }

  handleSave = (row) => {
    const newData = [...this.props.dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    newData.forEach(ele => {
      ele.price = numberFormat(ele.price);
    });
    this.props.onChange(newData);
  }

  render() {
    const { dataSource } = this.props;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const columns = this.props.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    let style = {};
    if (this.props.read) {
      style = {
        pointerEvents: 'none'
      };
    }
    return (
      <div style={style}>
        <Table
          components={components}
          bordered
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
      </div>
    );
  }
}
export default EditableTable;

const numberFormat = function(value) {
  if (!value) {
    return 0;
  }
  value = '0' + value;
  let arr = value.split('.');
  if (arr.length === 1) {
    return parseInt(toNumber(arr[0]));
  } else {
    return parseInt((toNumber(arr[0]) + '.' + toNumber(arr[1])) * 10000) / 10000;
  }

  function toNumber(val) {
    let res = '';
    for (let i = 0; i < val.length; i++) {
      let n = parseInt(val[i]);
      if (!isNaN(n)) {
        res += n + '';
      }
    }
    return res;
  }
};