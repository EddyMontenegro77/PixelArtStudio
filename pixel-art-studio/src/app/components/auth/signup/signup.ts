import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  imports: [FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  username: string = '';
  email: string = '';
  password: string = '';
  passwordVerification: string = '';
  constructor(private authSercice: AuthService) {}

  trySignUp() {}
}
