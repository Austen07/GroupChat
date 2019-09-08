import React, {Component} from 'react';
import {Menu, Icon, Modal, Form, Input, Button, Label} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setCurrentGroup, setPrivateGroup} from '../../../store/actions/index';
import firebase from '../../../firebase';


class Groups extends Component {
  state = {
    user: this.props.currentUser,
    group: null,
    groups: [],
    groupName: '',
    groupDetail: '',
    groupsRef: firebase.database().ref('groups'),
    messagesRef: firebase.database().ref('message'),
    notifications: [],
    activeGroupId: '',
    modal: false,
    firstLoad: true
  }

  componentDidMount() {
    this.addListeners();
  }
  componentWillUnMount() {
    this.removeListeners();

  }
  addListeners = () => {
    let loadedGroups = [];
    //listens for data changes and read data
    this.state.groupsRef.on('child_added', snapshot => {
      loadedGroups.push(snapshot.val());
      this.setState({groups: loadedGroups}, () => this.setFirstGroup());
      this.addNotificationListener(snapshot.key);
    });
  };

  addNotificationListener = groupId => {
    this.state.messagesRef.child(groupId).on('value', snapshot => {
      if(this.state.group){
        this.notificationHandler(groupId, this.state.group.id, this.state.notifications, snapshot);
      }
    });
  }

  removeListeners = () => {
    this.state.groupsRef.off();
    this.state.groups.forEach(group => {
      this.state.messagesRef.child(group.id).off();
    })
  };

  openModal = () => this.setState({modal: true});
  closeModal = () => this.setState({modal: false});

  //handler
  submitHandler = event => {
    event.preventDefault();
    if(this.isFormValid(this.state)){
      this.addGroup();
    }
  }

  changeHandler = event => {
    this.setState({[event.target.name] : event.target.value});
  };

  //functions
  isFormValid = ({groupName, groupDetail}) => {
    return groupName && groupDetail;
  }

  addGroup = () => {
    const {groupName, groupDetail, groupsRef, user} = this.state;
    const key = groupsRef.push().key;

    const newGroup = {
      id: key,
      name: groupName,
      detail: groupDetail,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    };

    groupsRef.child(key).update(newGroup)
      .then(() => {
        this.setState({groupName: '', groupDetail: ''});
        this.closeModal();
        console.log("group created and added");
      })
      .catch((err) => {
        console.error(err);
      })
  }

  displayGroups = groups => (
    (groups && groups.length > 0) && groups.map(group => (
      <Menu.Item
        key={group.id}
        name={group.name}
        style={{spacity: 0.7}}
        onClick={() => this.changeGroup(group)}
        active={group.id === this.state.activeGroupId}
      >
      {this.getNotificationCount(group) && 
        (<Label color="red">{this.getNotificationCount(group)}</Label>)
      }
      {group.name}
      </Menu.Item>
    ))
  );
  
  //switch in different groups 
  //store the current group into global store
  changeGroup = group => {
    this.setActiveGroup(group);
    this.clearNotifications();
    this.props.setCurrentGroup(group);
    this.props.setPrivateGroup(false);

    this.setState({group: group});
  }

  //load first group to the screen by default
  setFirstGroup = () => {
    if(this.state.firstLoad && this.state.groups.length > 0){
      const firstGroup = this.state.groups[0];
      this.props.setCurrentGroup(firstGroup);
      this.setActiveGroup(firstGroup);
      this.setState({group: firstGroup});
    }

    this.setState({firstLoad: false});
  };

  setActiveGroup = group => {
    this.setState({activeGroupId: group.id});
  };


  /* notification */
  //snapshot is the messages-info in group groupId
  notificationHandler = (groupId, currentGroupId, notifications, snapshot) => {
    let lastTotal = 0;
    let index = notifications.findIndex(notification => notification.id === groupId);
  
    if(index === -1){
      notifications.push({
        id: groupId,
        total: snapshot.numChildren(),
        lastTotal: snapshot.numChildren(),
        count: 0
      });
    }else{
      console.log("else");
      if(groupId !== currentGroupId){
        lastTotal = notifications[index].total;

        if(snapshot.numChildren() - lastTotal > 0){
          notifications[index].count = snapshot.numChildren() - lastTotal;
        }
      }
      notifications[index].lastTotal = snapshot.numChildren();
    }

    this.setState({notifications});
  }

 
  getNotificationCount = group => {
    let count = 0;
    this.state.notifications.forEach(notification => {
      if(notification.id === group.id){
        count = notification.count;
      }
    });

    if(count > 0) return count;
  }


  clearNotifications = () => {
    let index = this.state.notifications.findIndex(notification => notification.id === this.state.group.id);

    if(index !== -1){
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[index].lastTotal;
      updatedNotifications[index].count = 0;
      this.setState({notifications: updatedNotifications});
    }
  }



  render() {
    const {groups, modal} = this.state;
    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="bullhorn"/>
              GROUPS
            </span> {' '}
            ({groups === undefined ? 0 : groups.length}) <Icon name="add" onClick={this.openModal}/>
          </Menu.Item>
          {this.displayGroups(groups)}
        </Menu.Menu>

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Create A Group</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.submitHandler}>
              <Form.Field>
                <Input 
                  fluid label="Group Name"
                  name="groupName" onChange={this.changeHandler}
                />
              </Form.Field>

              <Form.Field>
                <Input 
                  fluid label="About Group"
                  name="groupDetail" onChange={this.changeHandler}
                />
              </Form.Field>

            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.submitHandler}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

export default connect(null, {setCurrentGroup, setPrivateGroup})(Groups);