import {Action} from "redux";
import { ActionsObservable } from "redux-observable";
import { TestScheduler } from "rxjs/Rx";
import * as Rx from "rxjs";

export function createTestAction$FromMarbles<A extends Action>(testScheduler: TestScheduler, marbles: string, values?: any) {
    return new ActionsObservable<A>(testScheduler.createHotObservable(marbles, values));
}

export function createTestAction$<A extends Action>(...actions: A[]) {
    return new ActionsObservable<A>(Rx.Observable.from(actions));
}