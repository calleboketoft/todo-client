import { Component, Input } from '@angular/core'
import { Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'stugan-todo-item',
  template: `
    <mat-list-item>
      <mat-checkbox [checked]="todo.done"
        (change)="clickTodoCheckbox($event, todo)">
        {{ todo.title }}
      </mat-checkbox>
      <span class="filler"></span>
      <button mat-button color="warn" (click)="deleteTodo.emit(todo)">
        X
      </button>
    </mat-list-item>
  `,
  styles: [
    `
    .filler {
      flex: 1 1 auto;
    }
  `
  ]
})
export class TodoItemComponent {
  @Input() todo
  @Output() toggleTodoDone = new EventEmitter()
  @Output() deleteTodo = new EventEmitter()

  clickTodoCheckbox($event, todo) {
    let updatedTodo = Object.assign({}, todo, { done: $event.checked })
    this.toggleTodoDone.emit(updatedTodo)
  }
}
