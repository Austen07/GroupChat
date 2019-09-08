import React, {Component} from 'react';
import {Menu, Icon} from 'semantic-ui-react';
import {connect} from 'react-redux';

import {setCurrentGroup, setPrivateGroup} from '../../../store/actions/index';
import firebase from '../../../firebase';

class Favorite extends Component {
  state = {
    activeGroupId: '',
    favoGroups: [],
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users')
  }

  componentDidMount() {
    if(this.state.user){
      this.addListeners(this.state.user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = userUId => {
    this.state.usersRef
      .child(userUId).child('favorite')
      .on('child_added', snapshot => {
        const favorites = {id: snapshot.key, ...snapshot.val()};
        this.setState({favoGroups: [...this.state.favoGroups, favorites]});
      });

    this.state.usersRef
      .child(userUId).child('favorite')
      .on('child_removed', snapshot => {
        const removedGroup = {id: snapshot.key, ...snapshot.val()};
        const leftFavoGroups = this.state.favoGroups.filter(group => {
          return group.id !== removedGroup.id;
        });
        this.setState({favoGroups: leftFavoGroups});
      });
  }

  removeListeners = () => {
    this.state.usersRef.child(this.state.user.uid).child('favorite').off();
  }
 
  setActiveGroup = group => {
    this.setState({activeGroupId: group.id});
  };

  changeGroup = group => {
    this.setActiveGroup(group);
    this.props.setCurrentGroup(group);
    this.props.setPrivateGroup(false);
  }


  displayGroups = favoGroups => (
    (favoGroups && favoGroups.length > 0) && 
    favoGroups.map(group => (
      <Menu.Item
        key={group.id}
        name={group.name}
        style={{spacity: 0.7}}
        onClick={() => this.changeGroup(group)}
        active={group.id === this.state.activeGroupId}
      >
      {group.name}
      </Menu.Item>
    ))
  );

  render() {
    const {favoGroups} = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="heart outline"/>
            GROUPS
          </span> {' '}
          ({favoGroups.length})
        </Menu.Item>
        {this.displayGroups(favoGroups)}
      </Menu.Menu>
    );
  }
}

export default connect(null, {setCurrentGroup, setPrivateGroup})(Favorite);