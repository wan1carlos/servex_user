import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../service/server.service';
import { ToastController,NavController,Platform,LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})

export class AccountPage implements OnInit {
  
  data:any;
  text:any;
  
  constructor(private route: ActivatedRoute,public server : ServerService,public toastController: ToastController,private nav: NavController,public loadingController: LoadingController){

  this.text = JSON.parse(localStorage.getItem('app_text'));
  }

  ngOnInit()
  {
  }

  ionViewWillEnter()
  {
    if(localStorage.getItem('user_id') == 'null' || !localStorage.getItem('user_id') || localStorage.getItem('user_id') == undefined)
    {
      this.presentToast(this.text.access_page);

      this.nav.navigateRoot('/home');
    }
    else
    {
      this.loadData();
    }
  }

async loadData()
{
  const loading = await this.loadingController.create({
    message: '',
    spinner:'bubbles'
    });
    await loading.present();

    this.server.userInfo(localStorage.getItem('user_id')).subscribe((response:any) => {
      this.data = response.data;
      localStorage.setItem('user_data', JSON.stringify(response.data));
      // Dispatch storage event to update menu/sidebar
      window.dispatchEvent(new Event('storage'));
      loading.dismiss();
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

logout()
{
  // Force full localStorage clear to prevent stale session
  localStorage.clear();
  this.nav.navigateRoot('/home');
  setTimeout(() => {
    window.location.reload();
  }, 300);
}
}
