/**
 * G2 滑动组件
 * 用来控制图表显示范围
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Slider from '@antv/g2-plugin-slider';

class G2Slider extends PureComponent {
  static propTypes = {
    containerStyle: PropTypes.object,
    options: PropTypes.object
  }
  static defaultProps = {
    containerStyle: {},
    options: {
      padding: 'auto',
      data: []
    }
  }

  slider = null
  sliderOptions = {}

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.slider && this.props.options.data !== nextProps.options.data) {
      // console.log('reflow');
      this.slider.changeData(nextProps.options.data);
    }
    if (this.slider && this.props.options !== nextProps.options) {
      // console.log('repaint');
      // this.slider.repaint();
      this.slider.destroy();
      this.slider = new Slider({
        ...this.sliderOptions,
        ...nextProps.options
      });
      this.slider.render();
    }
  }

  getSlider = (ref) => {
    if (ref) {
      const { options } = this.props;
      this.sliderOptions = {
        container: ref,
        ...options
      };
      const slider = new Slider(this.sliderOptions);
      slider.render();
      this.slider = slider;
    }
  }

  componentWillUnmount() {
    this.slider.destroy();
  }

  render() {
    return (
      <div ref={this.getSlider} style={this.props.containerStyle}></div>
    );
  }
}

export default G2Slider;