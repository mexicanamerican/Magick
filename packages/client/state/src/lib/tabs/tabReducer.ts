import { combineReducers } from 'redux'
import graphSlice, { GraphState } from './graphSlice'
import { RootState } from '../store'

export const tabReducer = combineReducers({
  graph: graphSlice,
})

export interface TabState {
  graph: GraphState
}

export const makeSelectTabState = tabId => {
  return (state: RootState) => state[tabId] as TabState
}

export const selectTabState = tabId => state => state[tabId] as TabState

export const selectTabNodes = tabId => state => {
  const tabState = selectTabState(tabId)(state)
  return tabState?.graph?.nodes
}

export const selectTabEdges = tabId => state => {
  const tabState = selectTabState(tabId)(state)
  return tabState?.graph?.edges
}
