# Angular todo application with NgRX

Prerequisites:

* Node >= 8.9.1
* NPM >= 5.2.0
* Visual Studio Code (VSC) https://code.visualstudio.com/
* VSC plugin "Angular Language Service"
* VSC plugin "Angular 2 inline"
* VSC plugin "TSLint"

Install the pre-made server for the project

```bash
git clone https://github.com/calleboketoft/todo-server.git
cd todo-server
npm install
```

Now the server will be available at http://localhost:4201

## Generating a new Angular application

Generate a new Angular application

```bash
npx @angular/cli new stugan-client --prefix=stugan --skip-tests=true --inline-template=true --inline-style=true
```

Enter the application

```bash
cd stugan-client
```

Open the folder `stugan-client` in Visual Studio Code and replace the content in the file `src/app/app.component.ts` with this:

```javascript
import { Component } from '@angular/core';

@Component({
  selector: 'stugan-root',
  template: `
    <div class="container">
      <h1>Stugan!</h1>
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
export class AppComponent {}
```

Try out the new application by starting the development server in a terminal:

```bash
npm start
```

The project is available at http://localhost:4200. Live reload is enabled by default so editing any file will cause a re-compile and browser reload.

## Adding NgRX store and effects

We will use the NgRX modules for state management and side-effects (making requests to the server).

NgRX is a collection of Reactive libraries for Angular. https://github.com/ngrx/platform

* @ngrx/store - RxJS powered state management for Angular applications, inspired by Redux
* @ngrx/effects - Side Effect model for @ngrx/store to model event sources as actions.

Install the NgRX packages into `stugan-client`:

```bash
npm install --save @ngrx/store@6.0.0-beta.3 @ngrx/effects@6.0.0-beta.3
```

What we're going to do in the following steps is to lay out the plumbing for our todo reducer and our todo effects.

Create the todo reducer `src/app/reducers/todo.reducer.ts`

```javascript
// Reducer types
export const LOADED_TODOS = 'LOADED_TODOS';

export function todoReducer(state = [], action) {
  switch (action.type) {
    case LOADED_TODOS:
      return action.payload;

    default:
      return state;
  }
}
```

Register NgRX store and the reducer with the app `src/app/app.module.ts`:

```javascript
import { StoreModule } from '@ngrx/store';
import { todoReducer } from './reducers/todo.reducer';
...

