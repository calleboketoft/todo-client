import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { StoreModule } from '@ngrx/store'
import { todoReducer } from './reducers/todo.reducer'
import { AppComponent } from './app.component'
import { HttpClientModule } from '@angular/common/http'
import { EffectsModule } from '@ngrx/effects'
import { TodoEffects } from './effects/todo.effects'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ReactiveFormsModule } from '@angular/forms'
import {
  MatCheckboxModule,
  MatListModule,
  MatInputModule,
  MatFormFieldModule,
  MatButtonModule
} from '@angular/material'
import { TodoItemComponent } from './todo-item/todo-item.component'
import { TodoAddFormComponent } from './todo-add-form/todo-add-form.component'

@NgModule({
  declarations: [AppComponent, TodoItemComponent, TodoAddFormComponent],
  imports: [
    BrowserModule,
    StoreModule.forRoot({ todoReducer: todoReducer }),
    HttpClientModule,
    EffectsModule.forRoot([TodoEffects]),
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
