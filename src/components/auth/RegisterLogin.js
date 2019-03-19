import React, { Component } from 'react';
import { StyleSheet, Text, ScrollView, Button, ActivityIndicator } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import firebase from 'react-native-firebase';

class RegisterLogin extends Component {
    static navigationOptions = {
        title: 'Establece una ubicación',
    };

    constructor(props){
        super(props);
        this.state = {
            selectedRegion: [],
            selectedRoute: '',
            selectedSublocality: '',
            selectedPostalCode: '',
            selectedCity: '',
            selectedState: '',
            selectedCountry: '',
            alarmId: '',
            loading: false,
        };

        this.generateId = this.generateId.bind(this);
        this.addAlarm = this.addAlarm.bind(this);
        this.processAddress = this.processAddress.bind(this);
        this.addAlarmToUser = this.addAlarmToUser.bind(this);
        this.createUserData = this.createUserData.bind(this);
        this.logUserIn = this.logUserIn.bind(this);

        this.alarmsRef = firebase.firestore().collection('alarms');
        this.usersRef = firebase.firestore().collection('users');
    }

    generateId(){
        let fieldsForId;
        fieldsForId = this.state.selectedPostalCode + this.state.selectedSublocality + 
            this.state.selectedRoute;
        
        let hash = 0, i, chr;
        if (fieldsForId.length === 0) return hash;
        for (i = 0; i < fieldsForId.length; i++) {
            chr   = fieldsForId.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0;
        }

        this.setState({
            alarmId: ''+hash,
        });
    }

    processAddress(addr){
        let route, sublocality, postalCode, city, state, country;
        addr.forEach((addrPart)=>{
            addrPart.types.forEach((addrPartType)=>{
                switch (addrPartType) {
                    case 'route':
                        route = addrPart.long_name;
                        break;
                    case 'sublocality_level_1':
                    case 'sublocality':
                        sublocality = addrPart.long_name;
                        break;
                    case 'locality':
                        city = addrPart.long_name;
                        break;
                    case 'administrative_area_level_1':
                        state = addrPart.long_name;
                        break;
                    case 'country':
                        country = addrPart.long_name;
                        break;
                    case 'postal_code':
                        postalCode = addrPart.long_name;
                        break;
                    default:
                        break;
                }
            });
        });
        
        this.setState({
            selectedRoute: route,
            selectedSublocality: sublocality,
            selectedPostalCode: postalCode,
            selectedCity: city,
            selectedState: state,
            selectedCountry: country,
        },()=>{
            this.generateId()
        });
    }

    addAlarm(){
        this.setState({
            loading: true,
        },()=>{
            this.createUserData().then((uid)=>{
                this.alarmsRef.doc(this.state.alarmId).get().then((doc)=>{
                    console.log(doc)
                    if (doc.exists){
                        console.log('exists');
                        this.addAlarmToUser(uid).then(()=>{
                            alert('Alarma agregada');
                            this.props.navigation.navigate('App');
                        }).catch((err)=>{
                            alert('Error, favor de contactarnos')
                        });
                    }else{
                        this.alarmsRef.doc(this.state.alarmId).set({
                            alerted: false,
                            id: this.state.alarmId,
                            route: this.state.selectedRoute,
                            sublocality: this.state.selectedSublocality,
                            postalCode: this.state.selectedPostalCode,
                            city: this.state.selectedCity,
                            state: this.state.selectedState,
                            country: this.state.selectedCountry,
                        }).then(()=>{
                            console.log('didnt exist')
                            this.addAlarmToUser(uid).then(()=>{
                                alert('Alarma agregada');
                                this.props.navigation.navigate('App');
                            }).catch((err)=>{
                                alert('Error, favor de contactarnos')
                            });
                        }).catch((err)=>{
                            console.error(err);
                        });
                    }
                }).catch((err)=>{
                    console.error(err);
                });
            }).catch((err)=>{
                console.error(err);
            });
        });
    }

