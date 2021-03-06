import { Component, OnInit, } from '@angular/core';
import { GmhService } from 'src/app/shared/services/gmh.service';
import { User } from 'src/app/shared/models/User.model';
import { UserService } from 'src/app/shared/services/user.service';
import { GMH } from 'src/app/shared/models/Gmh.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoryGMH } from 'src/app/shared/models/CategoryGMH.model';
import { CategoriesService } from 'src/app/shared/services/categories.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-the-gmh',
  templateUrl: './manage-the-gmh.component.html',
  styleUrls: ['./manage-the-gmh.component.css'],

})
export class ManageTheGMHComponent implements OnInit {
  currentUser: User
  myGmhim: GMH[]
  currentgmh: GMH = undefined
  open: boolean = false;
  newgmh = false;
  editGmhForm: FormGroup;
  adress: string;
  masterCategory: CategoryGMH;
  tatC: CategoryGMH;
  display:boolean=false;
  constructor(private gmhService: GmhService, private userService: UserService, private categoriesService: CategoriesService,private router:Router) { }

  ngOnInit(): void {
    this.gmhService.setMyGmhim(this.myGmhim)
    this.editGmhForm = new FormGroup({
      GmhhName: new FormControl(),
      Phone: new FormControl('',Validators.pattern('[0-9]{9,10}')),
      E_mail: new FormControl('',Validators.email),
      Comments: new FormControl(),
      Adress: new FormControl(),
      userName: new FormControl()
    });
    this.currentUser = this.userService.CurrentUser;
    this.getMyGmhim()
    this.myGmhim = JSON.parse(localStorage.getItem('gmhim'));
  }
  showDialog() {
    this.display = !this.display;
}
  getMyGmhim() {
    this.gmhService.getMyGmhim(this.userService.CurrentUser).subscribe(
      res => {
        this.gmhService.setMyGmhim(res); this.myGmhim = res;
        localStorage.setItem('gmhim', JSON.stringify(res));
        this.myGmhim.forEach(g =>
          this.gmhService.getUser(g).subscribe(
            res => g.User = res
          ))
      },
      err => { console.log(err); }
    )
  }
  delete(gmh) {
    if (confirm("Are you sure to delete")) {
      this.gmhService.delete(gmh).subscribe(
        res => console.log(res),
        err => console.log(err)
      );
    }
  }
  close() {
    this.open = false;
  }
  edit(g: GMH) {
    this.open = true
    this.currentgmh = g;
    console.log(g);
    
    this.adress=this.currentgmh.Adress;
    this.editGmhForm.controls.GmhhName.setValue(g.GmhName)
    this.editGmhForm.controls.Adress.setValue(g.Adress)
    this.editGmhForm.controls.Phone.setValue(g.Phone)
    this.editGmhForm.controls.Comments.setValue(g.comments)
    this.editGmhForm.controls.E_mail.setValue(g.e_mail)
  }
  saveChange() {
    let g = new GMH();
    g.Adress = this.adress;
    g.GmhCode=this.currentgmh.GmhCode;
    g.GmhName = this.editGmhForm.controls.GmhhName.value;
    g.Phone = this.editGmhForm.controls.Phone.value;
    g.comments = this.editGmhForm.controls.Comments.value;
    g.e_mail= this.editGmhForm.controls.E_mail.value;
    this.open = false
    console.log(g);
    
    this.gmhService.saveChange(g).subscribe(
      res => {
        console.log(res)
        if (res) this.getMyGmhim();
      }
    )
  }
  handleDestinationChange(a: Address) {
    this.adress = a.formatted_address;
  }
}