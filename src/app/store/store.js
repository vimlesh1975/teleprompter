// store/store.js
import { configureStore, createSlice } from '@reduxjs/toolkit';

// Slice for storyLines
const storyLinesSlice = createSlice({
  name: 'storyLines',
  initialState: { storyLines: [] },
  reducers: {
    changeStoryLines: (state, action) => {
      state.storyLines = action.payload;
    },
  },
});

// Slice for crossedLines
const crossedLinesSlice = createSlice({
  name: 'crossedLines',
  initialState: { crossedLines: 0 },
  reducers: {
    changeCrossedLines: (state, action) => {
      state.crossedLines = action.payload;
    },
  },
});

// Export the actions from each slice
export const { changeStoryLines } = storyLinesSlice.actions;
export const { changeCrossedLines } = crossedLinesSlice.actions;

// Configure the store
const store = configureStore({
  reducer: {
    storyLinesReducer: storyLinesSlice.reducer,
    crossedLinesReducer: crossedLinesSlice.reducer,
  },
});

export default store;