    addAlarmToUser(uid){
        return new Promise((resolve, reject)=>{
            this.usersRef.doc(uid).collection('alarms').add({
                alarmRef: this.state.alarmId
            }).then(()=>{
                resolve();
            }).catch((err)=>{
                console.error(err)
                reject(err);
            });
        });
    }

    createUserData(){
        return new Promise((resolve, reject)=>{
            this.logUserIn().then((userInfo)=>{
                let uid = userInfo.user.uid;
                this.usersRef.doc(uid).get().then((userData)=>{
                    if(!userData.exists){
                        this.usersRef.doc(uid).set({
                            uid: uid,
                        }).then(()=>{
                            resolve(uid);
                        }).catch((err)=>{
                            console.error(err)
                            reject(err);
                        });
                    }
                });
            }).catch((err)=>{
                console.error(err);
                reject(err);
            });
        });
    }

    logUserIn(){
        return new Promise((resolve, reject)=>{
            firebase.auth().signInAnonymously()
            .then((userInfo) => {
                console.log('logged in', userInfo.user.uid);
                resolve(userInfo);
            },()=>{
                console.error('LoginRejected')
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    render() {
        return (
            <ScrollView>
                <GooglePlacesAutocomplete
                    placeholder='Buscar una ubicación'
                    minLength={2} // minimum length of text to search
                    autoFocus={false}
                    returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                    keyboardAppearance={'light'} // Can be left out for default keyboardAppearance https://facebook.github.io/react-native/docs/textinput.html#keyboardappearance
                    listViewDisplayed='auto'    // true/false/undefined
                    fetchDetails={true}
                    renderDescription={row => row.description} // custom description render
                    onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                        console.log(details.address_components);
                        this.processAddress(details.address_components);
                    }}

                    getDefaultValue={() => ''}

                    query={{
                        // available options: https://developers.google.com/places/web-service/autocomplete
                        key: 'AIzaSyAAOCEaFHR1Tm7UFgBvBbCpZzc48ZRkP7Q',
                        language: 'es', // language of the results
                        //types: '(geocode, regions)' // default: 'geocode'
                    }}

                    styles={{
                        textInputContainer: {
                        width: '100%'
                        },
                        description: {
                        fontWeight: 'bold'
                        },
                        predefinedPlacesDescription: {
                        color: '#1faadb'
                        }
                    }}

                    currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                    currentLocationLabel="Ubicación actual"
                    nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                    GoogleReverseGeocodingQuery={{
                        // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                    }}
                    GooglePlacesSearchQuery={{
                        // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                        rankby: 'distance',
                        type: 'cafe'
                    }}
                    
                    GooglePlacesDetailsQuery={{
                        // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
                        fields: 'formatted_address',
                    }}

                    filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

                    debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                    //renderLeftButton={()  => <Image source={require('path/custom/left-icon')} />}
                    //renderRightButton={() => <Text>Custom text after the input</Text>}
                    />

                    <Text>
                        Calle: { this.state.selectedRoute }
                    </Text>
                    <Text>
                        Colonia: { this.state.selectedSublocality }
                    </Text>
                    <Text>
                        Código Postal: { this.state.selectedPostalCode }
                    </Text>
                    <Text>
                        Ciudad: { this.state.selectedCity }
                    </Text>
                    <Text>
                        Estado: { this.state.selectedState }
                    </Text>
                    <Text>
                        País: { this.state.selectedCountry }
                    </Text>

                    {
                        this.state.loading && 
                        <ActivityIndicator size="large" color="#0000ff" />
                    }

                    <Button
                        onPress={this.addAlarm}
                        title="Agregar alarma para esta zona"
                        color="#841584"
                        disabled={!this.state.alarmId || this.state.loading}
                    />
                    
            </ScrollView>
        );
    }
}

export default RegisterLogin;