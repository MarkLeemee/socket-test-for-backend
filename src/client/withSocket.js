import React, { useEffect } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'

import { connectIO } from './store/actions'
// import * as session from '@common/helpers/session'
// import { setInfo } from '@project/modules/store/info'
// import { changeUserInfo } from '@signin/modules/store'
// import { getUserInfo, getProjectInfo } from '@common/helpers/authUtil'

const withSocket = (
  WrapperComponent,
  socketURL,
  socketRoom,
  socketEvent,
  roomEvent,
) => {
  // const template = {
  //   socketURL: 'comparison',
  //   socketRoom: 0,
  //   socketEvent: {
  //     listener: [{ name: 'S2C.test', actionCreator: () => {} }],
  //     trigger: [{ name: 'C2S.test', action: `action.type` }],
  //   },
  //   roomEvent: {
  //     listener: [{ name: 'S2C.roomTest', actionCreator: () => {} }],
  //     trigger: [{ name: 'C2S.roomTest', action: `action.type` }],
  //   },
  // }

  const Wrapper = (props) => {
    const dispatch = useDispatch()

    useEffect(() => {
      // if (props.userInfo) {
      //   dispatch(changeUserInfo(props.userInfo))
      // }
      // if (props.projectInfo) {
      //   dispatch(setInfo(props.projectInfo.project))
      // }
      dispatch(
        connectIO({
          socketURL,
          socketRoom,
          socketEvent,
          roomEvent,
          accessToken: props.accessToken,
        }),
      )
    }, [])

    return <WrapperComponent {...props} />
  }

  Wrapper.getInitialProps = async (ctx) => {
    // let cookies = session.parseAllCookies(ctx)
    // const { accessToken, refreshToken } = cookies

    // if (!accessToken || !refreshToken) {
    //   session.removeAllCookies()
    //   return session.handleRouter('/signin', ctx)
    // }

    // const userInfo = await getUserInfo(accessToken, ctx)
    // const projectInfo = await getProjectInfo(
    //   ctx.query.pId ?? null,
    //   accessToken,
    //   ctx,
    // )

    const componentProps =
      WrapperComponent.getInitialProps &&
      (await WrapperComponent.getInitialProps(ctx))

    const accessToken = 'testToken'

    return {
      accessToken,
      // userInfo,
      // projectInfo,
      ...componentProps,
    }
  }

  Wrapper.propTypes = {
    accessToken: PropTypes.string,
    userInfo: PropTypes.object,
    projectInfo: PropTypes.object,
  }

  return Wrapper
}

export default withSocket
