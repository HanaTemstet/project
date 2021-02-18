import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CategoryGMH } from 'src/app/shared/models/CategoryGMH.model';
import { CategoriesService } from 'src/app/shared/services/categories.service';
import { GmhService } from 'src/app/shared/services/gmh.service';
import { validSearch } from 'src/app/validators/valid';

@Component({
  selector: 'app-needs-gmhim',
  templateUrl: './needs-gmhim.component.html',
  styleUrls: ['./needs-gmhim.component.css']
})
export class NeedsGMHimComponent implements OnInit {
  allCategories: CategoryGMH[] = []
  tatCategoryNG: CategoryGMH[] = []
  masterCategoryNG: CategoryGMH[] = []
  needsGmhimForm: FormGroup;
  needsGmhim;
  masterCategories: CategoryGMH[]
  filteredCategories: Observable<CategoryGMH[]>
  tatCategories: CategoryGMH[]
  filteredTatCategories: Observable<CategoryGMH[]>
  categoriesControl = new FormControl();
  tatcategoriesControl = new FormControl();
  adress;
  masterCategory: CategoryGMH;
  displayedColumns = ["category", "adress"]
  currentNg: CategoryGMH;
  constructor(private gmhService: GmhService, private categoriesService: CategoriesService) { }

  ngOnInit(): void {

    this.needsGmhimForm = new FormGroup({
      textSearch: new FormControl('', Validators.compose([Validators.pattern('[א-ת]{10}')])),
      category: new FormControl(''),
      tatCategory: new FormControl(''),
      currentLocation: new FormControl(''),
      location: new FormControl(''),
      distance: new FormControl(''),
    }, { validators: validSearch("location") });
    this.getCurrentLocation();
    this.getCategoryGmh()
    //this.filterNeedsGmhim();

  }

  getCategoryGmh() {
    this.gmhService.getCategoryGmach().subscribe(res => {
      this.masterCategories = res
      console.log(res);
      this.filteredCategories = this.categoriesControl.valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.categoryName),
          map(name => name ? this._filter(name) : this.masterCategories.slice())
        );
    }
      ,
      err => { console.log(err); }
    );
  }
  private _filter(name: string): CategoryGMH[] {
    const filterValue = name.toLowerCase();
    return this.masterCategories.filter(c => c.CategoryName.toLowerCase().indexOf(filterValue) === 0);
  }
  displayFn(c: CategoryGMH): string {
    return c && c.CategoryName ? c.CategoryName : '';
  }
  // getCategoriesForGmach() {

  //   // this.needsGmhimForm.controls['tatCategory'].enable();
  //   //  console.log(this.searchForm.controls.category.value);
  //   this.categories.forEach(element => {
  //     if (element.CategoryName == this.needsGmhimForm.controls.category.value)
  //       this.masterCategory = element;
  //   });
  //   this.gmhService.getCategoriesForGmach(this.masterCategory).subscribe(res => {
  //     this.tatCategories = res;
  //     // console.log(res);
  //     err => { console.log(err); }
  //   });
  // }
  // getTatCategoriesForGmh(c) {
  //   //console.log(this.gmhForm.controls["newTatCategory"].disabled);
  //   this.gmhService.getCategoriesForGmach(c.option.value).subscribe(res => {
  //     this.tatCategories = res;
  //     console.log(res),
  //       this.filteredTatCategories = this.tatcategoriesControl.valueChanges
  //         .pipe(
  //           startWith(''),
  //           map(value => typeof value === 'string' ? value : value.CategoryName),
  //           map(name => name ? this._filter(name) : this.tatCategories.slice())
  //         );
  //     err => { console.log(err); }
  //   });
  // }
  handleDestinationChange(a: Address) {
    //console.log(a);

    // console.log(a.vicinity);


    this.adress = a.formatted_address;
  }
  getCurrentLocation() {
    this.needsGmhimForm.controls.location.setValue("")
    this.needsGmhimForm.controls.location.disable()
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.adress = (position.coords.latitude + " " + position.coords.longitude).toString();
      });
    }
    else {
      alert("Geolocation is not supported by this browser.");
    }

  }
  chooseLocation() {
    this.needsGmhimForm.controls.location.enable()
  }
  filterNeedsGmhim() {
    this.masterCategoryNG = []
    let fd = new FormData()
    if (this.categoriesControl.value == null || this.categoriesControl.value == "") fd.append('category', "0")
    else fd.append('category', this.categoriesControl.value.CategoryCode)
    if (this.tatcategoriesControl.value == null || this.tatcategoriesControl.value == "") fd.append('tatcategory', "0")
    else fd.append('tatcategory', this.tatcategoriesControl.value.CategoryCode)
    fd.append('adress', this.adress)
    this.gmhService.filterNeedsGmhim(fd).subscribe(
      res => {
        this.needsGmhim = res
        this.needsGmhim.forEach(ng => {
          this.categoriesService.getCategoryName(ng.category).subscribe(
            res => {
              ng.categoryName = res
              this.masterCategories.forEach(element => {
                if (element.CategoryName == ng.categoryName)
                  this.masterCategoryNG.push(element)
              });
            }
          )
        });
      }
    )
  }
  getTatForNG(c: CategoryGMH) {
    console.log(this.tatCategoryNG,this.currentNg);
    console.log(this.tatCategoryNG.length!=0,this.currentNg!=c);
    if(this.tatCategoryNG.length!=0 && this.currentNg==c){
      this.tatCategoryNG = []
    }
    else{
    this.tatCategoryNG = []
    this.currentNg = c;
    this.gmhService.getCategoriesForGmach(c).subscribe(res => {
      this.tatCategories = res;
      this.needsGmhim.forEach(ng => {
        this.tatCategories.forEach(element => {
          if (ng.category == element.CategoryCode) {
            this.tatCategoryNG.push(element)
          }
        });
      });
      err => { console.log(err); }
    });
  }
  }

}
