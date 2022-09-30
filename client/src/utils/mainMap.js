const API_KEY = process.env.VUE_APP_API_KEY;

export class MainMap {
  constructor() {
    this.map = {};
    this.markers = [];
    this.originalCoords = [-89.4077829,30.2988043]; // starting position [lng, lat]
  }

  async initMap() {
    mapboxgl.accessToken = API_KEY;
    this.map = new mapboxgl.Map({
      container: 'map', // container ID
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: this.originalCoords,
      zoom: 6,
      });
  }

  centerOnLocation(locationCoords) {

    this.map.flyTo({
      center:(locationCoords) ? [locationCoords.lng, locationCoords.lat] : this.originalCoords,
      zoom:8,
      speed: 2,
    });
  }

  addMapMarkers(paddles, clickCallback) {

    this.markers = paddles.map((paddle) => {

      const el = document.createElement('div');
      el.className = 'marker';

      const marker = new mapboxgl.Marker(el, {anchor:'bottom-left'})
        .setLngLat([paddle.pin[0], paddle.pin[1]])
        .addTo(this.map);

      let markerElem = marker.getElement();

      markerElem.addEventListener('click', () => {
          clickCallback(paddle.id);
       });

       markerElem.dataset.paddle_id = paddle.id;

      return marker;
    });
  }

  hideShowMarkers(filteredPaddleIds) {

    this.markers.forEach((m) => {
      let markerElem = m.getElement();

      if (filteredPaddleIds.includes(markerElem.dataset.paddle_id)) {
        markerElem.style.visibility = "visible";
      } else {
        markerElem.style.visibility = "hidden";
      }
    });
  }

  showMoreInfoButton(idPaddle) {
    let theMarker;
    this.markers.forEach((m) => {
      let markerElem = m.getElement();
      if ( markerElem.dataset.paddle_id == idPaddle ) {
        theMarker = markerElem;
      }
    });

    let icon = document.createElement('i');
    icon.classList.add('v-icon', 'v-icon__more-info', 'notranslate','mdi','mdi-information-outline','theme--dark','primary--text');
    icon.dataset.paddle_id = idPaddle;

    theMarker.after(icon);
  }

  getMapMarkers() {
    return this.markers;
  }

  drawPaddleRoutes(idPaddlesToShow, paddleData, callback) {

    if (idPaddlesToShow.length === 0) {
      this.removeAllRoutes();
    }

    //if source already exists, push to features array and update source data
    let source = this.map.getSource('routes');

    if (typeof source !== 'undefined') {

      let features = idPaddlesToShow.map((id) => {
        let thePaddle = paddleData.find((e) => e.id === id);
        return {
          'type': 'Feature',
          'properties': { 'name': thePaddle.name },
          'geometry': {
            'type': 'LineString',
            'coordinates': thePaddle.route
          }
        }
      })
      //update the source
      source.setData({
        "type": "FeatureCollection",
        "features": features
      });

    } else {
      //otherwise add the source with the route
      let thePaddle = paddleData.find((e) => e.id === idPaddlesToShow[0]);

      let feature = {
        'type': 'Feature',
        'properties': { 'name': thePaddle.name },
        'geometry': {
          'type': 'LineString',
          'coordinates': thePaddle.route
        }
      };
      this.map.addSource('routes', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
               feature
             ]
          }
      });

      this.map.addLayer({
        'id': 'layer',
        'type': 'line',
        'source': 'routes',
        'paint': {
        'line-color': '#ef6c00',
        'line-width': 6
        }
      });

      this.map.on('click', 'layer', (e) => {
        callback(e.features[0].properties.name);
      });

      this.map.on('mouseenter', 'layer', () => {
        this.map.getCanvas().style.cursor = 'pointer'
      });
      this.map.on('mouseleave', 'layer', () => {
        this.map.getCanvas().style.cursor = ''
      })
    }
  }

  removeAllRoutes() {
    this.map.getSource('routes').setData({
      "type": "FeatureCollection",
      "features": []
    });
  }

  flyToFitRouteBounds(paddleObj) {

    const bounds = new mapboxgl.LngLatBounds(
        paddleObj.pin,
        paddleObj.pin
    );

    for (const coord of paddleObj.route) {
      bounds.extend(coord);
    }

    this.map.fitBounds(bounds, {
      padding: 100,
      speed: 2
    });

  }

  zoomIn() {
    this.map.zoomIn();
  }

  zoomOut() {
    this.map.zoomOut();
  }
}
