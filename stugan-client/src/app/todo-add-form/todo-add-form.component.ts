import { Component, Output, EventEmitter } from '@angular/core'
import { FormBuilder } from '@angular/forms'

@Component({
  selector: 'stugan-todo-add-form',
  template: `
    <form [formGroup]="addTodoForm" (ngSubmit)="submitAddTodoForm($event)" novalidate>
      <mat-form-field>
        <input matInput placeholder="New todo" formControlName="todoTitle">
      </mat-form-field>
    </form>
  `
})
export class TodoAddFormComponent {
  @Output() addTodo = new EventEmitter()

  addTodoForm = this.formBuilder.group({
    todoTitle: ''
  })

  submitAddTodoForm($event) {
    let todoTitleControl = this.addTodoForm.controls.todoTitle
    this.addTodo.emit(todoTitleControl.value)
    todoTitleControl.setValue('')
  }

  constructor(private formBuilder: FormBuilder) {}
}
