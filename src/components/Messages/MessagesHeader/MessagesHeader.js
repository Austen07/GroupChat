import React, {Component} from 'react';
import {Header, Segment, Input, Icon} from 'semantic-ui-react';

class MessagesHeader extends Component {

  render() {
    const {groupName, numberOfUsers, searchHandler, searchLoading, isPrivateGroup, addFavorite, isGroupFavorite} = this.props;

    return (
      <Segment clearing>
        <Header 
          fluid="true" as="h2"
          floated="left" style={{marginBottom: 0}}
        >
        <span>
          {groupName} &nbsp;
          {isPrivateGroup 
            ? <Icon name={'paper plane'} color="green"/> 
            : <Icon name={isGroupFavorite ? 'heart' : 'heart outline'} color="red" onClick={addFavorite} />}
        </span>
        <Header.Subheader>{numberOfUsers}</Header.Subheader>
        </Header>

        <Header floated="right">
          <Input 
            size="mini" icon="search" 
            name="seachTerm" placeholder="Search Messages"
            onChange={searchHandler}
            loading={searchLoading}
          />
        </Header>
      </Segment>
    );
  }
}


export default MessagesHeader;