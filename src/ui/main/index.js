/* eslint-disable brace-style */
/* eslint-disable arrow-spacing */
/* eslint-disable object-curly-spacing */
/* eslint-disable comma-spacing */
/* eslint-disable key-spacing */
/* eslint-disable no-unused-vars */
import React from 'react'

import { viewerRenderer } from '../viewer'
import { broadcastRenderer } from '../publish'
import { stateRenderer } from '../../render/state'

import {
  mediaDevices // eslint-disable-line import/named
} from 'react-native-webrtc'

import { Text, View, TouchableHighlight, TextInput } from 'react-native'
import axios from 'axios'

import { styles } from './styles'

export const mainRenderer = (config) => {
  // const renderViewer = viewerRenderer(config)

  const renderMain = (state, setState) => {
    const renderer = state.get('renderer')
    if (!state.get('streamAccountId'))setState({ streamAccountId: 'vTdJWm',streamName: 'kbqdqme4' })
    if (renderer) return renderer()

    const buttonDisabled = state.get('loading')

    const publishPressed = async () => {
      setState({ loading: true })

      const mediaStream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: {
            exact: 'user'
          }
        }
      })

      const renderBroadcast = broadcastRenderer(config, mediaStream)

      setState({ renderer: renderBroadcast })
    }
    const streamAccountIdUpdated = (id) => {
      setState({ streamAccountId: id })
    }
    const streamNameUpdated = (name) => {
      setState({ streamName: name })
    }
    const onViewerClicked = ()=>{
      console.log('onViewerClicked')
      getCustomConfig(config, state.get('streamAccountId'),state.get('streamName'), (newConfig) => {
        console.log('newConfig',newConfig)
        setState({ renderer: viewerRenderer(newConfig) })
      }) }
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Millicast Mobile Demo</Text>
        <View style={styles.selections}>
          {/* <TouchableHighlight
            disabled = { buttonDisabled }
            style = { styles.button }
            onPress={ publishPressed }>
            <Text style={ styles.buttonText }>Publish</Text>
          </TouchableHighlight> */}
          <Text style={{ color: '#000', fontSize: 18 }}>
            Enter Stream Account Id
          </Text>
          <TextInput onChangeText={streamAccountIdUpdated} value={state.get('streamAccountId')} style={{ backgroundColor: '#fff' }}/>
          <Text style={{ color: '#000', fontSize: 18 }}>
            Enter Stream Name
          </Text>
          <TextInput onChangeText={streamNameUpdated} value={state.get('streamName')} style={{ backgroundColor: '#fff' }}/>
          <TouchableHighlight
            disabled={buttonDisabled}
            style={styles.button}
            onPress={onViewerClicked}>
            <Text style={styles.buttonText}>Viewer</Text>
          </TouchableHighlight>
          <Text style={{ color: '#000', fontSize: 18, display: 'none' }}>
            Loading...
          </Text>
        </View>
      </View>
    )
  }
  function getCustomConfig (
    { directorBaseURL, turnApiUrl },
    streamAccountId, streamName ,
    onConfigReturned
  ) {
    console.log(directorBaseURL, turnApiUrl, streamAccountId, streamName)
    return axios
      .post(directorBaseURL + '/subscribe',
        {
          streamAccountId,
          streamName,
          unauthorizedSubscribe: true
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )
      .then((res) => {
        console.log('wsURL',res.data.data.wsUrl + '?token=' + res.data.data.jwt)
        onConfigReturned({logger:console,turnApiUrl, viewerUrl:res.data.data.wsUrl + '?token=' + res.data.data.jwt,viewerStreamId:streamName})
      }).catch((err)=>{
        console.log(err)
      })
  }

  return stateRenderer(
    {
      loading: false,
      renderer: null
    },
    renderMain
  )
}
