import React from 'react';
import './index.css';

class Selection extends React.Component{
    handleChange(e){
        this.props.onbindChange(e.target.value);
    }
    render(){
        return(
            <select onChange = {this.handleChange.bind(this)}>
                <option value="all">所有项目组</option>
                <option value="private">私密</option>
                <option value="locked">锁定</option>
            </select>
        )
    }
}
export default Selection;