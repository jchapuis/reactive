import {MapStateToProps} from "react-redux";
import {Action, MiddlewareAPI} from "redux";
import { ActionsObservable } from "redux-observable";
import { Observable } from "rxjs/observable";
import "rxjs/add/operator/map";

export interface TypedAction<T, P> extends Action {
    readonly type: T;
    readonly payload: P;
    error?: boolean;
    meta?: {};
}

export function createAction<T extends string, P>(type: T, payload: P): TypedAction<T, P> {
    return ({type, payload});
}

export function actionsOfType<A>(this: ActionsObservable<any>, type: string): Observable<A> {
    return this.ofType(type).map(t => (t as A));
}

// Add the operator to the Observable prototype:
ActionsObservable.prototype.actionsOfType = actionsOfType;

// Extend the TypeScript interface for Observable to include the operator:
declare module "redux-observable" {
  interface ActionsObservable<T extends Action> {
    actionsOfType: typeof actionsOfType;
  }
}