@NgModule({
  ...
  imports: [
    ...
    StoreModule.forRoot({ todoReducer: todoReducer })
  ]
  ...
}
```

Create the Todo effects `src/app/effects/todo.effects.ts`. Note that we're using the Angular HttpClient:

```javascript
// This is the place where "side-effects" are gathered.
// In this case, we're going to make requests to a http server.
import { mergeMap, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Effect, Actions } from '@ngrx/effects';

import { LOADED_TODOS } from '../reducers/todo.reducer';

// Effect types
export const QUERY_TODOS = 'QUERY_TODOS';

@Injectable()
export class TodoEffects {

  @Effect() queryTodos$: Observable<Action> = this.actions$.pipe(
    ofType(QUERY_TODOS),
    mergeMap(action => {
      // We're using the built in @angular/http client for our requests
      return this.httpClient
        .get('http://localhost:4201/api/Todos')
        .pipe(map(data => ({ type: LOADED_TODOS, payload: data })));
    })
  );

  constructor(
    private httpClient: HttpClient,
    private actions$: Actions
  ) {}
}
```

Register NgRX effects, the todo effects, and the HttpClient with app module `src/app/app.module.ts`:

```javascript
...
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { TodoEffects } from './effects/todo.effects';
...

@NgModule({
  ...
  imports: [
    ...
    HttpClientModule,
    EffectsModule.forRoot([TodoEffects])
  ]
  ...
})
```

The reducer and effect for loading todos is now done and we're ready to get the todos that are on the server. Edit `src/app/app.component.ts`:

```javascript
...
import { OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { QUERY_TODOS } from './effects/todo.effects';

...

export class AppComponent implements OnInit {

  // register the observable todos$ that will contain the collection of todos
  todos$ = this.store.select('todoReducer')

  // component lifecycle method in Angular
  ngOnInit () {
    this.store.dispatch({ type: QUERY_TODOS });

    this.todos$.subscribe(todos => {
      // log the todos collection as soon as the reducer is updated
      console.log(todos);
    })
  }

  // Instantiate the Store to use in this component
  constructor (private store: Store<any>) {}
}
```

Now take a look at the live app in the browser. In the console, we can see that the collection of todos have been loaded from the server.

## UI with Angular Material

Install Angular Material

```bash
npm install --save @angular/material @angular/cdk @angular/animations
```

Import the animations module and material modules into `src/app/app.module.ts`:

```javascript
...
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule, MatListModule, MatInputModule, MatFormFieldModule, MatButtonModule
  } from '@angular/material';

...

@NgModule({
  ...
  imports: [
    ...
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule
  ]
  ...
})
```

Import Material CSS into `src/styles.css`:

```css
@import "~@angular/material/prebuilt-themes/indigo-pink.css";
```

The parts of Angular Material that we're going to use for this project are now imported and ready to use.

## Display list of todos

We're going to use the Material list component `<mat-list>` populated with `<mat-list-item>`s to display the todos. The todo item will be a new component, let's generate that one:

```bash
npm run ng -- generate component todo-item
```

Open the file `src/app/todo-item/todo-item.component.ts` and replace the contents with the following code:

```javascript
import { Component, Input } from "@angular/core";

@Component({
  selector: "stugan-todo-item",
  template: `
    <mat-list-item>
      {{ todo.title }}
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
  @Input() todo;
}
```

Now let's render the list of todo items in the template of `src/app/app.component.ts`:

```html
...
    <div class="container">
      <h1>Stugan!</h1>
      <mat-list>
        <stugan-todo-item *ngFor="let todo of todos$ | async"
          [todo]="todo">
        </stugan-todo-item>
      </mat-list>
    </div>
...
```

The list of todos should now be visible in the browser.

## Update a todo

Displaying the todos is done and now we want to add some interactivity. Let's begin with adding functionality for checking and unchecking a todo as "done".

In the file `src/app/todo-item/todo-item.component.ts`, replace the template with the following code:

```html
    <mat-list-item>
      <mat-checkbox [checked]="todo.done"
        (change)="clickTodoCheckbox($event, todo)">
        {{ todo.title }}
      </mat-checkbox>
    </mat-list-item>
```

In the template we're now referencing a function called `clickTodoCheckbox()` so we need to add that one as well:

```javascript
...
  @Input() todo;

  clickTodoCheckbox($event, todo) {
    const updatedTodo = Object.assign({}, todo, { done: $event.checked })
    console.log(updatedTodo);
  }
...
```

Clicking the checkbox will log the updated todo object.

We want to keep this component "dumb", so we aren't going to make any requests or dispatch any actions from within this component. Therefore we will send the updated todo as an "output" to the "smart" parent of this component. Import the following into `src/app/todo-item/todo-item.component.ts`:

```javascript
...
import { Output, EventEmitter } from '@angular/core';
...
```

Angular component outputs are so called "EventEmitters" which send events upstream in the component hierarchy. Add the output `toggleTodoDone` and update the method `clickTodoCheckbox()`:

```javascript
@Input() todo;
@Output() toggleTodoDone = new EventEmitter();
...
  clickTodoCheckbox($event, todo) {
    const updatedTodo = Object.assign({}, todo, { done: $event.checked })
    this.toggleTodoDone.emit(updatedTodo)
  }
...
```

Now the parent of this component `AppComponent` will be able to catch the event `(toggleTodoDone)` from the `TodoItemComponent`. Listen to the event from the parent component in `src/app/app.component.ts`:

```html
        <stugan-todo-item *ngFor="let todo of todos$ | async"
          [todo]="todo"
          (toggleTodoDone)="toggleTodoDone($event)">
        </stugan-todo-item>
```

When the event (toggleTodoDone) happens, we will call the function `toggleTodoDone()` that will eventually make the actual call for action to the store. For now it'll just log the todo for now:

```javascript
toggleTodoDone (todo) {
  console.log(todo);
}
```

Now we'll set up a reducer function that will take care of syncing the client state for when a todo has been updated on the server. Add the reducer code to `src/app/reducers/todo.reducer.ts`:

```javascript
export const UPDATED_TODO = 'UPDATED_TODO';

...

case UPDATED_TODO:
  // overwrite properties in stored todo that are incoming in the payload
  return state.map(todo => {
    if (todo.id + '' === action.payload.id + '') {
      return Object.assign({}, todo, action.payload)
    } else {
      return todo
    }
  })
```

Then we'll add an "effect" that will perform the request to the server for updating a todo item, `src/app/effects/todo.effects.ts`:

```javascript
import { UPDATED_TODO } from '../reducers/todo.reducer';

...

export const PATCH_TODO = 'PATCH_TODO';

...

@Effect()
  patchTodo$ = this.actions$.pipe(
    ofType(PATCH_TODO),
    mergeMap((action: any) => {
      return this.httpClient
        .patch(
          `http://localhost:4201/api/Todos/${action.payload.id}`,
          action.payload
        )
        .pipe(map(data => ({ type: UPDATED_TODO, payload: data })));
    })
  );
