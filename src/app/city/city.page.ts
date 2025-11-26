import { Component, ViewChild, ElementRef,OnInit,NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../service/server.service';
import { ToastController,NavController,Platform,LoadingController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import * as L from 'leaflet';

@Component({
  selector: 'app-city',
  templateUrl: './city.page.html',
  styleUrls: ['./city.page.scss'],
})

export class CityPage implements OnInit {

@ViewChild('map',{static:false}) mapElement: ElementRef;
  
  map: any;
  marker: any;
  address:string;
  text:any;
  type:any;
  currentLat: number;
  currentLng: number;

  autocomplete: { input: string; };
  autocompleteItems: any[];
  placeid: any;
  searchTimeout: any;

  constructor(

    public route: ActivatedRoute,
    public server : ServerService,
    public toastController: ToastController,
    public nav: NavController,
    public loadingController: LoadingController,
    public geolocation: Geolocation,
    public nativeGeocoder: NativeGeocoder,
    public platform : Platform,
    public zone: NgZone,


    ){


    this.text = JSON.parse(localStorage.getItem('app_text'));
    this.type = this.route.snapshot.paramMap.get('id');

    this.autocomplete = { input: '' };
    this.autocompleteItems = [];


  }

  ngOnInit()
  {
     
  }

  ionViewWillLeave() {
    // Clean up map when leaving the page
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
  }

  ionViewWillEnter()
  {
    this.platform.ready().then(() => {

      this.loadMap();

     });
  }

  async loadMap() {
    
    console.log("Loading Leaflet map");

    this.geolocation.getCurrentPosition().then((resp) => {
      
      this.currentLat = resp.coords.latitude;
      this.currentLng = resp.coords.longitude;

      // Initialize Leaflet map only if not already created
      if (!this.map) {
        this.map = L.map(this.mapElement.nativeElement).setView([this.currentLat, this.currentLng], 16);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(this.map);

        // Fix map size issues
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        }, 100);

        // Add a draggable marker at center
        this.marker = L.marker([this.currentLat, this.currentLng], {
          draggable: false,
          icon: L.icon({
            iconUrl: 'assets/map-marker.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          })
        }).addTo(this.map);

        // Update address when map is moved
        this.map.on('moveend', () => {
          if (this.map && this.map.getCenter) {
            try {
              const center = this.map.getCenter();
              if (center) {
                this.currentLat = center.lat;
                this.currentLng = center.lng;
                this.marker.setLatLng([this.currentLat, this.currentLng]);
                this.getAddressFromCoords(this.currentLat, this.currentLng);
              }
            } catch (e) {
              console.error('Error getting map center:', e);
            }
          }
        });
      } else {
        // Map already exists, just update position
        this.map.setView([this.currentLat, this.currentLng], 16);
        this.marker.setLatLng([this.currentLat, this.currentLng]);
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        }, 100);
      }

      this.getAddressFromCoords(this.currentLat, this.currentLng);
 
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
 

  async getAddressFromCoords(lattitude, longitude) {
    console.log("getAddressFromCoords "+lattitude+" "+longitude);
    
    // Use Nominatim for reverse geocoding (works in browser)
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lattitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    
    fetch(nominatimUrl)
      .then(response => response.json())
      .then(result => {
        if (result && result.display_name) {
          this.address = result.display_name;
        } else {
          this.address = "Address Not Available!";
        }
      })
      .catch((error: any) => { 
        console.log("Geocoding error:", error);
        this.address = "Address Not Available!";
      });
 
  }

  async saveAddress(data)
  {
      localStorage.setItem('current_lat', this.currentLat.toString());
      localStorage.setItem('current_lng', this.currentLng.toString());
      localStorage.setItem('current_add',data.address);
      
      window.location.href = "/home";
  }

  async presentToast(txt) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 3000,
      position : 'top',
      mode:'ios',
      color:'dark'
    });
    toast.present();
  }

  // AUTOCOMPLETE using Nominatim (OpenStreetMap)
  UpdateSearchResults(){
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (this.autocomplete.input == '' || this.autocomplete.input.length < 3) {
      this.autocompleteItems = [];
      return;
    }
    
    // Debounce the search - wait 500ms after user stops typing
    this.searchTimeout = setTimeout(() => {
      // Use Nominatim API for geocoding with bias towards current location
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.autocomplete.input)}&limit=5&viewbox=${this.currentLng-0.5},${this.currentLat-0.5},${this.currentLng+0.5},${this.currentLat+0.5}&bounded=1`;
      
      fetch(nominatimUrl)
        .then(response => response.json())
        .then(predictions => {
          this.zone.run(() => {
            this.autocompleteItems = predictions.map(p => ({
              display_name: p.display_name,
              lat: parseFloat(p.lat),
              lon: parseFloat(p.lon),
              place_id: p.place_id
            }));
          });
        })
        .catch(error => {
          console.error('Geocoding error:', error);
          this.autocompleteItems = [];
        });
    }, 500);
  }
  
  // Select search result and move map
  SelectSearchResult(item) {
    this.placeid = item.place_id;
    
    // Move map to selected location
    this.map.setView([item.lat, item.lon], 16);
    this.marker.setLatLng([item.lat, item.lon]);
    this.currentLat = item.lat;
    this.currentLng = item.lon;
    
    this.getAddressFromCoords(item.lat, item.lon);
    this.ClearAutocomplete();
  }
  
  // Clean the autocomplete list
  ClearAutocomplete(){
    this.autocompleteItems = []
    this.autocomplete.input = ''
  }


}
