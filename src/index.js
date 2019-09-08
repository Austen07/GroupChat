import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import {BrowserRouter, Route, Switch, withRouter} from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';

//import component
import App from './components/App/App';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import firebase from './firebase';
import registerServiceWorker from './registerServiceWorker';
import Spinner from './components/Spinner/Spinner';

//global state
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';
import {composeWithDevTools} from 'redux-devtools-extension';

//root Reducer
import rootReducer from './store/reducers/index';

//import actions
import {setUser, clearUser} from './store/actions/index';


const store = createStore(rootReducer, composeWithDevTools());


class Root extends Component {
  componentDidMount() {
    // console.log(this.props.isLoading);
    //once firebase detect a user log in correctly
    firebase.auth().onAuthStateChanged(user => {
      if(user){
        //store the user info into global store
        this.props.setUser(user);
        this.props.history.push('/');
      }else{
        this.props.history.push('/login');
        this.props.clearUser();
      }
    });
  }

  render() {
    return this.props.isLoading ? 
    (<Spinner />) 
    : (
      <Switch>
        <Route path='/' exact component={App} />
        <Route path='/login' component={Login} />
        <Route path='/register' component={Register} />
      </Switch>
    );
  }  
}

const mapStateToProps = state => ({
  isLoading: state.user.isLoading
});



//wrap with hoc
const RootWithAuth = withRouter(
  connect(mapStateToProps, {setUser, clearUser})(Root)
);

ReactDOM.render(
  <Provider store={store}> 
    <BrowserRouter>
      <RootWithAuth />
    </BrowserRouter>
  </Provider>, 
  document.getElementById('root')
);
registerServiceWorker();
