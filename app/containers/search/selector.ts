// Redux selectors: any time the store is updated, mapStateToProps will be called. 
// The results of mapStateToProps must be a plain object, which will be merged into the component’s props.
import { MapStateToProps, MapDispatchToPropsFunction } from "react-redux";
import { SearchPageStateProps, SearchSuggestionProps, SearchPageDispatchProps } from "components/search-page";
import { AppState } from "app-state";
import { ErrorResult, ContentResult } from "containers/search/state";
import { Dispatch, bindActionCreators } from "redux";
import { inputChanged, suggestionSelected, showMenu, hideMenu, blurMenu } from "containers/search/actions";

export const mapStateToProps: MapStateToProps<SearchPageStateProps, any, AppState> = (state: AppState, ownProps: any) => {
    const result = state.search.searchResult;
    return {
        suggestions: state.search.suggestions.map((s, idx) => {
            const suggestion: SearchSuggestionProps = { id: idx, title: s.title, description: s.description, image: s.thumbnailUrl };
            return suggestion;
        }),
        suggestionsLoading: state.search.suggestionsLoading,
        input: state.search.input,
        error: (result instanceof ErrorResult) ? result.error : "",
        loading: state.search.loading,
        hasContent: (result instanceof ContentResult),
        content: (result instanceof ContentResult) ? result.content : "",
        menuOpen: state.search.menuOpen
    };
};

export const mapDispatchToProps: MapDispatchToPropsFunction<SearchPageDispatchProps, any> = (dispatch: Dispatch<any>, ownProps: any) => {
    return bindActionCreators({ inputChanged, suggestionSelected, onFocus: showMenu, onBlur: blurMenu }, dispatch);
};
