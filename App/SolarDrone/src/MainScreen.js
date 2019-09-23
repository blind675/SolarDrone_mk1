/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

class MainScreen extends Component {
    constructor(props) {
        super(props);
        this.manager = new BleManager();
        this.state = {};
    }

    componentWillMount() {
        if (Platform.OS === 'ios') {
            this.manager.onStateChange(state => {
                if (state === 'PoweredOn') {
                    this.scanAndConnect();
                }
            });
        } else {
            this.scanAndConnect();
        }
    }

    scanAndConnect() {
        this.manager.startDeviceScan(null, null, (scan_error, device) => {
            console.log('found devices:', device);

            if (scan_error) {
                console.log('found devices error:', scan_error);
                return;
            }

            if (device.name === 'TI BLE Sensor Tag' || device.name === 'SensorTag') {
                console.log('Connecting to TI Sensor');
                this.manager.stopDeviceScan();
                device.connect()
                    .then(connected_device => {
                        console.log('Discovering services and characteristics');
                        return connected_device.discoverAllServicesAndCharacteristics();
                    })
                    .then((discovered_device) => {
                        console.log('Setting notifications');
                        return this.setupNotifications(discovered_device);
                    })
                    .then(() => {
                        console.log('Listening...');
                    }, (error) => {
                        this.error(error.message);
                    });
            }
        });
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
                this.updateValue(characteristic.uuid, characteristic.value)
            });
        }
    }

    render() {
        return <View />;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default MainScreen;
