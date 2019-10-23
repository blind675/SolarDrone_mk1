import React, { Component } from 'react';
import { View, Platform, PermissionsAndroid, TextInput, Text, KeyboardAvoidingView, FlatList, Keyboard } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import Base64 from 'Base64';

import { Button } from './common/Button';

class MainScreen extends Component {
    constructor(props) {
        super(props);
        this.manager = new BleManager();
        this.device = null;
        this.state = {
            connected: false,
            foundBLEInfo: '',
            messages: [],
            newCommand: '',
        };
    }

    componentDidMount() {
        if (Platform.OS === 'ios') {
            this.manager.onStateChange(state => {
                this.printText('BLT: state' + state);

                if (state === 'PoweredOn') {
                    this._scan();
                }
            });
        } else {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
                .then((granted) => {

                    if (granted) {
                        console.log('You can use the ACCESS_FINE_LOCATION');
                        this._scan();

                    } else {
                        console.log('ACCESS_FINE_LOCATION permission denied');

                        PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                            {
                                title: 'Location for BLT',
                                message:
                                    'BLT needs location permisions',
                                buttonNegative: 'Cancel',
                                buttonPositive: 'OK',
                            },
                        ).then(() => {
                            this._scan();
                        });
                    }
                });
        }
    }

    _scan() {
        this.manager.startDeviceScan(null, null, (scan_error, device) => {
            if (device.name) {
                if (device.name === 'Bob_BLE') {
                    this.device = device;
                    this.setState({
                        foundBLEInfo: `Found BLE: ${device.manufacturerData}`,
                    });
                }
            }

            if (scan_error) {
                this.setState({
                    foundBLEInfo: 'BLT SCAN ERROR: ' + scan_error,
                });
                return;
            }
        });
    }

    connect() {
        if (this.device) {
            this.manager.stopDeviceScan();
            this.device.connect()
                .then(connected_device => {
                    return connected_device.discoverAllServicesAndCharacteristics();
                })
                .then(() => {
                    this.setState({
                        connected: true,
                    });
                    this.printText('BLT: Listening...');

                    // "deviceID":"4C:24:98:69:58:09",
                    //      service         - "uuid":"0000ffe0-0000-1000-8000-00805f9b34fb"
                    //      characteristics - "uuid":"0000ffe1-0000-1000-8000-00805f9b34fb"

                    this.device.monitorCharacteristicForService('0000ffe0-0000-1000-8000-00805f9b34fb', '0000ffe1-0000-1000-8000-00805f9b34fb', (error, char) => {
                        if (error) {
                            this.printText('BLT Communication: ' + error.message);
                            return;
                        }

                        this.printText('GOT: ', Base64.atob(char.value));
                    });
                }, (error) => {
                    this.printText('BLT ERROR: ' + error.message);
                    this.error(error.message);
                });
        }
    }

    disconnect() {
        if (this.device) {
            this.device.cancelConnection().then((device) => {
                this.setState({
                    connected: false,
                    foundBLEInfo: '',
                });
            });
        }
    }

    newCommandButtonPressed() {
        Keyboard.dismiss();

        if (this.device && this.state.newCommand !== '') {
            this.device.writeCharacteristicWithoutResponseForService('0000ffe0-0000-1000-8000-00805f9b34fb', '0000ffe1-0000-1000-8000-00805f9b34fb', Base64.btoa(this.state.newCommand));

            this.printText('SEND: ' + this.state.newCommand);
            this.setState({
                newCommand: '',
            });
        }
    }

    printText(text) {
        const newMessage = {
            uid: this.state.messages.length + text.replace(/\s/g, ''),
            message: text,
        };

        this.state.messages.push(newMessage);

        this.setState({
            messages: this.state.messages,
        });
    }

    _renderConnectButton() {
        if (this.state.connected) {
            return <Button
                style={{ width: 100 }}
                title={'Disconnect'}
                onPress={this.disconnect.bind(this)}
            />;
        }

        return <Button
            style={{ width: 100 }}
            title={'Connect'}
            onPress={this.connect.bind(this)}
        />;
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{
                    height: 60,
                    backgroundColor: 'orange',
                }} />

                <View style={{
                    flexDirection: 'row',
                    height: 64,
                    padding: 12
                }}>
                    <Text style={{ flex: 1 }}>{this.foundBLEInfo}</Text>
                    {this._renderConnectButton()}
                </View>
                <FlatList
                    style={{
                        flex: 1,
                        marginVertical: 12,
                    }}
                    data={this.state.messages.reverse()}
                    keyExtractor={(item) => `${item.uid}`}
                    renderItem={({ item }) =>
                        <View style={{
                            alignItems: 'flex-end',
                            justifyContent: 'flex-end',
                            minHeight: 20,
                            borderBottomColor: '#e3e3e3',
                            borderBottomWidth: 1,
                            marginHorizontal: 12,
                            marginTop: 3,
                        }}>
                            <Text style={{
                                fontSize: 10,
                            }}>{item.message}</Text>
                        </View>
                    }
                />
                <KeyboardAvoidingView
                    behavior='padding'
                    enabled={true}
                    keyboardVerticalOffset={10}
                    style={{
                        flexDirection: 'row',
                        marginHorizontal: 16,
                        marginBottom: 40,
                        marginTop: 16
                    }}
                >
                    <TextInput
                        style={{
                            flex: 1,
                            borderBottomColor: '#0F0F0F',
                            borderBottomWidth: 0.5,
                            marginRight: 8
                        }}
                        editable={true}
                        maxLength={40}
                        placeholder={'Mesajul tau'}
                        onChangeText={(text) => this.setState({ newCommand: text })}
                        value={this.state.newCommand}
                    />
                    <Button
                        style={{ width: 80 }}
                        title={'Send'}
                        onPress={this.newCommandButtonPressed.bind(this)}
                    />
                </KeyboardAvoidingView>
            </View>);
    }
}

export default MainScreen;

