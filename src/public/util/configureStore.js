import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { routerMiddleware, routerActions } from 'react-router-redux';

let history = {};
let isClientSide = false;
try {
  isClientSide = global === window;
} catch (e) {
  console.log('is server side');
}
if (isClientSide) {
  history = createBrowserHistory();
}

const configureStore = ({
  initialState = {},
  reducers,
  actions,
}) => {
  // Redux Configuration
  const middleware = [];
  const enhancers = [];

  // Thunk Middleware
  middleware.push(thunk);

  // Router Middleware
  const router = routerMiddleware(history);
  middleware.push(router);

  const allAction = {};
  Object.keys(actions).forEach(akey => {
    Object.keys(actions[akey]).forEach(funcKey => {
      // allAction[`${akey}.${funcKey}`] = actions[akey][funcKey];
      allAction[funcKey] = actions[akey][funcKey];
    });
  });
  // Redux DevTools Configuration
  const actionCreators = {
    ...allAction,
    ...routerActions,
  };
    // If Redux DevTools Extension is installed use it, otherwise use Redux compose
    /* eslint-disable no-underscore-dangle */
  const createArgv = [reducers, initialState];
  if (isClientSide) {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
        actionCreators,
      })
      : compose;
      /* eslint-enable no-underscore-dangle */

      // Apply Middleware & Compose Enhancers
    enhancers.push(applyMiddleware(...middleware));
    const enhancer = composeEnhancers(...enhancers);
    createArgv.push(enhancer);
  }
  // Create Store
  const store = createStore(...createArgv);

  // if (module.hot) {
  //   module.hot.accept('../reducers', () =>
  //     store.replaceReducer(require('../reducers'))); // eslint-disable-line global-require
  // }

  return { store, history };
};

export default configureStore;
