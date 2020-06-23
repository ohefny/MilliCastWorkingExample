import React from 'react'

import {
  Text,
  View
} from 'react-native'

import {
  RTCView // eslint-disable-line import/named
} from 'react-native-webrtc'

import { styles } from './styles'

import {
  renderButton
} from './button'

import {
  renderStreamIdInput
} from '../common/input'

import {
  stateRenderer
} from '../../render'

import {
  createMillicastClient
} from '../../client'

export const broadcastRenderer = (config, mediaStream) => {
  const {
    logger,
    publisherToken,
    publisherStreamId
  } = config

  const millicastClient = createMillicastClient(config)

  const renderBroadcast = (state, setState) => {
    logger.log('rendering broadcast')

    const mediaStream = state.get('mediaStream')

    return (
      <View style={ styles.container }>
        <RTCView streamURL={ mediaStream.toURL() } style={ styles.video } />
        <Text style={ styles.title }>
          Millicast Mobile Broadcast Demo
        </Text>
        {
          renderStreamIdInput(
            'publisherStreamId',
            'Publisher Stream ID:',
            state, setState)
        }
        {
          renderStreamIdInput(
            'publisherToken',
            'Publisher Token:',
            state, setState)
        }
        <Text style={ styles.description }>
          Broadcast a stream to the specified Millicast ID.
        </Text>
        {
          renderButton(state, setState, {
            logger,
            mediaStream,
            millicastClient
          })
        }
      </View>
    )
  }

  return stateRenderer(
    {
      status: 'disconnected',
      connection: null,
      mediaStream,
      publisherToken,
      publisherStreamId
    },
    (state, setState) => {
      return renderBroadcast(state, setState)
    })
}
