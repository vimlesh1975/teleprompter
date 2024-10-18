// store/store.js
import { applyMiddleware, combineReducers, legacy_createStore as createStore } from 'redux';
import {thunk} from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// Reducer
const initialstoryLines= { storyLines: [] };
const storyLinesReducer = (state = initialstoryLines, action) => {
    switch (action.type) {
        case 'CHANGE_STORYLINES':
            return {
                ...state,
                storyLines: action.payload,
            };
        default:
            return state;
    }
};

const initialcrossedLines= { crossedLines: 0 };
const crossedLinesReducer = (state = initialcrossedLines, action) => {
    switch (action.type) {
        case 'CHANGE_crossedLines':
            return {
                ...state,
                crossedLines: action.payload,
            };
        default:
            return state;
    }
};


// Combine reducers
const rootReducer = combineReducers({
    storyLinesReducer,crossedLinesReducer
});

// Create the Redux store
const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(thunk))
);

export default store;
