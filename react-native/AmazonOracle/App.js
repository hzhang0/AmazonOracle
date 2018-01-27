import React, { Component } from 'react'
import { ImagePicker } from 'expo'
import { View,  Button,  ToastAndroid , Text} from 'react-native'
import { StackNavigator,} from 'react-navigation';

class HomeScreen extends Component{
    static navigationOptions = {
      'header': null
    }

    constructor(props) {
        super(props)
    }
      takePhoto = async () => {        
        //https://viblo.asia/p/how-to-upload-image-from-library-or-camera-with-crna-Qbq5QgBzZD8
        //https://docs.expo.io/versions/latest/sdk/imagepicker.html
        let pickerResult = await ImagePicker.launchCameraAsync({
          exif: false,
          allowsEditing: true,
          quality: 0.7,
          base64: true,
          aspect: [4, 3]
        })
        if (!pickerResult.cancelled) {
          this.handleUploadPhoto(pickerResult)
        }
    }
    
    choosePhoto = async () => {
        let pickerResult = await ImagePicker.launchImageLibraryAsync({
          exif: false,
          allowsEditing: false,
          quality: 0.7,
          base64: true
        })
        if (!pickerResult.cancelled) {
          this.handleUploadPhoto(pickerResult)
        }
     }
     
     handleUploadPhoto = pickerResult => {
        //submit to server here, maybe add loading screen
        this.props.navigation.navigate('Result', {'pickerResult': pickerResult})
        //ToastAndroid.show(pickerResult.width.toString(), ToastAndroid.SHORT);
  }
     
    render() {
        return(
            <View style={{marginTop:20}}>
                <Button
                    onPress={this.takePhoto}
                    title={'Take a photo'}
                />
               <Button 
                    onPress={this.choosePhoto}
                    title={'Choose a photo'}
                />
            </View>)
        
    }    
}

class ResultScreen extends Component{
  static navigationOptions = {
    'header': null
  }

  constructor(props){
    super(props);
  }

  render(){
    const {state} = this.props.navigation;
    return(<View> 
      <Text> {state.params.pickerResult.width.toString()} </Text>
      <Text> {state.params.pickerResult.height.toString()} </Text>
      </View>);
  }
}

const App = StackNavigator({
  Home: { screen: HomeScreen },
  Result: { screen: ResultScreen },
});

export default class AmazonOracle extends Component{
  render(){
    return(
    <App></App>);
  }
}