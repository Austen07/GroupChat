import React, {Component} from 'react';
import {Segment, Accordion, Header, Icon, Image, List} from 'semantic-ui-react';


class MetaPanel extends Component {
  state = {
    currentGroup: this.props.currentGroup,
    activeIndex: 0,
    isPrivateGroup: this.props.isPrivateGroup
  }

  setActive = (event, titleProps) => {
    const {index} = titleProps;
    const {activeIndex} = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({activeIndex: newIndex});
  }

  displayTopPosts = userPosts => (
    Object.entries(userPosts).sort((a, b) => b[1] - a[1])
      .map(([key, val], i) => (
        <List.Item key={i}>
          <Image avatar src={val.avatar} />
          <List.Content>
            <List.Header as="a">{key}</List.Header>
            <List.Description>{this.format(val.count)}</List.Description>
          </List.Content>
        </List.Item>
      ))
      .slice(0, 3)
  )

  format = count => count > 1 ? `${count} posts` : `${count} post`;

  render() {
    const {activeIndex, isPrivateGroup, currentGroup} = this.state;
    const {userPosts} = this.props;

    if(isPrivateGroup) return null;

    return (
      <Segment loading={!currentGroup}>
        <Header as="h3" attached="top">
          Welcome to {currentGroup && currentGroup.name.toUpperCase()}
        </Header>
        <Accordion styled attached="true">
          <Accordion.Title 
            active={activeIndex === 0} 
            index={0}
            onClick={this.setActive}
          >
            <Icon name="dropdown" />
            <Icon name="anchor" />
              About Group
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            {currentGroup && currentGroup.detail}
          </Accordion.Content>

          <Accordion.Title 
            active={activeIndex === 1} 
            index={1}
            onClick={this.setActive}
          >
            <Icon name="dropdown" />
            <Icon name="users" />
              Top Active Members
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            <List> 
              {userPosts && this.displayTopPosts(userPosts)}
            </List>
          </Accordion.Content>

          <Accordion.Title 
            active={activeIndex === 2} 
            index={2}
            onClick={this.setActive}
          >
            <Icon name="dropdown" />
            <Icon name="magic" />
              Created By
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <Header>
              <Image src={currentGroup && currentGroup.createdBy.avatar} circular />
              {currentGroup && currentGroup.createdBy.name}
            </Header>
          </Accordion.Content>

        </Accordion>
      </Segment>
    );
  }
}

export default MetaPanel;