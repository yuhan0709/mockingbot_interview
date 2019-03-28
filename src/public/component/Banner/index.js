import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import LightButton from '../LightButton';
import style from './style.less';

class Dot extends PureComponent {
  handleClick = () => {
    this.props.handleClick(this.props.index);
  }
  render() {
    const {
      index,
      location,
    } = this.props;
    return <LightButton onClick={this.handleClick}>
      <span className={index === location ? style.dotnow : style.dot}>·</span>
    </LightButton>;
  }
}
Dot.propTypes = {
  index: PropTypes.number,
  location: PropTypes.number,
  handleClick: PropTypes.func,
};
class Dots extends PureComponent {
  render() {
    const {
      location,
      length,
    } = this.props;
    return (<div className={style.dots}>
      {
        Array.from({ length: length }, (v, index) => <Dot key={index} handleClick={this.props.setLocation} index={index} location={location} />)
      }
    </div>);
  }
}
Dots.propTypes = {
  location: PropTypes.number,
  length: PropTypes.number,
  setLocation: PropTypes.func,
};

class Banner extends PureComponent {
  state = {
    location: 0,
  }
  autoTimeout = 0
  transform = 'none'
  transition = this.props.transition
  hideTransitionFlag = false;
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.transition !== nextProps.transition && !this.hideTransitionFlag) {
      this.transition = nextProps.transition;
    }
    if (this.props.items !== nextProps.items) {
      this.setState({
        location: 0,
      }, this.autoChangeLocation);
    }
  }
  setLocation = (location) => {
    if (this.autoTimeout) clearTimeout(this.autoTimeout);
    this.transform = `translateX(-${location}00%)`;
    if (location === this.props.items.length) {
      if (this.props.endSwitchSmooth) {
        this.hideTransitionFlag = true;
        this.setState({
          location: 0,
        });
      }
      else {
        this.transform = 'translateX(0)';
        this.setState({
          location: 0,
        }, this.autoChangeLocation);
      }
    } else {
      this.setState({
        location,
      }, this.autoChangeLocation);
    }
  }
  transitionend = () => {
    if (this.hideTransitionFlag) {
      this.hideTransitionFlag = false;
      this.transition = 'none';
      this.transform = 'translateX(0)';
      this.forceUpdate(this.afterHideTransition);
    }
  }
  afterHideTransition = () => {
    this.transition = this.props.transition;
    this.autoChangeLocation();
  }
  autoAddLocation = () => {
    this.setLocation(this.state.location + 1);
  }
  autoChangeLocation = () =>  {
    if (this.props.items.length <= 1) return;
    if (this.autoTimeout) clearTimeout(this.autoTimeout);
    this.autoTimeout = setTimeout(this.autoAddLocation, this.props.changeGap);
  }
  componentDidMount() {
    this.autoChangeLocation();
  }
  render() {
    const {
      items,
      endSwitchSmooth,
      controller: Controller,
    } = this.props;
    const {
      location,
    } = this.state;
    return (
      <div className={style.container}>
        <ul className={style.banner} onTransitionEnd={this.transitionend} style={{ transform: this.transform, transition: this.transition }}>
          {
            items.map((item, index) =>
              (<li key={index} className={style.item}>{item}</li>))
          }
          { endSwitchSmooth && <li key={-1} className={style.item}>{items[0]}</li> }
        </ul>
        { items.length > 1 && <Controller setLocation={this.setLocation} length={items.length} location={location} /> }
      </div>);
  }
}

Banner.propTypes = {
  items: PropTypes.arrayOf(PropTypes.element),
  changeGap: PropTypes.number,
  // 结尾无缝切换模式
  endSwitchSmooth: PropTypes.bool,
  // 过度
  transition: PropTypes.string,
  // 控制点
  controller: PropTypes.func
};
Banner.defaultProps = {
  items: [],
  changeGap: 2000,
  endSwitchSmooth: true,
  transition: 'all 0.3s ease',
  controller: Dots,
};

export default Banner;