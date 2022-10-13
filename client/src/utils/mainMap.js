const API_KEY = process.env.VUE_APP_API_KEY;
const COLOR_SHORT = '#00AF54'; //< 6 miles
const COLOR_MEDIUM = '#FFC53A'; // >= 6miles <= 11
const COLOR_LONG = '#df323b'; // > 11miles

export class MainMap {
  constructor() {
    this.map = {};
    this.markers = [];
    this.originalCoords = [-90.1089,29.9520]; // starting position [lng, lat]
  }

  async initMap() {
    mapboxgl.accessToken = API_KEY;
    this.map = new mapboxgl.Map({
      container: 'map', // container ID
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: this.originalCoords,
      zoom: 8,
      });

    this.map.addControl(new mapboxgl.ScaleControl({unit:'imperial', position: 'top-right'}));
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

      let markerColor = this.getPaddleColor(paddle, true);
      markerColor = 'marker--' + markerColor
      el.classList.add(markerColor);

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

  getPaddleColor(thePaddle,strVal = false) {
    let color;
    debugger;
    let distance = Number(thePaddle.distance);
    if (distance < 6 ) {
      if (strVal) {
        color = 'green';
      } else {
        color = COLOR_SHORT;
      }
    } else if ( distance <= 11 ) {
      if (strVal) {
        color = 'yellow';
      } else {
        color = COLOR_MEDIUM;
      }
    } else {
      if (strVal) {
        color = 'red';
      } else {
        color = COLOR_LONG;
      }
    }
    return color;
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

        let color = this.getPaddleColor(thePaddle);
  
        return {
          'type': 'Feature',
          'properties': { 'name': thePaddle.name, color: color },
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

      let color = this.getPaddleColor(thePaddle);

      let feature = {
        'type': 'Feature',
        'properties': { 'name': thePaddle.name, 'color':color},
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
        'line-width': 6,
        'line-color': ['get', 'color']
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
