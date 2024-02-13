import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

global.Buffer = global.Buffer || require('buffer').Buffer;

AppRegistry.registerComponent(appName, () => App);
import Config from 'react-native-config';
const myPrivateKey = Config.MY_PRIVATE_KEY;
const infuraKey = Config.INFURA_KEY;
console.log('infuraKey', Config);
