import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import Carousel from 'react-native-snap-carousel';


function renderItem({ item }) {
  return (
    <View>
      <Text>{item.text}</Text>
      <Image
        source={{ uri: item.uri }}
        style={{
          ...styles.chart,
          height: ((Dimensions.get('window').width - 20) * 2) / 3,
          width: Dimensions.get('window').width - 20
        }}
      />
    </View>
  )
}

export default class App extends Component {
  state = {
    activeIndex: 0,
    data: [],
    isLoaded: false,
    error: false
  }

  _onlyUnique(value, index, self) {
    if (!value || value === "Ship") return false;
    return self.indexOf(value) === index;
  }

  // Get JSON blob with country data from API server
  async _updateCountryData() {
    try {
      const res = await fetch('https://api.dashboard.eco/covid-countries');
      const json = await res.json();
      let uniqueKey = 0;
      // Get simple array of all regions
      const regions = json.data.map(d => d.region).filter(this._onlyUnique);
      // Add list of countries to each region
      const regionsAndCountries = regions.map(region => ({
        region: region,
        countries: json.data.filter(d => d.region == region).map(x => ({
          key: (++uniqueKey).toString(),
          country: x.country,
          uri: "https://hdahle.github.io/telegrambot/img/covid-" + x.country.replace(/[^a-z]/gi, "_") + ".png",
        }))
      }))
      console.log('_updateCountryData: #regions:', regionsAndCountries.length);
      // Set the state and force a render
      this.setState({
        isLoaded: true,
        error: false,
        data: regionsAndCountries
      })
    } catch (e) {
      console.log('_updateCountryData: ERROR reading country data');
      this.setState({ error: true })
      return;
    }
  }

  // Initialization: Update country data
  async componentDidMount() {
    this._updateCountryData()
  }


  // Each carousel item is a world-region (Asia, Africa,...)
  _renderCarouselItem({ item }) {
    console.log('_renderItemFlatList:', item.region, item.countries.length);
    return (
      <View style={styles.carouselItem}>
        <Text style={styles.text}>{item.region}</Text>
        <FlatList
          data={item.countries}
          renderItem={renderItem}
        />
        <StatusBar style="auto" />
      </View>
    )
  }

  render() {
    const { isLoaded, error } = this.state;
    console.log('render, isloaded=', isLoaded, ' error:', error);
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.menuBar}>
          <View>
            <Image source={require('./assets/fp-logo.png')} style={styles.logo} />
          </View>
          <View>
          </View>
          <View>
            <TouchableOpacity onPress={() => { alert('Click'); }}>
              <Text style={styles.burger}>=</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', }}>
          <Carousel
            layout={"tinder"}
            ref={ref => this.carousel = ref}
            data={this.state.data}
            sliderWidth={Dimensions.get('window').width}
            itemWidth={Dimensions.get('window').width}
            renderItem={this._renderCarouselItem}
            onSnapToItem={index => this.setState({ activeIndex: index })} />
        </View>
      </SafeAreaView>
    );
  }
}

// Note: for things that are computed for responsiveness, use inline styles instead of this stylesheet

const styles = StyleSheet.create({
  statusBar: {
    height: StatusBar.currentHeight
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 50
  },
  menuBar: {
    flexDirection: 'row',
    height: 50,
    justifyContent: 'space-between',
    backgroundColor: '#fff'
  },
  logo: {
    height: 28,
    marginTop: 10,
    width: 200,
    resizeMode: 'contain'
  },
  carouselItem: {
    backgroundColor: 'white',
    padding: 0,
    marginLeft: 10,
    marginRight: 10,
  },
  chart: {
    margin: 0,
    borderRadius: 3,
    backgroundColor: '#ddd',
    resizeMode: 'contain'
  },
  text: {
    backgroundColor: '#fff',
    textTransform: 'capitalize',
    padding: 10,
    margin: 10,
  },
  burger: {
    margin: -4,
    marginRight: 30,
    fontSize: 40,
  },
});
