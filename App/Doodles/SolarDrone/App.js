/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment} from 'react';
import MainScreen from './src/MainScreen';

const App = () => {
  return (
    <Fragment>
      <MainScreen />
    </Fragment>
  );
};

export default App;

// const granted = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION );

//         if (granted) {
//           console.log( 'You can use the ACCESS_FINE_LOCATION' );
//         } else {
//           console.log( 'ACCESS_FINE_LOCATION permission denied' );
//         }

//         await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION ,
//             {
//               title: 'Location for BLT',
//               message:
//                 'BLT needs location permisions',
//               buttonNegative: 'Cancel',
//               buttonPositive: 'OK',
//             },
//           );