import React, {Component} from 'react';
import {Segment, Comment} from 'semantic-ui-react';
import { connect } from "react-redux";

import {setUserPosts} from '../../store/actions/index';
import firebase from '../../firebase';
import MessagesHeader from './MessagesHeader/MessagesHeader';
import MessagesForm from './MessagesForm/MessagesForm';
import Message from './Message/Message';


class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref('message'),
    messages: [], 
    messagesLoading: true,

    currentGroup: this.props.currentGroup,
    currentUser: this.props.currentUser,
    numberOfUsers: '',

    isGroupFavorite: false,
    usersRef: firebase.database().ref('users'),

    isPrivateGroup: this.props.isPrivateGroup,
    privateMessagesRef: firebase.database().ref('privateMessages'),
    
    searchHandler: '',
    searchLoading: false,
    searchResults: [],

    listeners: []
  }

  componentDidMount() {
    const {currentGroup, currentUser, listeners} =  this.state;
    if(currentGroup && currentUser){
      this.removeListeners(listeners);

      this.addMessageListener(currentGroup.id);
      this.addFavoritesListener(currentGroup.id, currentUser.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.messagesEnd) {
      this.messagesEnd.scrollIntoView({behavior: 'smooth'})
    }
  }

  //listeners
  addMessageListener = groupId => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(groupId).on('child_added', snapshot => {
      loadedMessages.push(snapshot.val());
      // console.log(loadedMessage);
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      });
      this.countUsers(loadedMessages);
      this.countUserPosts(loadedMessages);
    });

    this.addToListeners(groupId, ref, 'child_added');
  }

  addFavoritesListener = (groupId, userUId) => {
    this.state.usersRef
      .child(userUId).child('favorite')
      .once('value')
      .then(data => {
        if(data.val() !== null){
          const groupIds = Object.keys(data.val());
          const hasBeenAdded = groupIds.includes(groupId);
          this.setState({isGroupFavorite: hasBeenAdded})
        }
      })
  }


  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex(listener => {
      return listener.id === id && listener.ref === ref && listener.event === event;
    });

    if(index === -1) {
      const newListeners = {id, ref, event};
      this.setState({listeners: this.state.listeners.concat(newListeners)});
    }
  }
  
  removeListeners = listeners => {
    listeners.forEach(listener => {
      listener.ref.child(listener.id).off(listener.event);
    });
  }


  countUsers = (messages) => {
    const {isPrivateGroup} = this.state;
    const users = messages.reduce((set, message) => {
      if(!set.includes(message.user.name)){
        set.push(message.user.name);
      }
      return set;
    }, []);
    const displayCount = users.length === 1 ? `${users.length} Member`: `${users.length} Members`;
    if(!isPrivateGroup){
      this.setState({numberOfUsers: displayCount});
    }
  }

  countUserPosts = messages => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        };
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts);
  };

  displayMessage = messages => (
    messages.length > 0 && messages.map(message => (
      <Message 
        key={message.timestamp}
        message={message}
        currentUser={this.state.currentUser}
      />
    ))
  );
  
  displayGroupName = currentGroup => currentGroup ? `${currentGroup.name.toUpperCase()}` : '';

  searchHandler = event => {
    this.setState({
      searchTerm: event.target.value,
      searchLoading: true
    }, () => this.searchMessages());
  }

  searchMessages = () => {
    const groupMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, 'gi');
    const searchResults = groupMessages.reduce((set, message) => {
      if(message.content && (message.content.match(regex) || message.user.name.match(regex))){
        set.push(message);
      }
      return set;
    }, []);
    this.setState({searchResults});
    setTimeout(() => this.setState({searchLoading:false}), 400);
  }

  //private message or public message
  getMessagesRef = () => {
    const {messagesRef, privateMessagesRef, isPrivateGroup} = this.state;
    return isPrivateGroup ? privateMessagesRef : messagesRef;
  }


  addFavorite = () => {
    this.setState(prevState => ({
      isGroupFavorite: !prevState.isGroupFavorite
    }), () => this.favoriteGroup());
  }

  favoriteGroup = () => {
    if(this.state.isGroupFavorite) {
      this.state.usersRef
        .child(`${this.state.currentUser.uid}/favorite`)
        .update({
          [this.state.currentGroup.id] : {
            name: this.state.currentGroup.name,
            details: this.state.currentGroup.detail,
            createdBy: {
              name: this.state.currentGroup.createdBy.name,
              avatar: this.state.currentGroup.createdBy.avatar
            }
          }
        });
    }else{
      this.state.usersRef
        .child(`${this.state.currentUser.uid}/favorite`)
        .child(this.state.currentGroup.id)
        .remove(err => {
          if(err !== null) console.error(err);
        });
    }
  }
  
  render() {
    const {messagesRef, messages, currentGroup, currentUser, numberOfUsers, 
           searchTerm, searchResults, searchLoading, isPrivateGroup, isGroupFavorite} = this.state;

    return (
      <React.Fragment>
        <MessagesHeader 
          groupName={this.displayGroupName(currentGroup)}
          numberOfUsers={numberOfUsers}
          searchHandler={this.searchHandler}
          searchLoading={searchLoading}
          isPrivateGroup={isPrivateGroup}
          isGroupFavorite={isGroupFavorite}
          addFavorite={this.addFavorite}
        />

        <Segment>
          <Comment.Group className="messages">
            {searchTerm 
              ? this.displayMessage(searchResults)
              : this.displayMessage(messages)
            }
            <div ref={node => (this.messagesEnd = node)}></div>
          </Comment.Group>
        </Segment>

        <MessagesForm 
          messagesRef={messagesRef}
          currentGroup={currentGroup}
          currentUser={currentUser}
          isPrivateGroup={isPrivateGroup}
          getMessagesRef={this.getMessagesRef} />
      </React.Fragment>
    );
  }
}

export default connect(null, {setUserPosts})(Messages);