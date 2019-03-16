import React from 'react';
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';

import AuthLoadingScreen from './../components/auth/AuthLoadingScreen';
import LoginRegister from './../components/auth/RegisterLogin';
import NeighborsAlarm from './../components/neighborsAlarm/NeighborsAlarm';

const MainStack = createStackNavigator(
    {
        NeighborsAlarm: NeighborsAlarm,
    },
    {
      initialRouteName: 'NeighborsAlarm',
      navigationOptions: {
        headerStyle: {
          backgroundColor: '#03a9f4',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: 'Atrás',
      },
    }
);

const AuthStack = createStackNavigator(
    {
        LoginRegister: LoginRegister,
    },
    {
        mode: 'modal',
        headerMode: 'none',
    }
);

const RootStack = createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: MainStack,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'AuthLoading',
    }
);

export default createAppContainer(RootStack);