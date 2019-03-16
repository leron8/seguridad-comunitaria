import React from 'react';
import RootStack from './src/config/Routing';

export default class App extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <RootStack />
    );
  }
}