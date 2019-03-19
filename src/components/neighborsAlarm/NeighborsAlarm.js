import React, { Component } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import firebase from 'react-native-firebase';
import Sound from 'react-native-sound'

class NeighborsAlarm extends Component {

    static navigationOptions = {
        title: 'Alarma Vecinal',
    };

    constructor(props) {
        super(props);
        this.authSubscriber = null;
        this.state = {
            authUser: {},
            alerted: false,
        };
        this.toggleAlert = this.toggleAlert.bind(this);
        this.alarmSound = new Sound('alert_appear.wav', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
              console.error('failed to load the sound', error);
              return;
            }else{
              this.alarmSound.setVolume(1.0);
              this.alarmSound.setNumberOfLoops(-1);
            }
          });
    }

    componentDidMount(){
        // Enable playback in silence mode
        Sound.setCategory('Playback');

        this.authSubscriber = firebase.auth().onAuthStateChanged((authUser) => {
            
            if(authUser){
                this.uid = authUser._user.uid;
                this.userRef = firebase.firestore().collection('users').doc(this.uid);
                this.userAlarmsRef = this.userRef.collection('alarms');
                this.mainAlarmRef = firebase.firestore().collection('alarms');
                this.alarmSubscriber = null;
                this.alarmsRef = [];

                this.userAlarmsRef.get().then((alarmsResponse)=>{
                    
                    alarmsResponse.forEach((alarmsData)=>{
                        
                        this.alarmsRef.push(
                            alarmsData.data().alarmRef
                        );
                    });
                    
                    //One alarm for now
                    this.alarmSubscriber = this.mainAlarmRef.doc(this.alarmsRef[0]).onSnapshot((alarmSnap)=>{
                        
                        if(alarmSnap.exists){
                            let alarmData = alarmSnap.data();

                            if(alarmData.alerted){
                                this.alarmSound.play((success) => {
                                    if (!success) {
                                        console.error('playback failed due to audio decoding errors');
                                    }
                                });
                            }

                            this.setState({
                                alerted: alarmData.alerted,
                            });
                        }
                    },(err)=>{
                        console.error((err));
                    });
                }).catch((err)=>{
                    console.error(err);
                });
            }
        });
    }

    componentWillUnmount(){
        if(this.authSubscriber){
            this.authSubscriber();
        }
        if(this.alarmSubscriber){
            this.alarmSubscriber();
        }
        this.alarmSound.release();
    }
    
    toggleAlert(){
        if(!this.state.alerted){
            this.alarmSound.play((success) => {
              if (!success) {
                  console.error('playback failed due to audio decoding errors');
              }
            });
        }else{
            this.alarmSound.pause();
        }
        this.mainAlarmRef.doc(this.alarmsRef[0]).update({
            alerted: !this.state.alerted,
        });
    }

    render() {
        return (
            <View>
                <Text>
                    {this.state.alerted ? 'alerta' : 'reposo'}
                </Text>
                <Button
                    onPress={this.toggleAlert}
                    title="ALERTAR"
                    color="#841584"
                />
            </View>
        );
    }
}

export default NeighborsAlarm;