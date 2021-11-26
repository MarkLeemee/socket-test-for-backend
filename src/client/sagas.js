import globalSaga from './globalSaga'
import userSaga from './userSaga'
import { all } from 'redux-saga/effects'

export default function* rootSaga() {
  yield all([...globalSaga, ...userSaga])
}
