import { Component } from '@angular/core'
import { Store } from '@ngrx/store'
import { QUERY_TODOS } from './effects/todo.effects'
import { PATCH_TODO } from './effects/todo.effects'
import { DELETE_TODO } from './effects/todo.effects'
import { POST_TODO } from './effects/todo.effects'

@Component({
  selector: 'stugan-root',
  template: `
    <div class="container">
      <h1>Stugan!</h1>
      <stugan-todo-add-form
        (addTodo)="addTodo($event)">
      </stugan-todo-add-form>
      <mat-list>
        <stugan-todo-item *ngFor="let todo of todos$ | async"
          [todo]="todo"
          (toggleTodoDone)="toggleTodoDone($event)"
          (deleteTodo)="deleteTodo($event)">
        </stugan-todo-item>
      </mat-list>
    </div>
  `,
  styles: [
    `
    .container {
      margin: 0px 50px;
      width: 300px;
    }
  `
  ]
})
export class AppComponent {
  // register the observable todos$ that will contain the collection of todos
  todos$ = this.store.select('todoReducer')

  // component lifecycle method in Angular
  ngOnInit() {
    this.store.dispatch({ type: QUERY_TODOS })

    this.todos$.subscribe(todos => {
      // log the todos collection as soon as the reducer is updated
      console.log(todos)
    })
  }

  toggleTodoDone(todo) {
    this.store.dispatch({ type: PATCH_TODO, payload: todo })
  }

  deleteTodo(todo) {
    this.store.dispatch({ type: DELETE_TODO, payload: todo })
  }

  addTodo(todoTitle) {
    this.store.dispatch({ type: POST_TODO, payload: { title: todoTitle } })
  }

  // Instantiate the Store to use in this component
  constructor(private store: Store<any>) {}
}
