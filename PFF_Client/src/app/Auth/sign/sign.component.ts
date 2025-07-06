import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateUserDTO, UserLoginDTO, UserServicesService } from '../../services/user-services.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign',
  standalone: false,
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.css']
})
export class SignComponent {
  registerForm: FormGroup;
  loginForm: FormGroup;
  isLoginMode: boolean = true;
  message: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showRegisterPassword: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserServicesService , private router: Router) {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      role: ['STUDENT', Validators.required]
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.message = '';
    this.clearForms();
  }

  togglePasswordVisibility(isRegister: boolean = false): void {
    if (isRegister) {
      this.showRegisterPassword = !this.showRegisterPassword;
    } else {
      this.showPassword = !this.showPassword;
    }
  }

  clearForms(): void {
    this.registerForm.reset({ role: 'STUDENT' });
    this.loginForm.reset();
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} est requis`;
      }
      if (field.errors['email']) {
        return 'Format d\'email invalide';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `Minimum ${requiredLength} caractères requis`;
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'nom': 'Le nom',
      'email': 'L\'email',
      'motDePasse': 'Le mot de passe',
      'password': 'Le mot de passe',
      'role': 'Le rôle'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.message = '';
      
      const registerData: CreateUserDTO = this.registerForm.value;
      
      this.userService.createUser(registerData).subscribe({
        next: res => {
          this.message = '✅ Utilisateur enregistré avec succès.';
          this.registerForm.reset({ role: 'STUDENT' });
          this.isLoading = false;
          
          // Auto switch to login mode after successful registration
          setTimeout(() => {
            this.isLoginMode = true;
            this.message = '';
          }, 2000);
        },
        error: err => {
          this.message = '❌ Erreur lors de l\'enregistrement. Veuillez réessayer.';
          console.error(err);
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.message = '';
      
      const loginData: UserLoginDTO = this.loginForm.value;
      
      this.userService.login(loginData).subscribe({
        next: res => {
          this.message = `✅ Connecté en tant que ${res.role}`;
          this.loginForm.reset();
          this.isLoading = false;
          this.router.navigate(['/list']);
        },
        error: err => {
          this.message = '❌ Échec de la connexion. Vérifiez vos informations.';
          console.error(err);
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
