import React, { Component } from 'react'
import { ImagePicker } from 'expo'
import { View,  ToastAndroid, StyleSheet, ActivityIndicator, ScrollView, Image, FlatList, Linking} from 'react-native'
import { StackNavigator,} from 'react-navigation';
import { Button, Text, Avatar, Divider } from 'react-native-elements';

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
          allowsEditing: false,
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

        this.props.navigation.navigate('Loading');
        try{
            // POST
            fetch('http://n1njacyb.org/endpoint/', {
                method: 'POST',
                body: JSON.stringify({
                    img: pickerResult.base64,
                }),
                headers: { "Content-Type": "application/json" },
            }).then(
                (resp) => {return resp.json()}
            ).then((resp) => {
                // CALLBACK
                // ToastAndroid.show("good: "+JSON.stringify(resp), ToastAndroid.SHORT);
                this.props.navigation.navigate('Result', {'pickerResult': pickerResult, 'result':resp});
            });


        } catch (error){
            ToastAndroid.show("bad", ToastAndroid.SHORT);
            this.props.navigation.navigate('Home');
        }
        // this.props.navigation.navigate('Result', {'pickerResult': pickerResult});
    }

    render() {
        return(
            <View style={{marginTop:20, flex:1}}>
                <View style={{flex:1, justifyContent:"center", padding:30}}>
                    <Text h1 style={styles.center}>
                        Amazon Oracle
                    </Text>
                    <Text style={styles.center}>
                        Price check your items by taking a picture
                    </Text>
                </View>
                <View style={{flex:1}}>
                    <View style={{margin:10}}>
                        <Button
                            large
                            backgroundColor="lightseagreen"
                            icon={{name: 'compass', type: 'font-awesome'}}
                            onPress={this.takePhoto}
                            title={'Take a photo'}
                        />
                    </View>
                    <View style={{margin:10}}>
                       <Button
                            large
                            backgroundColor="teal"
                            icon={{name: 'code', type: 'font-awesome'}}
                            onPress={this.choosePhoto}
                            title={'Choose a photo'}
                        />
                    </View>
                </View>
            </View>
        )

    }
}


class CoolText extends Component{
    constructor(props){
        super(props);
    }

    render(){
        var c = "black";
        if(this.props.color){
            c = this.props.color;
        }
        return (
            <View style={{margin:5}}>
                <Text style={{textAlign:"center", color:"grey", fontSize:20}}>
                    {this.props.title}
                </Text>
                <Text style={{textAlign:"center", fontSize:30, color:c}}>
                    {this.props.value}
                </Text>
            </View>
        );
    }
}
class SimilarItem extends Component{
    constructor(props){
        super(props);
    }
    render(){
        var title = this.props.title;
        var txtLimit = 30;
        if(title.length > txtLimit){
            title = title.substring(0,txtLimit) + "...";
        }
        return(
            <View style={{flexDirection:"row", margin:10}}>
                <View >
                    <Avatar
                        large
                        rounded
                        source={{uri:this.props.uri}}
                        onPress={() => Linking.openURL(this.props.link)}
                    />
                </View>
                <View style={{flexDirection:"column", justifyContent:"space-between", marginLeft:10}}>
                    <Text style={{marginTop:10, fontSize:14}}>{title}</Text>
                    <Text style={{marginBottom:10, color:"darkorange", fontSize:18}}>{this.props.price}</Text>
                </View>
            </View>
        );
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
    // const result = {
    //     predicted_price:12,
    //     predicted_cat: "Car",
    //     similar_items:[
    //         {
    //             key:0,
    //             title:"Baka",
    //             asin:"http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/sign-check-icon.png",
    //             link:"https://google.ca",
    //             price:12
    //         },
    //         {
    //             key:1,
    //             title:"OHH ",
    //             asin:"http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/sign-check-icon.png",
    //             link:"https://youtube.ca",
    //             price:12
    //         }
    //     ]
    // }
    const result = this.props.navigation.state.params.result;
    return(
        <ScrollView style={{flex:1, paddingTop:0}}>
            <View style={{alignItems:"center"}}>
                <Image
                    style={{width:500, height:300}}
                    source={{uri: state.params.pickerResult.uri}}
                />
            </View>
            <View style={{flex:2, justifyContent:"center"}}>
                <CoolText title="Predicted Price" value={"$"+result.predicted_price} color="darkorange"/>
                <CoolText title="Predicted Category" value={result.predicted_cat}/>
            </View>
            <Divider style={{ backgroundColor: 'grey' }} />
            <View style={{flex:1, padding:10}}>
                <Text style={{textAlign:"center", color:"grey", fontSize:20}}>
                    Similar Items
                </Text>
                <FlatList
                    data={result.similar_items}
                    renderItem={({item}) =>
                        <SimilarItem title={item.title} uri={item.image_url} price={"$"+item.price} link={item.asin}/>
                    }
                />
            </View>
        </ScrollView>
    );
  }
}

class Loading extends Component{
      static navigationOptions = {
            'header': null
      }

      constructor(props){
          super(props);
      }

      render(){
            return(
                <View style={{flex:1, justifyContent:"center"}}>
                    <ActivityIndicator size="large" color="grey" />
                </View>
            );
      }
}

const styles = StyleSheet.create({
    center: {textAlign:"center"}
});

const App = StackNavigator({
    Home: { screen: HomeScreen },
        Result: { screen: ResultScreen },
    Loading: { screen: Loading }
});

export default class AmazonOracle extends Component{
  render(){
    return(
    <App></App>);
  }
}
