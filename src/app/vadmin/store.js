import configureStore from '../../public/util/configureStore';
import actions from './redux/actions';
import reducers from './redux/reducers';
const {
  store,
  history,
} = configureStore({ reducers, actions });
export { store, history };