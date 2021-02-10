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
  gmhForm:FormGroup;
  filteredTatCategories: Observable<CategoryGMH[]>;
  categories: Array<CategoryGMH>;
  tatCategories: CategoryGMH[];
  filteredCategories: Observable<CategoryGMH[]>;
  myGmhim: GMH[];
  newgmh = false;
  currentUser: User;
  currLat=0;
  currLng=0;
  adress;
  constructor(private gmhService: GmhService, private userService: UserService, private categoriesService: CategoriesService,private router:Router) { }

  ngOnInit(): void {
    this.gmhForm = new FormGroup({
      GmhName: new FormControl('',Validators.required),
      divLocation: new FormControl(),
      category: new FormControl(),
      newCategory: new FormControl(),
      tatCategory: new FormControl({ value: '', disabled: true }),
      newTatCategory: new FormControl({ value: '', disabled: true }),
      location:new FormControl(),
      comments: new FormControl()
    },{validators: isCategory('category','newCategory')})
    this.myGmhim = JSON.parse(localStorage.getItem('gmhim'));    
    this.gmhService.setMyGmhim(this.myGmhim)
    this.currentUser = this.userService.CurrentUser;
    this.getMyGmhim();
    this.getCurrentLocation();
    this.getCategoryGmh();
  }
  choosecategory() {
    this.gmhForm.controls["newCategory"].disable();
    this.gmhForm.controls["category"].enable();
    this.gmhForm.controls["newCategory"].setValue('')
  }
  getTatCategoriesForGmh(c) {
      //console.log(this.gmhForm.controls["newTatCategory"].disabled);
      this.gmhForm.controls["tatCategory"].enable();
  
      if (this.gmhForm.controls["newTatCategory"].disabled) {
  
        this.gmhService.getCategoriesForGmach(c.option.value).subscribe(res => {
          this.tatCategories = res;
          console.log(res),
  
            this.filteredTatCategories = this.gmhForm.controls.tatCategory.valueChanges
              .pipe(
                startWith(''),
                map(value => typeof value === 'string' ? value : value.CategoryName),
                map(name => name ? this._filter(name) : this.tatCategories.slice())
              );
          err => { console.log(err); }
        });
      }
    }
    filter() {
      console.log(this.categories);
      this.filteredCategories = this.gmhForm.controls.category.valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.CategoryName),
          map(name => name ? this._filter(name) : this.categories.slice())
        );
    }
    newcategory() {
      this.gmhForm.controls["newCategory"].enable();
      this.gmhForm.controls["category"].disable();
      this.gmhForm.controls["tatCategory"].disable();
      this.gmhForm.controls["newTatCategory"].disable();
      this.gmhForm.controls["newTatCategory"].setValue('');
  
      this.gmhForm.controls["category"].setValue('');
    }
    newtatcategory() {
      this.gmhForm.controls["newTatCategory"].enable();
      this.gmhForm.controls["tatCategory"].disable();
      this.gmhForm.controls["tatCategory"].setValue('');
  
      // this.tatCategories=new Array<CategoryGMH>();
    }
    choosetatcategory() {
      this.gmhForm.controls["newTatCategory"].disable();
      this.gmhForm.controls["tatCategory"].enable();
      this.gmhForm.controls["newTatCategory"].setValue('')
    }
    displayFn(c: CategoryGMH): string {
      return c && c.CategoryName ? c.CategoryName : '';
    }
    private _filter(name: string): CategoryGMH[] {
      const filterValue = name.toLowerCase();
      return this.categories.filter(c => c.CategoryName.toLowerCase().indexOf(filterValue) === 0);
    }
    setCategoty() {
      let g = new GMH();
      let master;
      console.log(
       this.gmhForm.controls["category"].value);
      if (this.gmhForm.controls["category"].value != null)//נבחרה קגורית אב
      {
        this.categories.forEach(element => {
          console.log(element.CategoryName, this.gmhForm.controls.category.value.CategoryName);
  
          if (element.CategoryName == this.gmhForm.controls.category.value.CategoryName) {
            g.CategoryCode = element.CategoryCode;
            master = element.CategoryCode
          }
        })
  
      }
      else if (this.gmhForm.controls["newCategory"].value != null) {//קטגורית אב חדשה
        console.log(this.gmhForm.controls["newCategory"].value);
  
        let c = new CategoryGMH();
        c.CategoryName = this.gmhForm.controls["newCategory"].value;
        this.categoriesService.addCategory(c).subscribe(
          res => {
            console.log(res);
            g.CategoryCode = res;
            master = res;
          }
        )
      }
      if (this.gmhForm.controls["newTatCategory"].value != null)//תת קטגוריה חדשה
      {
        console.log(this.gmhForm.controls["newTatCategory"].value);
  
        let c = new CategoryGMH();
        c.CategoryName = this.gmhForm.controls["newTatCategory"].value;
        c.MasterCategoryCode = master;
        this.categoriesService.addCategory(c).subscribe(
          res => {
            console.log(res);
            g.CategoryCode = res;
            console.log(g);
  
          }
        )
        this.addGmh(g);
      }
      else if (this.gmhForm.controls["tatCategory"].value != null) {//נבחרה תת קטגוריה
        this.tatCategories.forEach(element => {
          if (element.CategoryName === this.gmhForm.controls.tatCategory.value.CategoryName) {
            g.CategoryCode = element.CategoryCode;
            master = element.CategoryCode
          }
        })
        this.addGmh(g);
      }
    }
    addGmh(g) {
      g.GmhName = this.gmhForm.controls.GmhName.value;
      g.Adress = this.currentUser.Adress;
      g.Phone = this.currentUser.Phone;
      g.e_mail = this.currentUser.E_mail;
      g.UserCode = this.currentUser.UserCode;
      g.comments = this.gmhForm.controls.comments.value;
      console.log(g);
      this.gmhService.add(g).subscribe(
        res => {
          console.log(res)
          if (res) {
            this.getMyGmhim();
            this.closeNew();
            this.getCategoryGmh();
            this.gmhForm.reset()
            alert('נוסף בהצלחה')
          }
          else {
            alert('error, try again')
          }
        }
      )
    }
    closeNew() {
      this.newgmh = false
    }
    getMyGmhim() {
      this.gmhService.getMyGmhim(this.userService.CurrentUser).subscribe(
        res => {
        //  console.log(res);
          
          this.gmhService.setMyGmhim(res); this.myGmhim = res;
          localStorage.setItem('gmhim', JSON.stringify(res));
  
          this.myGmhim.forEach(g =>
            this.gmhService.getUser(g).subscribe(
              res => g.User = res
            ))
          //console.log(res);
        },
        err => { console.log(err); }
      )
    }
    getCategoryGmh() {
      this.gmhService.getCategoryGmach().subscribe(
        res => {
          this.categories = res; this.filter()
  console.log(res);
  
        },
        err => console.log(err)
      );
    }
    new() {
      this.newgmh = true;
      this.getCategoryGmh();
  
    }
    getCurrentLocation() {
      this.gmhForm.controls.location.setValue("")
      this.gmhForm.controls.location.disable()
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          this.currLat = position.coords.latitude;
          this.currLng = position.coords.longitude;
        });
      }
      else {
        alert("Geolocation is not supported by this browser.");
      }
    }
    chooseLocation(){
      this.gmhForm.controls.location.enable()
    }
    handleDestinationChange(a: Address) {
      this.adress = a;
      //  console.log(a)
    }
}
