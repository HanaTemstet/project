import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CategoryGMH } from 'src/app/shared/models/CategoryGMH.model';
import { donation } from 'src/app/shared/models/Donations.model';
import { Product } from 'src/app/shared/models/Product.model';
import { CategoriesService } from 'src/app/shared/services/categories.service';
import { DonationService } from 'src/app/shared/services/donation.service';
import { GmhService } from 'src/app/shared/services/gmh.service';
import { ProductsService } from 'src/app/shared/services/products.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-add-donation',
  templateUrl: './add-donation.component.html',
  styleUrls: ['./add-donation.component.css']
})
export class AddDonationComponent implements OnInit {
  donationForm: FormGroup
  categories: Array<CategoryGMH>
  filteredCategories: Observable<CategoryGMH[]>;
  tatCategories: Array<CategoryGMH>
  filteredTatCategories: Observable<CategoryGMH[]>;
  adress;
  formData: FormData = new FormData();
  url;
  donationCode;
  donation = true;
  donor = false
  filteredProducts: Observable<Product[]>;
  products: Array<Product>
  details = false
  continue = false;
  changeDetails = false;
  constructor(private gmhService: GmhService, private donationService: DonationService,
    private categoriesService: CategoriesService, public userService: UserService, private productsService: ProductsService) { }

  ngOnInit(): void {
    this.gmhService.getCategoryGmach().subscribe(
      res => {
        this.categories = res; this.filter()
      },
      err => console.log(err)
    );
    this.donationForm = new FormGroup({
      donationName: new FormControl('', Validators.required),
      Categories: new FormControl('', Validators.required),
      tatCategories: new FormControl({ value: '', disabled: true }),
      comments: new FormControl(''),
      donorName: new FormControl('',),
      donorEmail: new FormControl(''),
      adress: new FormControl(''),
      phone: new FormControl('', Validators.pattern('[0-9]{9,10}'))
    })

  }
  getProducts(c) {
    this.productsService.getProductsAccordingToGmhCategory(c.option.value).subscribe(
      res => {
        this.products = res,
          //   console.log(res);

          this.filter1();
      },
      err => console.log(err),
    );
  }
  filter1() {
    this.filteredProducts = this.donationForm.controls.donationName.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.ProductName),
        map(name => name ? this._filter1(name) : this.products.slice())
      );

  }
  filter() {
    this.filteredCategories = this.donationForm.controls.Categories.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.CategoryName),
        map(name => name ? this._filter(name) : this.categories.slice())
      );
  }
  private _filter(name: string): CategoryGMH[] {
    const filterValue = name.toLowerCase();
    return this.categories.filter(c => c.CategoryName.toLowerCase().indexOf(filterValue) === 0);
  }
  private _filter1(name: string): Product[] {
    const filterValue = name.toLowerCase();
    return this.products.filter(c => c.Productname.toLowerCase().indexOf(filterValue) === 0);
  }
  displayFn(c: CategoryGMH): string {
    return c && c.CategoryName ? c.CategoryName : '';
  }
  displayFn1(p: Product): string {
    return p && p.ProductCode ? p.Productname : '';
  }
  handleDestinationChange(a: Address) {
    // console.log(a)
    this.adress = a.formatted_address;
  }
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        let currLat = position.coords.latitude;
        let currLng = position.coords.longitude;
        this.adress=(currLat+" "+currLng).toString()
      });
    }
    else {
      alert("Geolocation is not supported by this browser.");
    }
  }
  getTatCategoriesForGmh(c) {
    this.donationForm.controls.tatCategories.enable()
    this.gmhService.getCategoriesForGmach(c.option.value).subscribe(res => {
      this.tatCategories = res;
      this.filteredTatCategories = this.donationForm.controls.tatCategories.valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.CategoryName),
          map(name => name ? this._filter(name) : this.tatCategories.slice())
        );
      err => { console.log(err); }
    });
  }
  addDonation() {
    let d=new donation();
    if (!this.details) {
      d.Adress = this.userService.CurrentUser.Adress;
      d.Phone = this.userService.CurrentUser.Phone;
      d.donorEmail = this.userService.CurrentUser.E_mail;
      d.donorName = this.userService.CurrentUser.Name;
    }
    else {
      d.Adress = this.adress;
      d.Phone = this.donationForm.controls.phone.value;
      d.donorEmail = this.donationForm.controls.donorEmail.value;
      d.donorName = this.donationForm.controls.donorName.value;
    }
    if (this.donationForm.controls["tatCategories"].value != "" && this.donationForm.controls["tatCategories"].value != null)
      d.Category = this.donationForm.controls["tatCategories"].value.CategoryCode
    else d.Category = this.donationForm.controls["Categories"].value.CategoryCode
    d.Description = this.donationForm.controls.comments.value;
    d.Phone = this.donationForm.controls.phone.value;
    d.donationName = this.donationForm.controls.donationName.value.Productname;
    this.formData.append('donation', JSON.stringify(d))
    this.donationService.addDonation(this.formData).subscribe(
      res => {
        console.log(res)
        this.donationCode = res;
        if (res != 0) {
          alert("התקבלה בהצלחה תודה!" + res + "תרומה")
          this.formData = new FormData()
        }
      }
    )
    this.formData = new FormData()
  }
  handleFileInput(etf) {
    this.formData.append('Image', etf[0]);
    console.log(etf);
    if (etf && etf[0]) {
      for (const f of etf) {
        const file = f;
        const reader = new FileReader();
        reader.onload = e => this.url = reader.result;
        reader.readAsDataURL(file);
      }
    }
  }
  donorDetails() {
    if (this.continue == false)
      this.continue = true;
    else
      this.continue = false;
    this.donor = !this.donor
    this.donation = !this.donation
  }

}