```

Handling the request and response of updating a todo is done. Let's import the action type `PATCH_TODO` and update the method `toggleTodoDone()` in the file `src/app/app.component.ts` to dispatch the action to the store:

```javascript
import { PATCH_TODO } from './effects/todo.effects';

...

toggleTodoDone(todo) {
  this.store.dispatch({ type: PATCH_TODO, payload: todo });
}
```

Go to the browser and click the checkbox of a todo and the request will now be sent to the server to patch the todo item!

## Deleting todos

We'll go ahead and add the reducer and effect code for deleting todos. Add to `src/app/reducers/todo.reducer.ts`:

```javascript
...

export const DELETED_TODO = 'DELETED_TODO';

...

    case DELETED_TODO:
      return state.filter(todo => {
        // make sure ids are compared as strings
        return todo.id + '' !== action.payload.id + ''
      })
...
```

Add to `src/app/effects/todo.effects.ts`:

```javascript
import { switchMap } from 'rxjs/operators';
import { BehaviorSubject, from, zip } from 'rxjs';

...

import { DELETED_TODO } from '../reducers/todo.reducer';

...

export const DELETE_TODO = 'DELETE_TODO';

...

  @Effect() deleteTodo$ = this.actions$.pipe(
    ofType(DELETE_TODO),
    // Here we need to pass foward the action to the mergeMap so that we can
    // use the id for the todo in the reducer
    switchMap((action: any) => {
      // create a new observable with both the result from the delete request
      // and a preloaded observable (BehaviorSubject) with the action
      return zip(
        this.httpClient.delete(
          `http://localhost:4201/api/Todos/${action.payload.id}`
        ),
        new BehaviorSubject(action)
      );
    }),
    // Here the data from both observables is available
    mergeMap(([res, action]: any) => {
      return from([{ type: DELETED_TODO, payload: action.payload }]);
    })
  );
```

Handling the request and response is done, a button for removing a todo would be nice. Add that button under `</mat-checkbox>` in the template of `src/app/todo-item/todo-item.component.ts`:

```html
      <span class="filler"></span>
      <button mat-button color="warn" (click)="deleteTodo.emit(todo)">
        X
      </button>
```

Keeping `todo-item.component.ts` dumb is important so we're going to let the parent (`AppComponent`) handle the request this time as well. Add to `src/app/todo-item/todo-item.component.ts`:

```javascript
...

@Output() deleteTodo = new EventEmitter();

