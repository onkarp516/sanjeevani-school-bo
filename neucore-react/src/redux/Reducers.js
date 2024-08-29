import { combineReducers } from "redux";
import userPermissions from "./userPermissions/Reducer";
const Reducers = combineReducers({
  userPermissions,
});

export default Reducers;
