import { Component,ViewChild, ElementRef } from '@angular/core';
import { NavController,Platform,LoadingController,IonSlides,ToastController,AlertController } from '@ionic/angular';
import { ServerService } from '../service/server.service';
import { ActivatedRoute } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import * as L from 'leaflet';
import 'leaflet-routing-machine';


@Component({
  selector: 'app-detail',
  templateUrl: 'detail.page.html',
  styleUrls: ['detail.page.scss'],
})
export class DetailPage {

@ViewChild('map',{static:false}) mapElement: ElementRef;
@ViewChild('directionsPanel',{static:false}) directionsPanel: ElementRef;

data:any
text:any;
oid:any;
routingControl:any;
intr:any;
fakeData = [1,2,3,4,5,6,7];
map:any;
address:any;
tm:any;
  constructor(public platform : Platform,public loadingController: LoadingController,public server : ServerService,private nav: NavController,public toastController: ToastController,public alertController: AlertController,private route: ActivatedRoute,public geolocation: Geolocation,public nativeGeocoder: NativeGeocoder) {

  	this.oid = this.route.snapshot.paramMap.get('id');
    this.text    = JSON.parse(localStorage.getItem('app_text'));

  	this.intr = setInterval(() => {      
        
      this.loadData();

    },15000);
  }

  ngOnInit()
  {
    
  }

  ionViewWillLeave()
  {
    clearInterval(this.intr);
  }

  ionViewWillEnter()
  {
    this.loadData();
  }

async loadData()
{
  this.server.orderDetail(this.oid).subscribe((response:any) => {

    this.data = response.data;

    if(this.data.st == 2)
    {
       this.nav.navigateRoot('/home');
       this.presentToast(this.text.order_cancel_text);
    }

    console.log(this.data);

    this.loadMap();

    });

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

  async loadMap() {

      this.geolocation.getCurrentPosition().then((resp) => {
            
      // Initialize Leaflet map
      if (!this.map) {
        this.map = L.map(this.mapElement.nativeElement).setView([this.data.lat, this.data.lng], 16);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(this.map);
      }

      // Remove existing routing control if any
      if (this.routingControl) {
        this.map.removeControl(this.routingControl);
      }

      if(this.data.st == 0 ||  this.data.st == 1)
      {
    	  this.startNavigating(this.data.order.slat, this.data.order.slng);
      }
      else
      {
    	  this.startNavigating(this.data.lat, this.data.lng);
      }
    
    }).catch((error) => {
      console.log('Error getting location', error);
    });    

  }

  startNavigating(lat,lng){

    // Use Leaflet Routing Machine for directions
    this.routingControl = (L as any).Routing.control({
      waypoints: [
        L.latLng(parseFloat(lat), parseFloat(lng)),
        L.latLng(parseFloat(this.data.order.lat), parseFloat(this.data.order.lng))
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{color: '#6FA1EC', weight: 4}]
      }
    }).addTo(this.map);

    // Get route summary when available
    this.routingControl.on('routesfound', (e) => {
      const routes = e.routes;
      const summary = routes[0].summary;
      // Convert seconds to readable format
      const minutes = Math.floor(summary.totalTime / 60);
      this.tm = minutes + ' min';
    });

    }
}
