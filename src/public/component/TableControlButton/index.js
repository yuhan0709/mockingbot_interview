import PopconfirmButton from '../../hoc/PopconfirmButton';
import InjectData from '../../hoc/InjectData';
import LightButton from '../LightButton';

@InjectData('onClick', 'data')
@PopconfirmButton('handleClick')
class TableControlButton extends LightButton{}
export default TableControlButton;