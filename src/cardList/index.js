import React from 'react';
import Card from './components/card';
import Selection from './components/selection';
import AddItem from './components/addItem';
import './index.css';
import Axios from 'axios';
var allData = [];
class CardList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            data:[]
        }
    }
    componentDidMount(){
        var that = this;
        Axios.get("http://mock-api.com/4jzA4LKk.mock/cardList")
            .then((response)=>{
                allData = response.data;
                that.setState({
                    data:response.data
                })
            }).catch((err)=>{
                console.log(err);
            })
    }
    handleAddItem(){
        console.log("这里执行新建列表操作~")
    }
    handleBindChange(value){
        var newData;
        if(value == "all"){
            newData = allData;
        }else if (value == "private"){
             newData = allData.filter((item)=>{
                return item.private
            })
        }else if (value == "locked"){
            newData = allData.filter((item)=>{
                return item.locked
            })
        }
        this.setState({
            data:newData
        })
    }
    render(){  
        return(
            <div>
                <Selection onbindChange={this.handleBindChange.bind(this)}/>
                <div className="container">
                    {this.state.data.map(function(item,index){
                        return <Card {...item} key={index} />
                    })}
                    <AddItem />
                </div>
            </div>
        )
    }
}
export default CardList;