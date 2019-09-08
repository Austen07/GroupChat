import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import md5 from 'md5'; //hash the message

import firebase from '../../firebase';
import BgVideo from './BgVideo';

class Register extends Component {
  state = {
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    errors: [],
    loading: false,
    usersRef: firebase.database().ref('users')
  }

  isFormValid = () => {
    let errors = [];
    let error;

    if(this.isFormEmpty(this.state)){
      error = {message : 'Form is empty'};
      this.setState({errors: errors.concat(error)});
      return false;
    }else if(!this.isPasswordValid(this.state)){
      error = {message: 'Password is invalid'};
      this.setState({errors: errors.concat(error)});
      return false;
    }
    
    return true;
  }

  isFormEmpty = ({username, email, password, passwordConfirmation}) => {
    return !username.length || !email.length || !password.length || !passwordConfirmation.length;
  }

  isPasswordValid = ({password, passwordConfirmation}) => {
    if(password.length < 6 || passwordConfirmation.length < 6){
      return false;
    }
    if(password !== passwordConfirmation){
      return false;
    }
    return true;
  }

  saveUser = (createdUser) => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL
    });
  };

  displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);

  inputErrorHandler = (errors, inputContent) => {
    return errors.some(error => error.message.toLowerCase().includes(inputContent)) ? 'error' : ''
  }

  changeHandler = (event) => {
    this.setState({[event.target.name]: event.target.value});
  };

  submitHandler = (event) => {
    event.preventDefault();

    if(this.isFormValid()){
      this.setState({errors: [], loading: true});
      firebase.auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
          console.log(createdUser);
          createdUser.user.updateProfile({
            displayName: this.state.username,
            photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
          })
          .then(() => {
            //save the user info to firedatabase
            this.saveUser(createdUser).then(() => {
              console.log('User saved');
            })
            this.setState({loading: false});
          })
          .catch(err => {
            console.error(err);
            this.setState({errors: this.state.errors.concat(err), loading: false});
          })
          
        })
        .catch(err => {
          console.log(err);
          this.setState({errors: this.state.errors.concat(err), loading: false});
        });
    }
  }

  render() {
    const {username, email, password, passwordConfirmation, errors, loading} = this.state;
    return (
      <React.Fragment>
        <BgVideo />
      
        <Grid textAlign="center" verticalAlign="middle" className="app">
          <Grid.Column style={{maxWidth: 450}}>
            <Header as="h1" icon color="brown" textAlign="center">
              <Icon name="binoculars" color="brown" />
              Sign Up
            </Header>
            <Form size="large" onSubmit={this.submitHandler}>
              <Segment stacked>
                <Form.Input 
                  fluid name="username" icon="user" 
                  iconPosition="left" placeholder="User Name"
                  onChange={this.changeHandler} type="text"
                  value={username} />

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

                <Form.Input 
                  className={this.inputErrorHandler(errors, 'password')}
                  fluid name="passwordConfirmation" icon="repeat" 
                  iconPosition="left" placeholder="Password Confirmation"
                  onChange={this.changeHandler} type="password"
                  value={passwordConfirmation} />

                <Button 
                  disabled={loading}
                  className={loading ? 'loading' : ''} 
                  color="brown" fluid size="large">Sign Up</Button>
              </Segment>
            </Form>
            {errors.length > 0 && (
              <Message error>
                <h3>Error</h3>
                {this.displayErrors(errors)}
              </Message>
            )}
            <Message>
              Already have an account?
              <Link to="/login"> Log in</Link>
            </Message>
          </Grid.Column>
        </Grid>
        
      </React.Fragment>
    )
  }
}

export default Register;