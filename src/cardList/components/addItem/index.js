import React from 'react';
import Add from '../../../image/add.png';
import './index.css';
class AddItem extends React.Component{
    addItem(){
        this.props.handleAddItem();
    }
    render(){
        return(
            <div className ="addContainer" onClick = {this.addItem.bind(this)}>
                <img src={Add} />
                <p>新增项目组</p>
            </div>
        )
    }
}
export default AddItem