import React, { Component } from 'react';
import { StyleSheet, Text, ScrollView } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
//const homePlace = { description: 'Home', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }};
//const workPlace = { description: 'Work', geometry: { location: { lat: 48.8496818, lng: 2.2940881 } }};
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
        };

        this.generateId = this.generateId.bind(this);
    }

    generateId(){
        //
        firebase.auth().signInAnonymously()
        .then(() => {
            console.log('logged in')
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
        console.log(route, sublocality, postalCode, city, state, country);
        this.setState({
            selectedRoute: route,
            selectedSublocality: sublocality,
            selectedPostalCode: postalCode,
            selectedCity: city,
            selectedState: state,
            selectedCountry: country,
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
                    //predefinedPlaces={[homePlace, workPlace]}

                    debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                    //renderLeftButton={()  => <Image source={require('path/custom/left-icon')} />}
                    //renderRightButton={() => <Text>Custom text after the input</Text>}
                    />
                    
            </ScrollView>
        );
    }
}

export default RegisterLogin;