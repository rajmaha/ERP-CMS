import React from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp, FaEnvelope, FaLink } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './ShareButtons.css';

const ShareButtons = ({ url, title, description }) => {
  const shareUrl = url || window.location.href;
  const shareTitle = title || document.title;
  const shareDescription = description || '';

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailShare = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareDescription + '\n\n' + shareUrl)}`;
    window.location.href = emailUrl;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  return (
    <div className="share-buttons">
      <h4 className="share-title">Share this:</h4>
      <div className="share-buttons-grid">
        <button onClick={handleFacebookShare} className="share-btn facebook" title="Share on Facebook">
          <FaFacebookF />
        </button>
        <button onClick={handleTwitterShare} className="share-btn twitter" title="Share on Twitter">
          <FaTwitter />
        </button>
        <button onClick={handleLinkedInShare} className="share-btn linkedin" title="Share on LinkedIn">
          <FaLinkedinIn />
        </button>
        <button onClick={handleWhatsAppShare} className="share-btn whatsapp" title="Share on WhatsApp">
          <FaWhatsapp />
        </button>
        <button onClick={handleEmailShare} className="share-btn email" title="Share via Email">
          <FaEnvelope />
        </button>
        <button onClick={handleCopyLink} className="share-btn copy" title="Copy Link">
          <FaLink />
        </button>
      </div>
    </div>
  );
};

export default ShareButtons;
