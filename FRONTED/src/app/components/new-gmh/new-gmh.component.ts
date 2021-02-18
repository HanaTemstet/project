import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CategoryGMH } from 'src/app/shared/models/CategoryGMH.model';
import { GMH } from 'src/app/shared/models/Gmh.model';
import { User } from 'src/app/shared/models/User.model';
import { CategoriesService } from 'src/app/shared/services/categories.service';
import { GmhService } from 'src/app/shared/services/gmh.service';
import { UserService } from 'src/app/shared/services/user.service';
import { isCategory } from 'src/app/validators/valid';

@Component({
  selector: 'app-new-gmh',
  templateUrl: './new-gmh.component.html',
  styleUrls: ['./new-gmh.component.css']
})
export class NewGmhComponent implements OnInit {
  gmhForm: FormGroup;
  filteredTatCategories: Observable<CategoryGMH[]>;
  categories: Array<CategoryGMH>;
  tatCategories: CategoryGMH[];
  filteredCategories: Observable<CategoryGMH[]>;
  myGmhim: GMH[];
  currLat = 0;
  currLng = 0;
  adress;
  myDetails:boolean=true;
  constructor(private gmhService: GmhService, private userService: UserService, private categoriesService: CategoriesService, private router: Router) { }

  ngOnInit(): void {
    this.gmhForm = new FormGroup({
      GmhName: new FormControl('', Validators.required),
      category: new FormControl('',Validators.required),
      tatCategory: new FormControl({ value: '', disabled: true }),
      phone: new FormControl('',Validators.pattern('[0-9]{9,10}')),
      e_mail: new FormControl('',Validators.email),
      comments: new FormControl()
    },)
    this.myGmhim = JSON.parse(localStorage.getItem('gmhim'));
    this.gmhService.setMyGmhim(this.myGmhim)
    this.getMyGmhim();
    this.getCurrentLocation();
    this.getCategoryGmh();
  }
  getTatCategoriesForGmh(c) {
    this.gmhForm.controls["tatCategory"].enable();
      this.gmhService.getCategoriesForGmach(c.option.value).subscribe(res => {
        this.tatCategories = res;
          this.filteredTatCategories = this.gmhForm.controls.tatCategory.valueChanges
            .pipe(
              startWith(''),
              map(value => typeof value === 'string' ? value : value.CategoryName),
              map(name => name ? this._filter(name) : this.tatCategories.slice())
            );
        err => { console.log(err); }
      });
  }
  filter() {
    this.filteredCategories = this.gmhForm.controls.category.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.CategoryName),
        map(name => name ? this._filter(name) : this.categories.slice())
      );
  }
  displayFn(c: CategoryGMH): string {
    return c && c.CategoryName ? c.CategoryName : '';
  }
  private _filter(name: string): CategoryGMH[] {
    const filterValue = name.toLowerCase();
    return this.categories.filter(c => c.CategoryName.toLowerCase().indexOf(filterValue) === 0);
  }
  addGmh() {
    let g = new GMH();
    if (this.gmhForm.controls["tatCategory"].value != "" && this.gmhForm.controls["tatCategory"].value != null)
      g.CategoryCode = this.gmhForm.controls["tatCategory"].value.CategoryCode
    else g.CategoryCode = this.gmhForm.controls["category"].value.CategoryCode
    g.GmhName = this.gmhForm.controls.GmhName.value;
    if(this.myDetails){
    g.Adress = this.userService.CurrentUser.Adress;
    g.Phone = this.userService.CurrentUser.Phone;
    g.e_mail = this.userService.CurrentUser.E_mail;
  }
  else{
    console.log(this.gmhForm.controls.adress.value);
    
    if(this.gmhForm.controls.adress.value)
    g.Adress = this.gmhForm.controls.adress.value;
    g.Phone = this.gmhForm.controls.phone.value;
    g.e_mail =this.gmhForm.controls.e_mail.value;
  }
    g.UserCode = this.userService.CurrentUser.UserCode;
    g.comments = this.gmhForm.controls.comments.value;
    console.log(g);
    this.gmhService.add(g).subscribe(
      res => {
        console.log(res)
        if (res) {
          this.getMyGmhim();
          this.getCategoryGmh();
          this.gmhForm.reset()
          alert('נוסף בהצלחה')
          this.router.navigate(['/manageTheGMH'])
        }
        else {
          alert('error, try again')
        }
      }
    )
  }
  getMyGmhim() {
    this.gmhService.getMyGmhim(this.userService.CurrentUser).subscribe(
      res => {
        this.gmhService.setMyGmhim(res); 
        this.myGmhim = res;
        localStorage.setItem('gmhim', JSON.stringify(res));
        this.myGmhim.forEach(g =>
          this.gmhService.getUser(g).subscribe(
            res => g.User = res
          ))
      },
      err => { console.log(err); }
    )
  }
  getCategoryGmh() {
    this.gmhService.getCategoryGmach().subscribe(
      res => {
        this.categories = res;
        this.filter()
      },
      err => console.log(err)
    );
  }
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.currLat = position.coords.latitude;
        this.currLng = position.coords.longitude;
        this.adress=(this.currLat," ",this.currLng).toString()
      });
    }
    else {
      alert("Geolocation is not supported by this browser.");
    }
  }
  handleDestinationChange(a: Address) {
    this.adress = a;
  }
}
