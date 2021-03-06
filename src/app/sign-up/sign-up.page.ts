import { Component, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseAuthService } from '../firebase-auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage {
  signUpForm: FormGroup;
  submitError: string;
  authRedirectResult: Subscription;

  validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email.' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 6 characters long.' }
    ]
  };

  constructor(
    public angularFire: AngularFireAuth,
    public router: Router,
    private ngZone: NgZone,
    private authService: FirebaseAuthService
  ) {
    this.signUpForm = new FormGroup({
      'email': new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      'password': new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ]))
    });

    this.authRedirectResult = this.authService.getRedirectResult()
    .subscribe(result => {
      if (result.user) {
        this.redirectLoggedUserToProfilePage();
      } else if (result.error) {
        this.submitError = result.error;
      }
    });
  }
  redirectLoggedUserToProfilePage() {
    this.ngZone.run(() => {
      this.router.navigate(['profile']);
    });
  }
  signUpWithEmail() {
    this.authService.signUpWithEmail(this.signUpForm.value['email'], this.signUpForm.value['password'])
    .then(user => {
      this.redirectLoggedUserToProfilePage();
    })
    .catch(error => {
      this.submitError = error.message;
    });
  }
  facebookSignUp() {
    this.authService.signInWithFacebook()
    .then((result: any) => {
      if (result.additionalUserInfo) {
        this.authService.setProviderAdditionalInfo(result.additionalUserInfo.profile);
      }
      this.redirectLoggedUserToProfilePage();
    }).catch((error) => {
      // Handle Errors here.
      console.log(error);
    });
  }

  googleSignUp() {
    this.authService.signInWithGoogle()
    .then((result: any) => {
      if (result.additionalUserInfo) {
        this.authService.setProviderAdditionalInfo(result.additionalUserInfo.profile);
      }
      this.redirectLoggedUserToProfilePage();
    }).catch((error) => {
      // Handle Errors here.
      console.log(error);
    });
  }
}
