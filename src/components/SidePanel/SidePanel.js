import React, {Component} from 'react';
import {Menu} from 'semantic-ui-react';

import UserPanel from './UserPanel/UserPanel';
import Groups from './Groups/Groups';
import DirectMessages from './DirectMessages/DirectMessages';
import Favorite from './Favorite/Favorite';


class SidePanel extends Component {
  render() {
    const {currentUser, primaryColor} = this.props;
    return (
      <Menu 
        size="large" inverted fixed="left"
        vertical style={{background: primaryColor, fontSize: '1.2rem'}}
      >
        <UserPanel primaryColor={primaryColor} currentUser={currentUser} />
        <Favorite currentUser={currentUser} />
        <Groups currentUser={currentUser} />
        <DirectMessages currentUser={currentUser} />
      </Menu>
    );
  }
}

export default SidePanel;