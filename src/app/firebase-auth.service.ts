import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, Subject, from } from 'rxjs';
import { Platform } from '@ionic/angular';
import { User, auth } from 'firebase/app';
import { ProfileModel } from './profile/profile.model';
import { filter, map, take } from 'rxjs/operators';

@Injectable()
export class FirebaseAuthService {

  currentUser: User;
  userProviderAdditionalInfo: any;
  redirectResult: Subject<any> = new Subject<any>();

  constructor(
    public angularFireAuth: AngularFireAuth,
    public platform: Platform
  ) {
    this.angularFireAuth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUser = user;
      } else {
        this.currentUser = null;
      }
    });

    this.angularFireAuth.getRedirectResult()
    .then((result) => {
      if (result.user) {
        this.setProviderAdditionalInfo(result.additionalUserInfo.profile);
        this.currentUser = result.user;
        this.redirectResult.next(result);
      }
    }, (error) => {
      this.redirectResult.next({error: error.code});
    });
  }

  getRedirectResult(): Observable<any> {
    return this.redirectResult.asObservable();
  }

  setProviderAdditionalInfo(additionalInfo: any) {
    this.userProviderAdditionalInfo = {...additionalInfo};
  }

  public getProfileDataSource() {
    return this.angularFireAuth.user
    .pipe(
      filter((user: User) => user != null),
      map((user: User) => {
        return this.getProfileData();
      }),
      take(1) 
    );
  }

  public getProfileData() {
    const userModel = new ProfileModel();
    return userModel;
  }

  signOut(): Observable<any> {
    return from(this.angularFireAuth.signOut());
  }

  signInWithEmail(email: string, password: string): Promise<auth.UserCredential> {
    return this.angularFireAuth.signInWithEmailAndPassword(email, password);
  }

  signUpWithEmail(email: string, password: string): Promise<auth.UserCredential> {
    return this.angularFireAuth.createUserWithEmailAndPassword(email, password);
  }

  socialSignIn(providerName: string, scopes?: Array<string>): Promise<any> {
    const provider = new auth.OAuthProvider(providerName);

    if (scopes) {
      scopes.forEach(scope => {
        provider.addScope(scope);
      });
    }

    if (this.platform.is('desktop')) {
      return this.angularFireAuth.signInWithPopup(provider);
    } else {
      return this.angularFireAuth.signInWithRedirect(provider);
    }
  }

  signInWithFacebook() {
    const provider = new auth.FacebookAuthProvider();
    
    return this.socialSignIn(provider.providerId);
  }

  signInWithGoogle() {
    const provider = new auth.GoogleAuthProvider();
    const scopes = ['profile', 'email'];
    return this.socialSignIn(provider.providerId, scopes);
  }
}