...
```

Now receive the new `(deleteTodo)` event in the template on the component `<stugan-todo-item>` in `src/app/app.component.ts`:

```html
        <stugan-todo-item *ngFor="let todo of todos$ | async"
          [todo]="todo"
          (toggleTodoDone)="toggleTodoDone($event)"
          (deleteTodo)="deleteTodo($event)">
        </stugan-todo-item>
```

Import the action name `DELETE_TODO` and add the method `deleteTodo()` that will dispatch the action for actually deleting the todo:

```javascript
import { DELETE_TODO } from './effects/todo.effects';

...

  deleteTodo (todo) {
    this.store.dispatch({ type: DELETE_TODO, payload: todo });
  }
```

Now take a look at the browser again. There should be buttons with `X`s to the right of the todos. Clicking such a button will dispatch the action `DELETE_TODO` and a request will be made to the server to delete the todo.

## Adding todos

To complete the whole circle we should be able to add todos as well. Let's begin with the reducer and effect. Add to `src/app/reducers/todo.reducer.ts`:

```javascript
export const ADDED_TODO = 'ADDED_TODO';

...

    case ADDED_TODO:
      // create a new array with all previous todos and add the new one
      return [...state, action.payload];
```

Add to `src/app/effects/todo.effects.ts`:

```javascript
import { ADDED_TODO } from '../reducers/todo.reducer';

...

export const POST_TODO = 'POST_TODO';

...

  @Effect()addTodo$ = this.actions$.pipe(
    ofType(POST_TODO),
    mergeMap((action: any) => {
      return this.httpClient
        .post('http://localhost:4201/api/Todos', action.payload)
        .pipe(map(data => ({ type: ADDED_TODO, payload: data })));
    })
  );
```

That's it for the request and response handling. The view for adding a todo would nicely fit a dumb component containing a form with an input. Since we're going to work with a form, we need to import and activate the form module in the file `src/app/app.module.ts`:

```javascript
import { ReactiveFormsModule } from '@angular/forms';

...

@NgModule({
  ...
  imports: [
  ...
    ReactiveFormsModule
  ]
  ...
})
```

Let's generate our new component for the input field:

```bash
npm run ng -- generate component todo-add-form
```

The component has now been generated and included in the app module. Replace the contents of the newly generated component `src/app/todo-add-form/todo-add-form.component.ts`:

```javascript
import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';

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
  @Output() addTodo = new EventEmitter();

  addTodoForm = this.formBuilder.group({
    todoTitle: ''
  });

  submitAddTodoForm($event) {
    const todoTitleControl = this.addTodoForm.controls.todoTitle
    this.addTodo.emit(todoTitleControl.value)
    todoTitleControl.setValue('')
  }

  constructor(private formBuilder: FormBuilder) { }
}
```

Here we're using an Angular tool called `FormBuilder`, which is used to construct reactive (RxJS) forms. There are different ways of managing forms in Angular and this is the most dynamic one. "Template Driven Forms" in Angular is kind of like managing forms in AngularJS and easily becomes messy (in my opinion).

Our new component needs to be exposed in the UI, so let's add it to the template of `src/app/app.component.ts`, right inside of `<div class="container">`:

```javascript
      <stugan-todo-add-form
        (addTodo)="addTodo($event)">
      </stugan-todo-add-form>
```

We also need the action type `POST_TODO` and the method `addTodo()` to handle the event `(addTodo)` that will come from the input component:

```javascript
import { POST_TODO} from './effects/todo.effects';

...

  addTodo (todoTitle) {
    this.store.dispatch({ type: POST_TODO, payload: { title: todoTitle }});
  }
```

Go to the browser and try out the new input field for adding a todo. Type the name of the new todo and press enter.

The todo app is now done and ready for action!

## Further adventures

* Form input validation
* Error handling in the effects
* Debouncing form input using the power of the reactive form
* Adding a reducer function and an effect for loading one todo
* Routing to one todo
* Writing tests for the different components
