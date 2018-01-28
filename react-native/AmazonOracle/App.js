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
        this.state = {isLoading: false}
        this._render.bind(this)
        this._reset.bind(this)
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

        this.setState({isLoading:true});
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
                setTimeout(() => this._reset(), 500);
            });
        } catch (error){
            this.setState({isLoading:false});
            ToastAndroid.show("POST Error", ToastAndroid.SHORT);
            this.props.navigation.navigate('Home');
        }
        // this.props.navigation.navigate('Result', {'pickerResult': pickerResult});
    }
    _reset(){
        this.setState({isLoading:false});
    }
    _render(){
        if(!this.state.isLoading){
            return(
                <View style={{marginTop:20, flex:1}}>
                    <View style={{flex:1, justifyContent:"center", padding:30}}>
                        <Text h1 style={styles.center}>
                            Amazon Oracle
                        </Text>
                        <Text style={styles.center}>
                            Price check with a picture
                        </Text>
                    </View>
                    <View style={{flex:1}}>
                        <View style={{margin:10}}>
                            <Button
                                large
                                backgroundColor="lightseagreen"
                                icon={{name: 'camera-alt'}}
                                onPress={this.takePhoto}
                                title={'Take a photo'}
                            />
                        </View>
                        <View style={{margin:10}}>
                           <Button
                                large
                                backgroundColor="teal"
                                icon={{name: 'collections'}}
                                onPress={this.choosePhoto}
                                title={'Choose a photo'}
                            />
                        </View>
                    </View>
                </View>
            )
        }else{
            return(
                <View style={{flex:1, justifyContent:"center"}}>
                    <ActivityIndicator size="large" color="grey" />
                </View>
            )
        }
    }
    render() {
        return(
            this._render()
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
        this._open.bind(this);
    }
    _open(link){
        if(this.props.exists || true){
            Linking.openURL(this.props.link)
        }
    }

    render(){
        var title = this.props.title;
        var txtLimit = 30;
        if(title.length > txtLimit){
            title = title.substring(0,txtLimit) + "...";
        }
        var opacity = this.props.exists ? 1 : 0.25;
        return(
            <View style={{flexDirection:"row", margin:5, padding:5}}>
                <View >
                    <Avatar
                        large
                        rounded
                        source={{uri:this.props.uri}}
                        onPress={() => this._open(this.props.link)}
                    />
                </View>
                <View style={{flexDirection:"column", justifyContent:"space-between", marginLeft:10}}>
                    {this.props.exists &&
                        <Text style={{marginTop:10, fontSize:14, color:"rgba(0,0,0,"+opacity+")"}}>{title}</Text>
                    }
                    {!this.props.exists &&
                        <Text style={{marginTop:10, fontSize:14, color:"rgba(0,0,0,"+opacity+")", textDecorationLine: 'line-through'}}>{title}</Text>
                    }
                    <Text style={{marginBottom:10, fontSize:18, color:"rgba(226, 146, 18, "+opacity+")"}}>{this.props.price + (this.props.exists?"":" | No longer exists")}</Text>
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
    // this.props.navigation.state.params.Home.setState({isLoading:false});
  }

  render(){
    const {state} = this.props.navigation;
    const result = this.props.navigation.state.params.result;
    return(
        <ScrollView style={{flex:1, paddingTop:0}}>
            <View style={{alignItems:"center", marginBottom:10}}>
                <Image
                    style={{width:500, height:300}}
                    source={{uri: state.params.pickerResult.uri}}
                />
            </View>
            <View style={{flex:2, justifyContent:"center"}}>
                <CoolText title="Predicted Price" value={"$"+result.predicted_price} color="darkorange"/>
                <CoolText title="Average Price" value={"$"+result.predicted_price_avg} color="darkorange"/>
                <CoolText title="Predicted Category" value={result.predicted_cat}/>
            </View>
            <Divider style={{ backgroundColor: 'grey', margin:10}} />
            <View style={{flex:1, padding:10}}>
                <Text style={{textAlign:"center", color:"grey", fontSize:20}}>
                    Similar Items
                </Text>
                <FlatList
                    data={result.similar_items}
                    renderItem={({item}) =>
                        <SimilarItem title={item.title} uri={item.image_url} price={"$"+item.price} link={item.asin} exists={item.exists}/>
                    }
                />
            </View>
        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
    center: {textAlign:"center"}
});

const App = StackNavigator({
    Home: { screen: HomeScreen },
    Result: { screen: ResultScreen }
});

export default class AmazonOracle extends Component{
  render(){
    return(
    <App></App>);
  }
}
