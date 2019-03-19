import React, { Component } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import firebase from 'react-native-firebase';

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
        
    }

    componentDidMount(){
        this.authSubscriber = firebase.auth().onAuthStateChanged((authUser) => {
            console.log(authUser);
            
            if(authUser){
                console.log(authUser);
                this.uid = authUser._user.uid;
                this.userRef = firebase.firestore().collection('users').doc(this.uid);
                this.userAlarmsRef = this.userRef.collection('alarms');
                this.mainAlarmRef = firebase.firestore().collection('alarms');
                this.alarmSubscriber = null;
                this.alarmsRef = [];

                this.userAlarmsRef.get().then((alarmsResponse)=>{
                    console.log(alarmsResponse);
                    
                    alarmsResponse.forEach((alarmsData)=>{
                        console.log(alarmsData);
                        
                        this.alarmsRef.push(
                            alarmsData.data().alarmRef
                        );
                    });

                    console.log(this.alarmsRef);
                    
                    //One alarm for now
                    this.alarmSubscriber = this.mainAlarmRef.doc(this.alarmsRef[0]).onSnapshot((alarmSnap)=>{
                        console.log(alarmSnap);
                        
                        if(alarmSnap.exists){
                            console.log(alarmSnap);
                            let alarmData = alarmSnap.data();

                            console.log(alarmData);

                            if(alarmData.alerted){
                                /*this.cardFlipSound.play((success) => {
                                    if (!success) {
                                        console.error('playback failed due to audio decoding errors');
                                    }
                                });*/
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
    }
    
    toggleAlert(){
        if(!this.state.alerted){
            /*this.cardFlipSound.play((success) => {
              if (!success) {
                  console.error('playback failed due to audio decoding errors');
              }
            });*/
        }else{
            console.log('pause');
            
            //this.cardFlipSound.pause();
            /*this.cardFlipSound.stop(() => {
              // Note: If you want to play a sound after stopping and rewinding it,
              // it is important to call play() in a callback.
              this.cardFlipSound.play();
            });*/
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