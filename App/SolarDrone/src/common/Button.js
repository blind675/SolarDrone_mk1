import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const Button = ({ onPress, title, style }) => {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.buttonBaseStyle, style]}>
            <Text style={styles.textStyle}> {title} </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonBaseStyle: {
        height: 40,
        width: 200,
        backgroundColor: '#0F82FF',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    textStyle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600'
    },
});

export { Button };
