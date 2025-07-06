import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignComponent } from './Auth/sign/sign.component';
import { AddDocumentComponent } from './documents/add-document/add-document.component';
import { DocumentsListComponent } from './documents/documents-list/documents-list.component';

const routes: Routes = [
  {path: '', redirectTo: '/sign', pathMatch: 'full'},
  {path:'sign',component: SignComponent},
  {path:'add',component: AddDocumentComponent},
  {path:'list',component:DocumentsListComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
