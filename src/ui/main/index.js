/* eslint-disable brace-style */
/* eslint-disable arrow-spacing */
/* eslint-disable object-curly-spacing */
/* eslint-disable comma-spacing */
/* eslint-disable key-spacing */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react'

import { viewerRenderer } from '../viewer'
import { broadcastRenderer } from '../publish'
import { stateRenderer } from '../../render/state'
import * as staticConfig from '../../config'
import {
  mediaDevices // eslint-disable-line import/named
} from 'react-native-webrtc'

import { Text, View, TouchableHighlight, TextInput, Alert } from 'react-native'
import axios from 'axios'

import { styles } from './styles'
export class Main extends Component {
  // const renderViewer = viewerRenderer(config)
  state = {
    streamAccountId: staticConfig.streamAccountId,
    streamName: staticConfig.viewerStreamId,
    publisherToken:staticConfig.publisherToken
  };
  render () {
    const renderer = this.state.renderer
    if (renderer) return renderer()

    const buttonDisabled = this.state.loading

    const onPublishDataRecieved = async (newConfig) => {
      console.log('publishURL' + newConfig.publisherUrl)
      this.setState({ loading: true })
      const mediaStream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: {
            exact: 'user'
          }
        }
      })

      const renderBroadcast = broadcastRenderer(newConfig, mediaStream)
      this.setState({ renderer: renderBroadcast })
    }
    const streamAccountIdUpdated = (id) => {
      this.setState({ streamAccountId: id })
    }
    const tokenUpdated = (token) => {
      this.setState({ publisherToken: token })
    }
    const streamNameUpdated = (name) => {
      this.setState({ streamName: name })
    }
    const onViewerClicked = () => {
      console.log('onViewerClicked')
      getCustomConfig(
        staticConfig,
        this.state.streamAccountId,
        this.state.streamName,
        (newConfig) => {
          console.log('newConfig', newConfig)
          this.setState({ renderer: viewerRenderer(newConfig) })
        },
        (error) => {
          console.log('showing alert dialog')
          Alert.alert('Error !!', error)
        }
      )
    }
    const onPublishClicked = () => {
      getPublisherCustomConfig(
        staticConfig,
        this.state.streamName,
        this.state.publisherToken,
        (newConfig) => {
          console.log('newConfig', newConfig)
          onPublishDataRecieved(newConfig)
        },
        (error) => {
          console.log('showing alert dialog')
          Alert.alert('Error !!', error)
        }
      )
    }
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Nagwa Connect Millicast Mobile Demo</Text>
        <View style={styles.selections}>
          <Text style={{ color: '#000', fontSize: 18 }}>
            Enter Stream Account Id
          </Text>
          <TextInput
            onChangeText={streamAccountIdUpdated}
            value={this.state.streamAccountId}
            style={{ backgroundColor: '#fff' }}
          />
          <Text style={{ color: '#000', fontSize: 18 }}>Enter Stream Name</Text>
          <TextInput
            onChangeText={streamNameUpdated}
            value={this.state.streamName}
            style={{ backgroundColor: '#fff' }}
          />
          <TouchableHighlight
            disabled={buttonDisabled}
            style={styles.button}
            onPress={onViewerClicked}>
            <Text style={styles.buttonText}>Viewer</Text>
          </TouchableHighlight>
          <Text style={{ color: '#000', fontSize: 18 }}>Enter Punlisher Token</Text>
          <TextInput
            onChangeText={tokenUpdated}
            value={this.state.publisherToken}
            style={{ backgroundColor: '#fff' }}
          />
          <TouchableHighlight
            disabled={buttonDisabled}
            style={styles.button}
            onPress={onPublishClicked}>
            <Text style={styles.buttonText}>Publish</Text>
          </TouchableHighlight>

          <Text style={{ color: '#000', fontSize: 18, display: 'none' }}>
            Loading...
          </Text>
        </View>
      </View>
    )
  }
}

function getCustomConfig (
  config,
  streamAccountId,
  streamName,
  onConfigReturned,
  onConfigFailed
) {
  console.log(
    config.directorBaseURL,
    config.turnApiUrl,
    streamAccountId,
    streamName
  )
  return axios
    .post(
      config.directorBaseURL + '/subscribe',
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
      let newConfig = config
      newConfig['viewerUrl'] =
        res.data.data.wsUrl + '?token=' + res.data.data.jwt
      newConfig['viewerStreamId'] = streamName
      console.log(newConfig)
      onConfigReturned(newConfig)
    })
    .catch((err) => {
      console.log(err)
      let msg = 'Something went wrong please try again'
      try {
        msg = err.response.data.data.message
      } catch (e) {}
      onConfigFailed(msg)
    })
}
function getPublisherCustomConfig (
  config,
  streamName,
  publisherToken,
  onConfigReturned,
  onConfigFailed
) {
  console.log('getPublisherCustomConfig',
    config.directorBaseURL,
    config.turnApiUrl,
    streamName,
    publisherToken
  )
  return axios
    .post(
      config.directorBaseURL + '/publish',
      {streamName},
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization':'Bearer ' + publisherToken
        }
      }
    )
    .then((res) => {
      let newConfig = config
      newConfig['publisherUrl'] = res.data.data.wsUrl    
      newConfig['publisherStreamId'] = streamName
      newConfig['publisherToken'] = res.data.data.jwt
      console.log(newConfig)
      onConfigReturned(newConfig)
    })
    .catch((err) => {
      console.log(err)
      let msg = 'Something went wrong please try again'
      try {
        msg = err.response.status + err.response.data.data.message
      } catch (e) {}
      onConfigFailed(msg)
    })
}
