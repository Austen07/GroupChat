import React, {Component} from 'react';
import {Menu, Icon} from 'semantic-ui-react';
import {connect} from 'react-redux';

import {setCurrentGroup, setPrivateGroup} from '../../../store/actions/index';
import firebase from '../../../firebase';


class DirectMessages extends Component {
  state = {
    users: [],
    currentUser: this.props.currentUser,
    usersRef: firebase.database().ref('users'),
    
    connectedRef: firebase.database().ref('.info/connected'),
    presenceRef: firebase.database().ref('presence'),

    activeGroup: ''
  }

  componentDidMount() {
    if(this.state.currentUser) {
      this.addListeners(this.state.currentUser.uid);
    }
  }
  
  componentWillUnmount() {
    this.removeListeners();
  } 


  addListeners = currentUserUId => {
    let loadedUsers = [];
    this.state.usersRef.on("child_added", snapshot => {
      if(currentUserUId !== snapshot.key) {
        let user = snapshot.val();
        user['uid'] = snapshot.key;
        user['status'] = 'offline';

        loadedUsers.push(user);
        this.setState({users: loadedUsers});
      }
    });

    //detect connection state
    // https://firebase.google.com/docs/database/web/offline-capabilities
    this.state.connectedRef.on("value", snapshot => {
      //if connected
      if(snapshot.val() === true){
        const ref = this.state.presenceRef.child(currentUserUId);
        ref.set(true);
        ref.onDisconnect().remove(err => {
          if(err !== null){
            console.error('could not establish onDisconnect event: ', err);
          }
        });
      }
    });

    this.state.presenceRef.on("child_added", snapshot => {
      if(currentUserUId !== snapshot.key) {
        this.updateStatusToUser(snapshot.key);
      }
    });

    this.state.presenceRef.on("child_removed", snapshot => {
      if(currentUserUId !== snapshot.key) {
        this.updateStatusToUser(snapshot.key, false);
      }
    });
  }

  removeListeners = () => {
    this.state.usersRef.off();
    this.state.presenceRef.off();
    this.state.connectedRef.off();
  }


  updateStatusToUser =  (userId, connected = true) => {
    const updatedUsers = this.state.users.reduce((set, user) => {
      if(userId === user.uid){
        user['status'] = `${connected ? 'online' : 'offline'}`;
      }
      return set.concat(user);
    }, []);

    this.setState({users: updatedUsers});
  }

  isUserOnline = user => user.status === 'online';

  changeGroup = user => {
    const groupId = this.createUniqueGroupId(user.uid);
    const groupData = {
      id: groupId,
      name: user.name
    };
    this.props.setCurrentGroup(groupData);
    this.props.setPrivateGroup(true);
    this.setActiveGroup(user.uid);
  }

  createUniqueGroupId = userUId => {
    const currentUserUID = this.state.currentUser.uid;
    return userUId < currentUserUID 
      ? `${userUId} / ${currentUserUID}`
      : `${currentUserUID} / ${userUId} `;
  }

  setActiveGroup = userUId => {
    this.setState({activeGroup: userUId});
  }



  render() {
    const {users, activeGroup} = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MESSAGES
          </span>{' '}
          ({users.length})
        </Menu.Item>
        {users.map(user => (
          <Menu.Item 
            key={user.uid}
            active={activeGroup === user.uid}
            onClick={() => this.changeGroup(user)}
            style={{opacity: 0.7}} 
          >
            <Icon name="circle" color={this.isUserOnline(user) ? 'green' : 'red'} />
            @ {user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

export default connect(null, {setCurrentGroup, setPrivateGroup})(DirectMessages);