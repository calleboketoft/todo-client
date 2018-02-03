// This is the place where "side-effects" are gathered.
// In this case, we're going to make requests to a http server.
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/map'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Effect, Actions } from '@ngrx/effects'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/zip'
import { Observable, BehaviorSubject } from 'rxjs/Rx'

import { LOADED_TODOS } from '../reducers/todo.reducer'
import { UPDATED_TODO } from '../reducers/todo.reducer'
import { DELETED_TODO } from '../reducers/todo.reducer'
import { ADDED_TODO } from '../reducers/todo.reducer'

// Effect types
export const QUERY_TODOS = 'QUERY_TODOS'
export const PATCH_TODO = 'PATCH_TODO'
export const DELETE_TODO = 'DELETE_TODO'
export const POST_TODO = 'POST_TODO'

@Injectable()
export class TodoEffects {
  @Effect()
  queryTodos$ = this.actions$.ofType(QUERY_TODOS).mergeMap(action => {
    // We're using the built in @angular/http client for our requests
    return this.httpClient
      .get('http://localhost:4201/api/Todos')
      .map(data => ({ type: LOADED_TODOS, payload: data }))
  })

  @Effect()
  patchTodo$ = this.actions$.ofType(PATCH_TODO).mergeMap((action: any) => {
    return this.httpClient
      .patch(
        `http://localhost:4201/api/Todos/${action.payload.id}`,
        action.payload
      )
      .map(data => ({ type: UPDATED_TODO, payload: data }))
  })

  @Effect()
  deleteTodo$ = this.actions$
    .ofType(DELETE_TODO)
    // Here we need to pass foward the action to the mergeMap so that we can
    // use the id for the todo in the reducer
    .switchMap((action: any) => {
      // create a new observable with both the result from the delete request
      // and a preloaded observable (BehaviorSubject) with the action
      return Observable.zip(
        this.httpClient.delete(
          `http://localhost:4201/api/Todos/${action.payload.id}`
        ),
        new BehaviorSubject(action)
      )
    })
    // Here the data from both observables is available
    .mergeMap(([res, action]: any) => {
      return Observable.from([{ type: DELETED_TODO, payload: action.payload }])
    })

  @Effect()
  addTodo$ = this.actions$.ofType(POST_TODO).mergeMap((action: any) => {
    return this.httpClient
      .post('http://localhost:4201/api/Todos', action.payload)
      .map(data => ({ type: ADDED_TODO, payload: data }))
  })

  constructor(private httpClient: HttpClient, private actions$: Actions) {}
}
