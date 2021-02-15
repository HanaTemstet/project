import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { User } from 'src/app/shared/models/User.model';
import { AppComponent } from 'src/app/app.component';
import { Router, RoutesRecognized } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { filter, pairwise } from 'rxjs/operators';
export var prevComponent: string

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  hide: boolean = true;


  constructor(private userService: UserService, private router: Router, private cookieService: CookieService) { }
  signInForm: FormGroup;
  show: boolean = false;
  a=true
  ngOnInit(): void {
    this.signInForm = new FormGroup({
      e_mail: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    })
    this.router.events.pipe(filter((e: any) => e instanceof RoutesRecognized), pairwise()).subscribe((e: any) => {
      console.log(e[0].urlAfterRedirects);
      prevComponent = e[0].urlAfterRedirects
      console.log(prevComponent)
    });


  }
  checkUser() {
    let user = new User();
    user.E_mail = this.signInForm.controls.e_mail.value;
    user.Password = this.signInForm.controls.password.value;
    this.userService.checkUser(user).subscribe(
      res => {
        this.userService.setCurrentUser(res);
        this.cookieService.set('userName', this.userService.CurrentUser.Name);
        localStorage.setItem('user', JSON.stringify(this.userService.CurrentUser));

        console.log(res);

        // console.log( this.router.events .pipe(filter((e: any) => e instanceof RoutesRecognized), pairwise() ).subscribe((e: any) => { console.log(e[0].urlAfterRedirects); })); 
        if (res != undefined) {
          console.log(prevComponent)
          if (prevComponent == "/addDonation")
            this.router.navigate(['/addDonation'])
          else
            this.router.navigate(['/manageTheGMH'])
        }
        else confirm("אחד או יותר מהנתונים שגוי")
      },
      err => { console.log(err); }

    )
  }
  myFunction() {
    this.hide = !this.hide;
  }
  toshow() {
    this.show = !this.show
  }
}

