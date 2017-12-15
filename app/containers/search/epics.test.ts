import { ErrorResult, ContentResult, SearchState } from './state';
import { searchOnInputChangedEpic, searchEpic, suggestOnInputChangedEpic } from "./epics";
import { suggest, searchFulfilled, inputChanged, search, Actions } from './actions';
import { IServices } from "services/services";
import { IWikipediaService } from "services/wikipedia";
import * as Rx from "rxjs";
import { createTestScheduler, frames } from "utils/rx/test-helpers";
import { ActionsObservable } from "redux-observable";
import { MiddlewareAPI } from "redux";
import { createTestAction$FromMarbles, createTestAction$ } from "utils/redux-observable/test-helpers";
import * as TypeMoq from "typemoq";

describe("/app/containers/search/epics", () => {
    // Mock store
    const storeMock = TypeMoq.Mock.ofType<MiddlewareAPI<SearchState>>();
    const store = storeMock.object;

    test("suggestEpic debounces input", () => {
        // Create test scheduler
        const testScheduler = createTestScheduler();

        // Mock services 
        const servicesMock = TypeMoq.Mock.ofType<IServices>();
        servicesMock.setup(m => m.scheduler).returns(() => testScheduler);
        const services = servicesMock.object;

        // Define marbles
        const inputActions = {
            a: inputChanged("rr"),
            b: inputChanged("rx"),
            c: inputChanged("rxjs")
        };
        const outputActions = {
            b: suggest("rx", false),
            c: suggest("rxjs", false)
        };
        const inputMarble = "-ab---------------------c";
        const outputMarble = "----------------------b---------------------c";

        // Mock input actions stream
        const action$ = createTestAction$FromMarbles<Actions>(testScheduler, inputMarble, inputActions);

        // Apply epic on actions observable
        const outputAction$ = suggestOnInputChangedEpic(action$, store, services);

        // Assert on the resulting actions observable
        testScheduler.expectObservable(outputAction$).toBe(outputMarble, outputActions);

        // Run test
        testScheduler.flush();
    });

    test("searchOnInputChangedEpic debounces input", () => {
        // Create test scheduler
        const testScheduler = createTestScheduler();

        // Mock services instance, passing in our test scheduler
        const servicesMock = TypeMoq.Mock.ofType<IServices>();
        servicesMock.setup(m => m.scheduler).returns(() => testScheduler);
        const services = servicesMock.object;

        // Define marbles
        const inputActions = {
            a: inputChanged("rr"),
            b: inputChanged("rx"),
            c: inputChanged("rxjs")
        };
        const outputActions = {
            b: search("rx"),
            c: search("rxjs")
        };
        const inputMarble = "-ab" + frames(30) + "-c";
        const outputMarble = "--" + frames(30) + "b-" + frames(30) + "c";

        // Mock input actions stream
        const action$ = createTestAction$FromMarbles<Actions>(testScheduler, inputMarble, inputActions);

        // Apply epic on actions observable
        const outputAction$ = searchOnInputChangedEpic(action$, store, services);

        // Assert on the resulting actions observable
        testScheduler.expectObservable(outputAction$).toBe(outputMarble, outputActions);

        // Run test
        testScheduler.flush();
    });

    test("searchOnInputChangedEpic doesn't launch unecessary duplicate searches (distinctUntilChanged order)", () => {
        // Create test scheduler
        const testScheduler = createTestScheduler();

        // Mock services 
        const servicesMock = TypeMoq.Mock.ofType<IServices>();
        servicesMock.setup(m => m.scheduler).returns(() => testScheduler);
        const services = servicesMock.object;

        // Define marbles
        const inputActions = {
            a: inputChanged("r"),
            b: inputChanged("rx"),
            c: inputChanged("rxjs")
        };
        const outputActions = {
            b: search("rx")
        };
        const inputMarble = "-ab" + frames(30) + "-cb";
        const outputMarble = "--" + frames(30) + "b-";

        // Mock input actions stream
        const action$ = createTestAction$FromMarbles<Actions>(testScheduler, inputMarble, inputActions);

        // Apply epic on actions observable
        const outputAction$ = searchOnInputChangedEpic(action$, store, services);

        // Assert on the resulting actions observable
        testScheduler.expectObservable(outputAction$).toBe(outputMarble, outputActions);

        // Run test
        testScheduler.flush();
    });

    test("searchEpic with content", (done) => {
        const searchInput = "rxjs";
        const searchResult = "Reactive programming";

        // Mock services 
        const servicesMock = TypeMoq.Mock.ofType<IServices>();
        const wikipediaMock = TypeMoq.Mock.ofType<IWikipediaService>();
        wikipediaMock.setup(m => m.pageContent(searchInput)).returns(() => Rx.Observable.of(searchResult));
        servicesMock.setup(m => m.wikipedia).returns(() => wikipediaMock.object);
        const services = servicesMock.object;

        // Mock input actions stream
        const action$ = createTestAction$<Actions>(search(searchInput));

        // Apply epic on actions observable
        const outputAction$ = searchEpic(action$, store, services);

        // Assert on the resulting actions observable   
        outputAction$.subscribe(
            action => expect(action).toEqual(searchFulfilled(new ContentResult(searchResult))),
            error => fail(error),
            done
        );
    });

    test("searchEpic with error", (done) => {
        const searchInput = "rxjs";
        const searchError = "Some error";

        // Mock services 
        const servicesMock = TypeMoq.Mock.ofType<IServices>();
        const wikipediaMock = TypeMoq.Mock.ofType<IWikipediaService>();
        wikipediaMock.setup(m => m.pageContent(searchInput)).returns(() => Rx.Observable.throw(new Error(searchError)));
        servicesMock.setup(m => m.wikipedia).returns(() => wikipediaMock.object);
        const services = servicesMock.object;

        // Mock input actions stream
        const action$ = createTestAction$<Actions>(search(searchInput));

        // Apply epic on actions observable
        const outputAction$ = searchEpic(action$, store, services);

        // Assert on the resulting actions observable   
        outputAction$.subscribe(
            action => expect(action).toEqual(searchFulfilled(new ErrorResult(searchError))),
            error => fail(error),
            done
        );
    });

});