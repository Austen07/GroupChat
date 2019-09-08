import React, {Component} from 'react';

import {Modal, Input, Button, Icon} from 'semantic-ui-react';
import mime from 'mime-types';

class FileModal extends Component {
  state = {
    file: null,
    authorizedTypes: ['image/jpeg', 'image/png']
  }

  addFile = event => {
    const file = event.target.files[0];
    if(file) {
      this.setState({file});
    }
  }

  sendFile = () => {
    const {file} = this.state;
    const {uploadFile, closeModal} = this.props;
    if(file !== null) {
      if(this.isTypeAuthorized(file.name)){
        const metadata = {contentType: mime.lookup(file.name)};
        // console.log(metadata);
        uploadFile(file, metadata);
        closeModal();
        this.clearFile();
      }
    }
  }
  
  clearFile = () => this.setState({file: null});
  isTypeAuthorized = filename => this.state.authorizedTypes.includes(mime.lookup(filename));
  

  
  

  render() {
    const {modal, closeModal} = this.props;

    return (
      <Modal basic open={modal} onClose={closeModal}>
        <Modal.Header>
          Select File
        </Modal.Header>
        <Modal.Content onChange={this.addFile}>
          <Input 
            fluid label="jpg png"
            name="file" type="file"
          />
        </Modal.Content>
        <Modal.Actions>
          <Button color="green" inverted onClick={this.sendFile}>
            <Icon name="checkmark" />Send
          </Button>
          <Button color="red" inverted onClick={closeModal}>
            <Icon name="remove" />Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default FileModal;