import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Complaint } from 'src/app/shared/models/Complaint.model';
import { GMH } from 'src/app/shared/models/Gmh.model';
import { GmhService } from 'src/app/shared/services/gmh.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-gmh-list',
  templateUrl: './gmh-list.component.html',
  styleUrls: ['./gmh-list.component.css'],
})
export class GmhListComponent implements OnInit {
  gmhListForm: FormGroup
  gmhs: GMH[];
  newComplaint: Complaint;
  d = false;
  dataSource;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['position', 'name', 'comment', 'a'];
  constructor(public gmhService: GmhService, private router: Router, public dialog: MatDialog, public route: ActivatedRoute) { }

  ngOnInit(): void {

    //this.gmhs=this.route.snapshot.paramMap.get('arr');   
    this.gmhListForm = new FormGroup({
      complainText: new FormControl(''),
    });
    console.log(this.gmhService.gmhsSearch)
    this.gmhService.dataSource = new MatTableDataSource<GMH>(this.gmhService.gmhsSearch);
    console.log(this.dataSource)
  }
  openDialog(event) {
    this.d = true;
    event.stopPropagation();
  }
   stop(event) {
    event.stopPropagation();
    this.d = false;
  }

  alert2(gmhCode) {
    this.newComplaint = new Complaint();
    this.newComplaint.gmhCode = gmhCode;
    this.newComplaint.date = Date.now().toString();
    this.newComplaint.text = this.gmhListForm.controls.complainText.value;
    //this.newComplaint.fingerPrint=getBrowserFingerprint(); 
    this.d = false;
    console.log(this.newComplaint)

  }
  ngAfterViewInit() {
    if(this.dataSource!=undefined)
    this.dataSource.paginator = this.paginator;
  }
}
