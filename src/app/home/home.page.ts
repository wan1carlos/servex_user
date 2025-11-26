import { Component, OnInit,ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../service/server.service';
import { NavController,Platform,LoadingController,IonSlides,AlertController } from '@ionic/angular';
declare var google;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
@ViewChild('content',{static : false}) private content: any;

  BannerOption = {
    initialSlide: 0,
    slidesPerView: 1,
    loop: true,
    centeredSlides: false,
    autoplay:true,
    speed: 500,
    spaceBetween:-10,

  }

  CateOption = {
    initialSlide: 0,
    slidesPerView: 4.4,
    loop: false,
    centeredSlides: false,
    autoplay:false,
    speed: 500,
    spaceBetween:-40,

  }

  TrendOption = {
    initialSlide: 0,
    slidesPerView: 2.1,
    loop: true,
    centeredSlides: false,
    autoplay:false,
    speed: 500,
    spaceBetween:0,

  }

  sl:any = [1,2,3,4,5];

  data:any;
  fakeData = [1,2,3,4,5,6,7];
  subscription:any;
  text:any;
  address:any;
  storeData:any;
  allData:any;
  filterPress:any;
  stores:any;
  store_type = 0;

  constructor(private activatedRoute: ActivatedRoute,public server : ServerService,public loadingController: LoadingController,public alertController: AlertController,public platform : Platform,public nav : NavController) {

   this.text = JSON.parse(localStorage.getItem('app_text'));
   this.address = localStorage.getItem('current_add');
  }

  ngOnInit()
  {
  	this.loadData();
  }

  cateData(id)
  {
    this.data = null;
    this.loadData(id);
  }

  ionViewDidEnter()
  {

    this.subscription = this.platform.backButton.subscribe(()=>{
          
        this.presentAlertConfirm();

      });
  }

  ionViewWillLeave(){
      
      this.subscription.unsubscribe();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: this.text.exit_app,
      message: this.text.exit_app_desc,
      buttons: [
        {
          text: this.text.cancel_btn,
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: this.text.exit_app_confirm,
          handler: () => {
          
            navigator['app'].exitApp();

          }
        }
      ]
    });

    await alert.present();
}
  
  setType(type)
  {
    this.store_type = type;

    this.data = null;

    this.loadData(0,true);
  }

  async loadData(id = 0,load = false)
  {
    this.server.homepage(id,this.store_type).subscribe((response:any) => {
  
    this.data       = response.data;
    this.storeData  = response.data.store;
    this.allData    = response.data.store;

    console.log(this.data.running);

    if(id > 0 && this.data || load)
    {
      setTimeout(() => {
      this.content.scrollToBottom(300);
      }, 100);
    }

    localStorage.setItem('app_text', JSON.stringify(response.data.text));

    localStorage.setItem('setting', JSON.stringify(response.data.setting));

    });
  }

  item(store)
  {
    if(store.open)
    {
      this.nav.navigateForward('/item/'+store.id+'/'+this.store_type);
    }
  }

  search()
  {
    localStorage.setItem('trend_data', JSON.stringify(this.data.trend));
    localStorage.setItem('all_data', JSON.stringify(this.data.search_data));

    this.nav.navigateForward('/search');
  }

account()
{
  if(localStorage.getItem('user_id') && localStorage.getItem('user_id') != "null")
  {
    this.nav.navigateForward('/account');
  }
  else
  {
    this.nav.navigateForward('/login');
  }
}

bannerLink(banner)
{
  if(banner.link_to == 1)
  {
    this.nav.navigateForward('/item/'+banner.link_id);
  }
  else if(banner.link_to == 2)
  {
    this.data = null;
    this.loadData(banner.link_id);
  }
  else if(banner.link_to == 3)
  {
    window.open(banner.link_id, "_blank");
  }
}

filterData(id)
{
  this.stores = this.allData;

  this.filterPress = id;

  if(id == 1)
  {
     this.stores.sort((a,b) => {
        
        return parseFloat(b.rating) - parseFloat(a.rating);

        });
  }
  else if(id == 2)
  {
    this.stores.sort((a,b) => {
    
        return parseFloat(a.km) - parseFloat(b.km);

      });
  }
  else
  {
        this.stores.sort((a,b) => {
    
        return parseFloat(b.id) - parseFloat(a.id);

        });
  }
}

doRefresh(event) {
    console.log('Begin async operation');

    setTimeout(() => {
     this.loadData();
      event.target.complete();
    }, 2000);
  }

}
