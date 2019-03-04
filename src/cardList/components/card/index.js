// card component
import React from 'react';
import './index.css';
import lockPng from '../../../image/locked.png';
import privatePng from '../../../image/private.png';
class Card extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <div className = {this.props.locked?"cardContainer locked":"cardContainer"}>
                <div className = "avatar">
                    <img src = {this.props.avatar} />
                </div>
                <div className = "block_right">
                    <p> {this.props.name} </p>
                        <div className = "info">
                            {this.props.locked?<div><img src={lockPng}/>&nbsp;锁定</div>:null}
                            {this.props.private?<div><img src={privatePng}/>&nbsp;私密</div>:null}
                        </div>
                    <p> {this.props.num} 项目</p>
                </div>
            </div>
        )
    }
}
export default Card;