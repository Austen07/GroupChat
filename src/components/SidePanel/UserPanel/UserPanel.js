import React, {Component} from 'react';
import {Grid, Header, Icon, Dropdown, Image, Modal, Button, Input} from 'semantic-ui-react';
import AvatarEditor from 'react-avatar-editor';
import mime from 'mime-types';

import firebase from '../../../firebase';

class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
    userRef: firebase.auth().currentUser,
    usersRef: firebase.database().ref('users'),
    modal: false,

    previewImage: '',
    croppedImage: '', 
    blob: '',
    uploadedAvatar: '',

    storageRef: firebase.storage().ref(),
    authorizedTypes: ['image/jpeg', 'image/png'],
    metadata: null
  }

  openModal = () => {this.setState({modal: true})};
  closeModal = () => {this.setState({modal: false})};


  dropdownOptions = () => [
    { key: "user",
      text: <span><Icon name="user circle" />Signed in as <strong>{this.state.user.displayName}</strong></span>,
      disabled: true
    },
    { key: "avatar",
      text: <span onClick={this.openModal}><Icon name="images" />Change Avatar</span>
    },
    { key: "logout",
      text: <span onClick={this.logoutHandler}><Icon name="log out" />Log Out</span>
    }
  ]

  logoutHandler = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("log out");
      })
  }

  changeHandler = event => {
    const file = event.target.files[0];
    const reader = new FileReader();
    if(file) {
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        this.setState({previewImage: reader.result});
      });

      if(this.isTypeAuthorized(file.name)){
        const metadata = {contentType: mime.lookup(file.name)};
        this.setState({metadata: metadata});
      }
    }
  }

  isTypeAuthorized = filename => this.state.authorizedTypes.includes(mime.lookup(filename));

  cropImageHandler = () => {
    if(this.AvatarEditor) {
      this.AvatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageURL = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageURL,
          blob
        })
      });
    }
  }

  uploadAvatar = () => {
    const {storageRef, user, blob, metadata} = this.state;
    storageRef.child(`avatars/user/${user.uid}`).put(blob, metadata)
      .then(snapshot => {
        snapshot.ref.getDownloadURL()
        .then(downloadURL => {
          this.setState({uploadedAvatar: downloadURL}, () => {
            this.changeAvatar();
          });
        })
      })
  }

 
  changeAvatar = () => {
    this.state.userRef.updateProfile({
      photoURL: this.state.uploadedAvatar
    })
    .then(() => {
      // console.log('PHOTO updated');
      this.closeModal();
    })
    .catch(err => {
      console.error(err);
    })

    this.state.usersRef.child(this.state.userRef.uid)
    .update({avatar: this.state.uploadedAvatar})
    .then(() => {
      console.log('avatar updated in firebase');
    })
    .catch(err => {
      console.error(err);
    })
  }

  
  render() {
    const {user, modal, previewImage, croppedImage} = this.state;
    const {primaryColor} = this.props;
    // console.log(this.props.currentUser);
    // console.log(user.photoURL);
    return (
      <Grid style={{background: primaryColor}}>
        <Grid.Column>
          <Grid.Row style={{padding: '1.2em', margin: 0}}>
            <Header inverted floated="left" as="h2">
              <Icon name="address book"/>
              <Header.Content>
                GroupChat
              </Header.Content>
            </Header>
          
            <Header style={{padding: '0.25em'}} as="h4" inverted>
              <Dropdown 
                trigger={
                <span>
                  <Image src={user.photoURL} spaced="right" avatar/>
                  {user.displayName}
                </span>
                }
                options={this.dropdownOptions()}/>
            </Header>
          </Grid.Row>
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input 
                fluid type="file" 
                label="New Avatar"
                name="previewImage"
                onChange={this.changeHandler}
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {previewImage && (
                      <AvatarEditor 
                        image={previewImage}
                        ref={node => (this.AvatarEditor = node)}
                        width={120} height={120}
                        border={50} scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {croppedImage && (
                      <Image 
                        style={{margin: '3.5em'}}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && 
                <Button color="green" inverted onClick={this.uploadAvatar}>
                  <Icon name="save"/> Save
                </Button>
              }
              <Button color="blue" inverted onClick={this.cropImageHandler}>
                <Icon name="image"/> Preview Avatar
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove"/> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;