import * as Redux from "redux";
import { searchReducer } from "containers/search/reducer";
import { Reducer } from "redux";

export default function createRootReducer(): Reducer<any> {
    return Redux.combineReducers({ search: searchReducer });
}