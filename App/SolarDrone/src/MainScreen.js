/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { View, Platform, PermissionsAndroid, TextInput, Text, KeyboardAvoidingView, FlatList, Keyboard } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

import { Button } from './common/Button';

class MainScreen extends Component {
    constructor(props) {
        super(props);
        this.manager = new BleManager();
        this.device = null;
        this.state = {
            messages: [],
            newCommand: '',
        };
    }

    componentDidMount() {
        if (Platform.OS === 'ios') {
            this.manager.onStateChange(state => {
                this.printText('BLT: state' + state);

                if (state === 'PoweredOn') {
                    this.scan();
                }
            });
        } else {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
                .then((granted) => {

                    if (granted) {
                        console.log('You can use the ACCESS_FINE_LOCATION');
                        this.scan();

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
                            this.scan();
                        });
                    }
                });
        }
    }

    scan() {
        this.manager.startDeviceScan(null, null, (scan_error, device) => {
            if (device.name) {
                this.printText('BLT: device.name: ' + device.name);
                this.printText('BLT: device.manufacturerData: ' + device.manufacturerData);
                if (device.name === 'Dual-SPP') {
                    this.device = device;
                }
            }

            if (scan_error) {
                this.printText('BLT SCAN ERROR: ' + scan_error);
                return;
            }
        });
    }

    connect() {
        if (this.device) {
            this.printText('BLT: Connecting to TI Sensor');
            this.manager.stopDeviceScan();
            this.device.connect()
                .then(connected_device => {
                    this.printText('BLT: Discovering services and characteristics');
                    return connected_device.discoverAllServicesAndCharacteristics();
                })
                .then((discovered_device) => {
                    this.printText('BLT: Setting notifications');
                    return this.setupNotifications(discovered_device);
                })
                .then(() => {
                    this.printText('BLT: Listening...');
                }, (error) => {
                    this.printText('BLT ERROR: ' + error.message);
                    this.error(error.message);
                });
        }
    }

    // TODO: change this to write or read from blt
    async setupNotifications(device) {
        for (const id in this.sensors) {
            const service = this.serviceUUID(id);
            const characteristicW = this.writeUUID(id);
            const characteristicN = this.notifyUUID(id);

            const characteristic = await device.writeCharacteristicWithResponseForService(
                service, characteristicW, 'AQ==' /* 0x01 in hex */
            );

            device.monitorCharacteristicForService(service, characteristicN, (error, characteristic) => {
                if (error) {
                    this.error(error.message);
                    return;
                }
                this.updateValue(characteristic.uuid, characteristic.value);
            });
        }
    }

    newCommandButtonPressed() {
        Keyboard.dismiss();

        if (this.state.newCommand !== '') {
            this.printText('cmd: ' + this.state.newCommand);

            switch (this.state.newCommand) {
                case 'connect' || 'Connect':
                    this.connect();
                    break;
                default:
                    break;
            }
        }
    }

    printText(text) {
        console.log(' - ', text);

        const newMessage = {
            uid: this.state.messages.length + text.replace(/\s/g, ''),
            message: text,
        };

        this.state.messages.push(newMessage);

        this.setState({
            newCommand: '',
            messages: this.state.messages,
        });
    }

    render() {
        return (<View style={{ flex: 1 }}
        >
            <View style={{
                height: 60,
                backgroundColor: 'orange',
            }} />
            <FlatList
                style={{
                    flex: 1,
                }}
                data={this.state.messages}
                keyExtractor={(item) => `${item.uid}`}
                renderItem={({ item }) =>
                    <View style={{
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                        minHeight: 20,
                        borderBottomColor: 'gray',
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
                    style={{ width: 60 }}
                    title={'Go'}
                    onPress={this.newCommandButtonPressed.bind(this)}
                />
            </KeyboardAvoidingView>
        </View>);
    }
}

export default MainScreen;
