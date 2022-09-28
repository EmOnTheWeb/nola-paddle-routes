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
      zoom: 8,
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

  getMapMarkers() {
    return this.markers;
  }

  showPaddleRoute(paddle) {
    this.map.addSource('route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
          'type': 'LineString',
          'coordinates': paddle.route
        }
      }
    });

    this.map.addLayer({
      'id': paddle.id,
      'type': 'line',
      'source': 'route',
      'layout': {
      'line-join': 'round',
      'line-cap': 'round'
      },
      'paint': {
      'line-color': '#888',
      'line-width': 8
      }
    });
  }
}
