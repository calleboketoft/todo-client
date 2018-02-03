// Reducer types
export const LOADED_TODOS = 'LOADED_TODOS'
export const UPDATED_TODO = 'UPDATED_TODO'
export const DELETED_TODO = 'DELETED_TODO'
export const ADDED_TODO = 'ADDED_TODO'

export function todoReducer(state = [], action) {
  switch (action.type) {
    case LOADED_TODOS:
      return action.payload

    case UPDATED_TODO:
      // overwrite properties in stored todo that are incoming in the payload
      return state.map(todo => {
        if (todo.id + '' === action.payload.id + '') {
          return Object.assign({}, todo, action.payload)
        } else {
          return todo
        }
      })

    case DELETED_TODO:
      return state.filter(todo => {
        // make sure ids are compared as strings
        return todo.id + '' !== action.payload.id + ''
      })

    case ADDED_TODO:
      // create a new array with all previous todos and add the new one
      return [...state, action.payload]

    default:
      return state
  }
}
