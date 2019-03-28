function apiData(state = {}, action) {
  switch (action.type) {
  case 'SET_API_DATA':
    return action.payload;
  default:
    return state;
  }
}
export default apiData;