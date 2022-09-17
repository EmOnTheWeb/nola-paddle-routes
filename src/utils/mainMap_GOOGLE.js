const API_KEY = process.env.VUE_APP_API_KEY;
const CALLBACK_NAME = 'gmapsCallback';

export class MainMap {
  constructor() {
    this.map = {};
    this.initialized = !!window.google;
    this.resolveInitPromise;
    this.rejectInitPromise;
    this.mapObj;
    this.markers = [];
    this.initPromise = new Promise((resolve, reject) => {
      this.resolveInitPromise = resolve;
      this.rejectInitPromise = reject;
    });
  }

  loadScript() {
    if (this.initialized) return this.initPromise;

    this.initialized = true;

    window[CALLBACK_NAME] = () => this.resolveInitPromise(window.google);

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=${CALLBACK_NAME}`;
    script.onerror = this.rejectInitPromise;
    document.querySelector('head').appendChild(script);

    return this.initPromise;

  }

  async initMap() {
    this.mapObj = await this.loadScript();
    const mapEl = document.getElementById('map');

    this.map = new this.mapObj.maps.Map(mapEl, {
      center: {lat: 30.2988043, lng: -89.4077829},
      zoom: 8
    });
  }

  centerOnCurrentLocation(locationCoords) {
    const center = new google.maps.LatLng(locationCoords.lat, locationCoords.lng);
    this.map.panTo(center);
  }

  addMapMarkers(paddles, clickCallback) {
    // Add the markers to the map
    this.markers = paddles.map((paddle) => {
      return new this.mapObj.maps.Marker({
        position: paddle.location.coordinates,
        map: this.map,
        paddle_id: paddle.id
      });
    });

    // Add event listeners to the markers
    this.markers.map((marker, i) => {
      marker.addListener('click', () => {
        clickCallback(marker.get('paddle_id'));
      });
    });

  }

  getMapMarkers() {
    return this.markers;
  }
}
