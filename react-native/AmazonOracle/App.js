import React, { Component } from 'react'
import { ImagePicker } from 'expo'
import { View,  Button,  ToastAndroid } from 'react-native'
//https://viblo.asia/p/how-to-upload-image-from-library-or-camera-with-crna-Qbq5QgBzZD8
//https://docs.expo.io/versions/latest/sdk/imagepicker.html
export default class HomeScreen extends Component{
    constructor(props) {
        super(props)
    }
      takePhoto = async () => {
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
        ToastAndroid.show(pickerResult.width.toString(), ToastAndroid.SHORT);
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
     