import React, {Component} from 'react';
import {Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment} from 'semantic-ui-react';
import {CirclePicker} from 'react-color';
import {connect} from 'react-redux';

import firebase from '../../firebase';
import {setColors} from '../../store/actions/index';

class ColorPanel extends Component {
  state = {
    modal: false,
    primaryColor: '',
    secondaryColor: '',
    userColors: [],
    currentUser: this.props.currentUser,
    usersRef: firebase.database().ref('users')
  }

  componentDidMount() {
    if(this.state.currentUser){
      this.addListeners(this.state.currentUser.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = userUId => {
    let userColors = [];
    this.state.usersRef
      .child(userUId).child('colors')
      .on('child_added', snapshot => {
        userColors.unshift(snapshot.val());
        this.setState({userColors});
      });
  }
  
  removeListeners = () => {
    this.state.usersRef.child(this.state.currentUser.uid).child('colors').off();
  }

  openModal = () => this.setState({modal: true});
  closeModal = () => this.setState({modal: false});

  primaryColorChangeHandler = color => {
    this.setState({primaryColor: color.hex});
  }

  secondaryColorChangeHandler = color => {
    this.setState({secondaryColor: color.hex});
  }

  saveColorsHandler = () => {
    if(this.state.primaryColor && this.state.secondaryColor){
      const {primaryColor, secondaryColor} = this.state;
      this.state.usersRef.child(`${this.state.currentUser.uid}/colors`)
      .push()
      .update({
        primaryColor,
        secondaryColor
      })
      .then(() => {
        // console.log('added to database');
        this.closeModal();
      })
      .catch(err => {
        console.error(err);
      });
    }
  }

  displayUserColors = userColors => {
    return (
      userColors.length > 0 && userColors.map((color, i) => (
        <React.Fragment key={i}>
          <Divider />
          <div 
            className="color__display" 
            onClick={() => this.props.setColors(color.primaryColor, color.secondaryColor)}
          >
            <div className="color__square" style={{background: color.primaryColor}}>
              <div className="color__overlay" style={{background: color.secondaryColor}}>
              </div>
            </div>
          </div>
          <p style={{color: '#eee'}}>Theme</p>
        </React.Fragment>
      ))
    );
  }




  render() {
    const {modal, primaryColor, secondaryColor, userColors} = this.state;

    return (
      <Sidebar 
        as={Menu} icon="labeled"
        inverted vertical
        visible width="very thin"
      >
        <Divider />
        <Button 
          icon="chess rook" size="small" 
          color="orange" onClick={this.openModal} 
        />
        {this.displayUserColors(userColors)}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose Theme Color</Modal.Header>
          <Modal.Content>
            <Segment.Group horizontal>
              <Segment inverted>
                <Label content="SideBar Background Color" style={{marginBottom: '0.5em'}}/>
                <CirclePicker color={primaryColor} onChange={this.primaryColorChangeHandler}/>
              </Segment>
              <Segment inverted>
                <Label content="Panel Background Color" style={{marginBottom: '0.5em'}} />
                <CirclePicker color={secondaryColor} onChange={this.secondaryColorChangeHandler} />
              </Segment>
            </Segment.Group>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.saveColorsHandler}>
              <Icon name="checkmark" />Save
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" />Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

export default connect(null, {setColors})(ColorPanel);