import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { GMH } from 'src/app/shared/models/Gmh.model';
import { Opinion } from 'src/app/shared/models/Opinion.model';
import { productToGmh } from 'src/app/shared/models/productToGMH.model';
import { User } from 'src/app/shared/models/User.model';


import { GmhService } from 'src/app/shared/services/gmh.service';
import { OpinionService } from 'src/app/shared/services/opinion.service';
import { ProductsService } from 'src/app/shared/services/products.service';
import { UserService } from 'src/app/shared/services/user.service';
export var currentProduct: productToGmh

@Component({
  selector: 'app-gmh',
  templateUrl:'./gmh.component.html',
  styleUrls: ['./gmh.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GMHComponent implements OnInit {
 // @Input('gmh') gmh:number;
 dataSource;
 gmhForm: FormGroup;
 rating=3;
gmh:GMH;
opinion=false;
newOpinion:Opinion;
  productsToGmh:productToGmh[];
  opinions:Opinion[];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ['name','date','amount','describe','picture'];
    constructor(private userService: UserService,private gmhService:GmhService,private opinionService:OpinionService,private GmhService:GmhService,private productsService:ProductsService,private route:ActivatedRoute) { }
  
    ngOnInit(): void { 
      this.gmhForm = new FormGroup({
        comment: new FormControl(''),
      });

      const gmhCode = this.route.snapshot.paramMap.get('id');
      let g=new GMH();
      g.GmhCode=parseInt(gmhCode);
     this.GmhService.getGmhByGmhCode(g).subscribe(
      res => {this.gmh = res
        console.log(this.gmh)
        console.log(g);
        this.opinionService.getOpinionsForGMH(this.gmh).subscribe(
          res => this.opinions = res,
          err => console.log(err),
          );
        this.productsService.getProductsForGMH(this.gmh).subscribe(
          res => {this.productsToGmh = res,
            res.forEach(p => {
              this.productsService.getProduct(p).subscribe(
                res => { p.Name = res.Productname; },
                err => { console.log(err); }
              )
              this.productsService.getLendings(p).subscribe(
                res => {
                  p.Lendings = res;
                }
              )
              this.productsService.getImage(p).subscribe(
                res => {
                  p.Images = new Array<string>();
                  res.forEach(r => p.Images.push('https://localhost:44360/' + 'image/' + r.Path));
                }
              )
            })
            console.log(res);
            

      this.dataSource  = new MatTableDataSource<productToGmh>(res);
      
   },
          err => console.log(err),
        );
      } ,
      err => console.log(err),
    );  
   
    } 
    rangeFilter(d:Date):boolean{
      return false;
    }

    changeStarColor(id:string) {
     
        if( document.getElementById(id).style.color == "red"){
        document.getElementById(id).style.color = "gray"; 
        this.rating--;
      }
       else{
        document.getElementById(id).style.color = "red";
        this.rating++;
      }
      }  

    addOpinion()
    {
      this.opinion=false;
      this.newOpinion=new Opinion();
      this.newOpinion.gmhCode=this.gmh.GmhCode;
      this.newOpinion.Rating=this.rating;
      this.newOpinion.Comment=this.gmhForm.controls.comment.value;
     this.opinionService.addOpinion(this.newOpinion).subscribe(
        res => { console.log(res); },
       err => { console.log(err); }); 
    this.rating=3;
    this.gmhForm.controls.comment.setValue("");
    this.gmhForm.reset();
    } 
    dateClass = (p,d): MatCalendarCellCssClasses => {
      
      let d1 = d.toDateString().slice(4, 15);
      let dates = new Array<string>()
      p=currentProduct;
      console.log(p.Lendings);

      if (p.Lendings != undefined)
        p.Lendings.forEach(l => {
         dates.push(new Date(l.LendingDate).toDateString().slice(4, 15), new Date(l.ReturnDate).toDateString().slice(4, 15));
        });
      if (dates != undefined)
        for (let i = 0; i < dates.length; i += 2)
          if (new Date(d1) >= new Date(dates[i]) && new Date(d1) <= new Date(dates[i + 1])) {
            {

              return 'special-date';
            }
          }
      return '';
    }
    myP(p){
      currentProduct=p
    }
}
