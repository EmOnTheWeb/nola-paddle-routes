const API_KEY = process.env.VUE_APP_API_KEY;

export class MainMap {
  constructor() {
    this.map = {};
    this.markers = [];
  }

  async initMap() {

    mapboxgl.accessToken = API_KEY;
    this.map = new mapboxgl.Map({
      container: 'map', // container ID
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: [-89.4077829,30.2988043], // starting position [lng, lat]
      zoom: 8,
      });
  }

  centerOnCurrentLocation(locationCoords) {
    this.map.flyTo({
      center:[locationCoords.lng, locationCoords.lat]
    });
  }

  addMapMarkers(paddles, clickCallback) {

    this.markers = paddles.map((paddle) => {
      const marker = new mapboxgl.Marker()
        .setLngLat([paddle.location.coordinates.lng, paddle.location.coordinates.lat])
        .addTo(this.map);

      let markerElem = marker.getElement();

      markerElem.addEventListener('click', () => {
          clickCallback(paddle.id);
       });

       markerElem.dataset.paddle_id = paddle.id;
    
      return marker;
    });
  }

  getMapMarkers() {
    return this.markers;
  }
}
