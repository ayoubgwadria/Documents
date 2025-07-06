import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SignComponent } from './Auth/sign/sign.component';
import { AddDocumentComponent } from './documents/add-document/add-document.component';
import { TokenInterceptor } from './core/interceptors/token.interceptor';
import { DocumentsListComponent } from './documents/documents-list/documents-list.component';

@NgModule({
  declarations: [
    AppComponent,
    SignComponent,
    AddDocumentComponent,
    DocumentsListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
     {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
