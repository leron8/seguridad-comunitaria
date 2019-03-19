import firebase from 'react-native-firebase';

export default async (message) => {
    // handle your message
    try {
        const text = message.data.message;
        const payload = message.data;
        const localNotification = new firebase.notifications.Notification({
            show_in_foreground: true,
        })
        .android.setChannelId('alarm-channel')
        .android.setPriority(firebase.notifications.Android.Priority.High)
        .setNotificationId(message.messageId)
        .setTitle('ALARMA')
        //.setSubtitle(`Unread message: ${payload.unread_message_count}`)
        .setBody(text)
        .setData(payload)
        .setSound('alert_appear.wav')
        ;
    
        //const action = new firebase.notifications.Android.Action('Reply', 'ic_launcher', 'My Test Action');
        // Add the action to the notification
        //localNotification.android.addAction(action);
    
        firebase.notifications().displayNotification(localNotification).then(()=>{
            return Promise.resolve();
        }).catch((err)=>{
            return Promise.resolve();
        });
      } catch (e) {
        return Promise.resolve();
      }
}