import React from 'react';
import {Comment, Image} from 'semantic-ui-react';
import moment from 'moment';

const isMyMessage = (user, message) => {
  return message.user.id === user.uid ? 'my__message' : '';
}

const timePeriodCalc = timestamp => moment(timestamp).fromNow();

const isImage = (message) => {
  return message.hasOwnProperty('image') && !message.hasOwnProperty('content');
}

const Message = ({message, currentUser}) => {
  return (
    <Comment>
      <Comment.Avatar src={message.user.avatar} />
      <Comment.Content className={isMyMessage(currentUser, message)}>
        <Comment.Author as="a">{message.user.name}</Comment.Author>
        <Comment.Metadata>{timePeriodCalc(message.timestamp)}</Comment.Metadata>
        {isImage(message) 
          ? <Image src={message.image} className="message__image" /> 
          : <Comment.Text>{message.content}</Comment.Text>
        }
      </Comment.Content>
    </Comment>
  )
};

export default Message;