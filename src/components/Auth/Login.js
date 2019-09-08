import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';

import firebase from '../../firebase';
import BgVideo from './BgVideo';

class Login extends Component {
  state = {
    email: "",
    password: "",
    errors: [],
    loading: false,
  }

  displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);

  inputErrorHandler = (errors, inputContent) => {
    return errors.some(error => error.message.toLowerCase().includes(inputContent)) ? 'error' : ''
  }

  changeHandler = (event) => {
    this.setState({[event.target.name]: event.target.value});
  };

  submitHandler = (event) => {
    event.preventDefault();

    if(this.isFormValid(this.state)){
      this.setState({errors: [], loading: true});
      firebase.auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(signedInUser => {
          console.log(signedInUser);
          //i add this setstate
          this.setState({loading: false});
        })
        .catch(err => {
          console.error(err);
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false
          })
        })
    }
  }

  isFormValid = ({email, password}) => (email && password);

  render() {
    const {email, password, errors, loading} = this.state;
    return (
      <React.Fragment>
      <BgVideo />
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{maxWidth: 450}}>
          <Header as="h1" icon color="teal" textAlign="center">
            <Icon name="map" color="teal" />
             Log in
          </Header>
          <Form size="large" onSubmit={this.submitHandler}>
            <Segment stacked>
              <Form.Input 
                className={this.inputErrorHandler(errors, 'email')}
                fluid name="email" icon="mail" 
                iconPosition="left" placeholder="Email Address"
                onChange={this.changeHandler} type="email" 
                value={email} />

              <Form.Input 
                className={this.inputErrorHandler(errors, 'password')}
                fluid name="password" icon="lock" 
                iconPosition="left" placeholder="Password"
                onChange={this.changeHandler} type="password"
                value={password} />

              <Button 
                disabled={loading}
                className={loading ? 'loading' : ''} 
                color="teal" fluid size="large">Log in</Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>
            First time here? 
            <Link to="/register"> Sign Up </Link>
          </Message>
        </Grid.Column>
      </Grid>
      </React.Fragment>
    )
  }
}

export default Login;