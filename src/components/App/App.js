import React from 'react';
import {Grid} from 'semantic-ui-react';
import {connect} from 'react-redux';

import ColorPanel from '../ColorPanel/ColorPanel';
import SidePanel from '../SidePanel/SidePanel';
import Messages from '../Messages/Messages';
import MetaPanel from '../MetaPanel/MetaPanel';

import './App.css';

const App = ({currentUser, currentGroup, isPrivateGroup, userPosts, primaryColor, secondaryColor}) => (
  <Grid columns="equal" className="app" style={{background: secondaryColor}}>
    <ColorPanel
      key={currentUser && currentUser.name}
      currentUser={currentUser} />
    <SidePanel 
      key={currentUser && currentUser.uid}
      currentUser={currentUser}
      primaryColor={primaryColor}/>

    <Grid.Column style={{marginLeft: 320}}>
      <Messages 
        key={currentGroup && currentGroup.id}
        currentGroup={currentGroup}
        currentUser={currentUser}
        isPrivateGroup={isPrivateGroup} />
    </Grid.Column>

    <Grid.Column width={4}>
      <MetaPanel 
        key={currentGroup && currentGroup.name}
        userPosts={userPosts}
        currentGroup={currentGroup}
        isPrivateGroup={isPrivateGroup} />
    </Grid.Column>
  </Grid>
);

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentGroup: state.group.currentGroup,
  isPrivateGroup: state.group.isPrivateGroup,
  userPosts: state.group.userPosts,
  primaryColor: state.colors.primaryColor,
  secondaryColor: state.colors.secondaryColor

});

export default connect(mapStateToProps)(App);
