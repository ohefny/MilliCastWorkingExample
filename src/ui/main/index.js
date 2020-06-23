/* eslint-disable brace-style */
/* eslint-disable arrow-spacing */
/* eslint-disable object-curly-spacing */
/* eslint-disable comma-spacing */
/* eslint-disable key-spacing */
/* eslint-disable no-unused-vars */
import React,{Component} from 'react'

import { viewerRenderer } from '../viewer'
import { broadcastRenderer } from '../publish'
import { stateRenderer } from '../../render/state'
import * as config from '../../config'

import {
  mediaDevices // eslint-disable-line import/named
} from 'react-native-webrtc'

import { Text, View, TouchableHighlight, TextInput } from 'react-native'
import axios from 'axios'

import { styles } from './styles'
export class Main extends Component {
  // const renderViewer = viewerRenderer(config)
  state={ streamAccountId: 'vTdJWm', streamName: 'kbqdqme4' }
  render () {
    const renderer = this.state.renderer
    if (renderer) return renderer()

    const buttonDisabled = this.state.loading

    const publishPressed = async () => {
      this.setState({ loading: true })

      const mediaStream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: {
            exact: 'user'
          }
        }
      })

      const renderBroadcast = broadcastRenderer(config, mediaStream)

      this.setState({ renderer: renderBroadcast })
    }
    const streamAccountIdUpdated = (id) => {
      this.setState({ streamAccountId: id })
    }
    const streamNameUpdated = (name) => {
      this.setState({ streamName: name })
    }
    const onViewerClicked = () => {
      console.log('onViewerClicked')
      getCustomConfig(
        config,
        this.state.streamAccountId,
        this.state.streamName,
        (newConfig) => {
          console.log('newConfig', newConfig)
          this.setState({ renderer: viewerRenderer(newConfig) })
        }
      )
    }
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
            onPress={onViewerClicked}
          >
            <Text style={styles.buttonText}>Viewer</Text>
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
  { directorBaseURL, turnApiUrl },
  streamAccountId,
  streamName,
  onConfigReturned
) {
  console.log(directorBaseURL, turnApiUrl, streamAccountId, streamName)
  return axios
    .post(
      directorBaseURL + '/subscribe',
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
      console.log('wsURL', res.data.data.wsUrl + '?token=' + res.data.data.jwt)
      onConfigReturned({
        logger: console,
        turnApiUrl,
        viewerUrl: res.data.data.wsUrl + '?token=' + res.data.data.jwt,
        viewerStreamId: streamName
      })
    })
    .catch((err) => {
      console.log(err)
    })
}
