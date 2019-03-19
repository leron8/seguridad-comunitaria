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
        this.initNotifications();
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

    initNotifications(){
        firebase.messaging().hasPermission()
        .then(enabled => {
            if (enabled) {
                // user has permissions
                console.log(enabled)
                this.listenToNotifications();
            } else {
                console.log('user doesnt have permission')
                // user doesn't have permission
                firebase.messaging().requestPermission()
                .then(() => {
                    // User has authorised  
                    this.listenToNotifications();
                })
                .catch(error => {
                    // User has rejected permissions 
                    console.error(error); 
                });
            }
        });
    }

    listenToNotifications(){
        const channel = new firebase.notifications.Android.Channel('alarm-channel', 'Canal de alarmas', firebase.notifications.Android.Importance.Max)
          .setDescription('Medio por donde se reciben alertas de seguridad');
    
        // Create the channel
        firebase.notifications().android.createChannel(channel);
    
        firebase.messaging().getToken()
        .then(fcmToken => {
          console.log(fcmToken)
          if (fcmToken) {
            // user has a device token
            
          } else {
            // user doesn't have a device token yet
          } 
        });
        this.messageListener = firebase.messaging().onMessage((message) => {
          // Process your message as required
          console.log(message,"YES");
        });
        this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification) => {
            // Process your notification as required
            // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
            console.log(notification);
        });
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            // Process your notification as required
            console.log(notification);
        });
        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
          // Get the action triggered by the notification being opened
          const action = notificationOpen.action;
          // Get information about the notification that was opened
          const notification = notificationOpen.notification;
          console.log(action, notification)
        });
        firebase.notifications().getInitialNotification()
          .then((notificationOpen) => {
            if (notificationOpen) {
              // App was opened by a notification
              // Get the action triggered by the notification being opened
              const action = notificationOpen.action;
              // Get information about the notification that was opened
              const notification = notificationOpen.notification;  
              console.log(action, notification)
            }
          });
          this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(fcmToken => {
              // Process your token as required
              console.log(fcmToken);
        });
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