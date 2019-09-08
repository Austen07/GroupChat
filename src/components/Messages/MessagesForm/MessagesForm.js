import React, {Component} from 'react';
import {Segment, Button, Input} from 'semantic-ui-react';
import uuidv4 from 'uuid/v4'; //generate random string

import {Picker, emojiIndex} from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

import FileModal from '../FileModal/FileModal';
import firebase from '../../../firebase';
import ProgressBar from '../ProgressBar/ProgressBar';

class MessagesForm extends Component {
  state = {
    message: '',
    currentGroup: this.props.currentGroup,
    currentUser: this.props.currentUser,
    loading: false,
    errors: [],
    modal: false,

    //file
    uploadState: '',
    uploadTask: null,
    storageRef: firebase.storage().ref(),
    progress: 0,

    emojiPicker: false
  }

  componentWillUnmount() {
    if(this.state.uploadTask !== null){
      this.state.uploadTask.cancel();
      this.setState({uploadTask: null});
    }
  }

  //handler
  changeHandler = event => {
    this.setState ({[event.target.name]: event.target.value});
  }

  togglePicker = () => {
    this.setState({emojiPicker: !this.state.emojiPicker});
  }

  addEmoji = emoji => {
    const oldMessage = this.state.message;
    const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} `);
    this.setState({message: newMessage, emojiPicker: false});
    //focus when input emoji
    setTimeout(() => this.messageInputRef.focus(), 0);
  }

  colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if(typeof emoji !== "undefined"){
        let unicode = emoji.native;
        if(typeof unicode !== "undefined"){
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  }

  shortcuts = event => {
    if(event.ctrlKey && event.keyCode === 13){
      this.sendMessage();
    }
  }

  //function
  sendMessage = () => {
    const {getMessagesRef} = this.props;
    const {message, currentGroup} = this.state;

    if(message) {
      this.setState({loading: true});
      getMessagesRef()
        .child(currentGroup.id)
        .push().set(this.createMessage())
        .then(() => {
          //store the created message in the firebase, reset the message of the state
          this.setState({loading: false, message: '', errors: []});
        })
        .catch((err) => {
          console.error(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          });
        });
    }else{
      this.setState({
        errors: this.state.errors.concat({message: 'Message is empty'})
      });
    }
  }

  createMessage = (fileURL = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.currentUser.uid,
        name: this.state.currentUser.displayName,
        avatar: this.state.currentUser.photoURL
      }
    };

    if(fileURL !== null){
      console.log("image");
      message['image'] = fileURL;
    }else{
      message['content'] = this.state.message;
      // console.log("text");
    }
    return message;
  }

  //modal when upload media
  openModal = () => this.setState({modal: true});
  closeModal = () => this.setState({modal: false});

  uploadFile = (file, metadata) => {
    // console.log(file, metadata);
    const groupId = this.state.currentGroup.id;
    const ref = this.props.getMessagesRef();
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState({
      uploadState: 'uploading',
      uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
    },
      () => {
        this.state.uploadTask.on('state_changed', snapshot => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          this.setState({progress: progress});
        },
        err => {
          console.error(err);
          this.setState({
            errors: this.state.errors.concat(err),
            uploadState: 'error',
            uploadTask: null
          });
        },
        () => {
          this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
            this.sendFileMessage(ref, groupId, downloadUrl);
          })
          .catch(err => {
            console.error(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: 'error',
              uploadTask: null
            });
          })
        }
        );//on
      }
    );
  }

  getPath = () => {
    if(this.props.isPrivateGroup){
      return `chat/private/${this.state.currentGroup.id}`;
    }else{
      return 'chat/public';
    }
  }

  sendFileMessage = (ref, groupId, fileURL) => {
    ref.child(groupId).push().set(this.createMessage(fileURL))
      .then(() => {
        this.setState({uploadState: 'done'});
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err)
        });
      });
  };

  render() {
    const {errors, message, loading, modal, progress, uploadState, emojiPicker} = this.state;
    return (
      <Segment className="message__form">
      {emojiPicker && (
        <Picker 
          set="twitter" className="emoji_picker" 
          title="Emoji" emoji="point_up" 
          onSelect={this.addEmoji} />
      )}
        <Input 
          fluid name="message"
          style={{marginBottom: '0.7em'}}
          label={
            <Button 
              icon={emojiPicker ? 'close' : 'add'} 
              content={emojiPicker ? 'Close' : null}
              onClick={this.togglePicker}
            />
          }
          labelPosition="left"
          placeholder="Write Message Here"
          onChange={this.changeHandler}
          value={message}
          className={
            errors.some(error => error.message.includes('message'))? 'error' : ''
          }
          ref={node => (this.messageInputRef = node)}
          onKeyDown={this.shortcuts}
        />
        <Button.Group icon widths="2">
          <Button 
            color="violet" content="Send Message (Ctrl + Enter)"
            labelPosition="left" icon="write"
            onClick={this.sendMessage}
            disabled={loading} />
          <Button 
            color="teal" content="Upload files"
            onClick={this.openModal}
            labelPosition="right" icon="cloud upload"
            disabled={uploadState === 'uploading'} />
        </Button.Group>
        <FileModal
            modal={modal}
            closeModal={this.closeModal}
            uploadFile={this.uploadFile}
        />
        <ProgressBar uploadState={uploadState} progress={progress} />
      </Segment>
    );
  }
}

export default MessagesForm;