import React from 'react';
import bgvideo1 from '../../img/bgvideo.mp4';
import bgvideo2 from '../../img/bgvideo.webm';

const BgVideo = () => {
  return (
    <div className="bg-video">
      <video className="bg-video__content" autoPlay muted loop >
        <source src={bgvideo1} type="video/mp4"/>
        <source src={bgvideo2} type="video/webm" />
        Oops, Browser is not supported!
      </video>
    </div>
  )
};

export default BgVideo;