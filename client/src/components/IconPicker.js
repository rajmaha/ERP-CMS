import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './IconPicker.css';

const IconPicker = ({ value, onChange, label }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTab, setSelectedTab] = useState('icons'); // 'icons' or 'emojis'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (showPicker) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPicker]);

  // Font Awesome icon categories
  const iconCategories = {
    all: [
      'home', 'user', 'envelope', 'phone', 'map-marker-alt', 'calendar', 'clock', 'star',
      'heart', 'comment', 'file', 'folder', 'image', 'music', 'video', 'camera',
      'shopping-cart', 'credit-card', 'gift', 'bookmark', 'tag', 'search', 'filter', 'print',
      'download', 'upload', 'share', 'link', 'paperclip', 'edit', 'trash', 'check',
      'times', 'plus', 'minus', 'info-circle', 'question-circle', 'exclamation-circle', 'bell', 'flag',
      'cog', 'wrench', 'tools', 'code', 'terminal', 'database', 'server', 'chart-bar',
      'chart-line', 'chart-pie', 'table', 'list', 'th-large', 'th', 'bars', 'ellipsis-v',
      'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
      'lock', 'unlock', 'key', 'shield-alt', 'eye', 'eye-slash', 'thumbs-up', 'thumbs-down',
      'trophy', 'medal', 'award', 'fire', 'bolt', 'sun', 'moon', 'cloud',
      'briefcase', 'building', 'university', 'graduation-cap', 'book', 'pen', 'paint-brush', 'palette',
      'laptop', 'mobile-alt', 'tablet-alt', 'desktop', 'keyboard', 'mouse', 'headphones', 'microphone',
      'plane', 'car', 'bicycle', 'motorcycle', 'bus', 'train', 'ship', 'rocket',
      'pizza-slice', 'coffee', 'utensils', 'hamburger', 'ice-cream', 'wine-glass', 'beer', 'cookie'
    ],
    interface: ['home', 'search', 'cog', 'bell', 'user', 'bars', 'times', 'check', 'plus', 'minus', 'edit', 'trash', 'save', 'download', 'upload', 'share', 'link', 'eye', 'eye-slash'],
    communication: ['envelope', 'phone', 'comment', 'comments', 'message', 'inbox', 'paper-plane', 'at', 'fax', 'mail-bulk'],
    business: ['briefcase', 'building', 'chart-bar', 'chart-line', 'chart-pie', 'clipboard', 'dollar-sign', 'credit-card', 'hand-holding-usd', 'coins', 'wallet', 'receipt'],
    shopping: ['shopping-cart', 'shopping-bag', 'store', 'gift', 'tag', 'tags', 'barcode', 'percent', 'cash-register'],
    media: ['image', 'video', 'camera', 'music', 'film', 'play', 'pause', 'stop', 'forward', 'backward', 'volume-up', 'volume-mute'],
    files: ['file', 'folder', 'folder-open', 'file-alt', 'file-pdf', 'file-word', 'file-excel', 'file-image', 'file-archive', 'database'],
    arrows: ['arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right', 'angle-up', 'angle-down', 'angle-left', 'angle-right'],
    technology: ['laptop', 'desktop', 'mobile-alt', 'tablet-alt', 'keyboard', 'mouse', 'server', 'database', 'code', 'terminal', 'microchip', 'wifi'],
    travel: ['plane', 'car', 'bus', 'train', 'ship', 'bicycle', 'motorcycle', 'taxi', 'subway', 'helicopter', 'rocket'],
    food: ['pizza-slice', 'hamburger', 'coffee', 'utensils', 'wine-glass', 'beer', 'ice-cream', 'cookie', 'apple-alt', 'lemon', 'carrot', 'pepper-hot']
  };

  // Emoji categories
  const emojiCategories = {
    all: ['😀', '😃', '😄', '😁', '😊', '😍', '🥰', '😘', '😗', '😙', '😚', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '👋', '🤚', '✋', '🖐', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '⭐', '🌟', '✨', '💫', '🔥', '💥', '💯', '✅', '❌', '⚠️', '🚀', '🎯', '🎨', '🎭', '🎪', '🎬', '🏠', '🏢', '🏭', '🏗', '🏛', '⛪', '🕌', '🕍', '⛩', '🗼', '🗽', '🎡', '🎢', '🎠', '⛱', '🏖', '📱', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '📀', '💾', '💿', '📼', '📷', '📹', '📺', '📻', '✈️', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🏍', '🛵', '🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🍳', '🥞', '🧇', '🥐', '🍞', '🥖', '🥨', '🧀'],
    smileys: ['😀', '😃', '😄', '😁', '😊', '😍', '🥰', '😘', '😗', '😙', '😚', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
    gestures: ['👋', '🤚', '✋', '🖐', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    symbols: ['⭐', '🌟', '✨', '💫', '🔥', '💥', '💯', '✅', '❌', '⚠️', '🚀', '🎯', '🎨', '🎭', '🎪', '🎬'],
    buildings: ['🏠', '🏢', '🏭', '🏗', '🏛', '⛪', '🕌', '🕍', '⛩', '🗼', '🗽', '🎡', '🎢', '🎠', '⛱', '🏖'],
    technology: ['📱', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '📀', '💾', '💿', '📼', '📷', '📹', '📺', '📻'],
    vehicles: ['✈️', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🏍', '🛵'],
    food: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🍳', '🥞', '🧇', '🥐', '🍞', '🥖', '🥨', '🧀']
  };

  const fontAwesomeCategories = [
    { key: 'all', label: 'All', icon: '📦' },
    { key: 'interface', label: 'Interface', icon: '🖥️' },
    { key: 'communication', label: 'Communication', icon: '💬' },
    { key: 'business', label: 'Business', icon: '💼' },
    { key: 'shopping', label: 'Shopping', icon: '🛒' },
    { key: 'media', label: 'Media', icon: '🎵' },
    { key: 'files', label: 'Files', icon: '📁' },
    { key: 'arrows', label: 'Arrows', icon: '➡️' },
    { key: 'technology', label: 'Technology', icon: '💻' },
    { key: 'travel', label: 'Travel', icon: '✈️' },
    { key: 'food', label: 'Food', icon: '🍕' }
  ];

  const emojiCategoriesData = [
    { key: 'all', label: 'All', icon: '🎨' },
    { key: 'smileys', label: 'Smileys', icon: '😀' },
    { key: 'gestures', label: 'Gestures', icon: '👋' },
    { key: 'hearts', label: 'Hearts', icon: '❤️' },
    { key: 'symbols', label: 'Symbols', icon: '⭐' },
    { key: 'buildings', label: 'Buildings', icon: '🏠' },
    { key: 'technology', label: 'Tech', icon: '📱' },
    { key: 'vehicles', label: 'Vehicles', icon: '🚗' },
    { key: 'food', label: 'Food', icon: '🍕' }
  ];

  const handleSelectIcon = (icon) => {
    onChange(icon);
    setShowPicker(false);
    setSearchTerm('');
  };

  const isEmoji = (str) => {
    return /^[\p{Emoji}]+$/u.test(str);
  };

  const getCurrentIcons = () => {
    const source = selectedTab === 'emojis' ? emojiCategories : iconCategories;
    const icons = source[selectedCategory] || source.all;
    if (!searchTerm) return icons;
    return icons.filter(icon => 
      typeof icon === 'string' && icon.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredIcons = getCurrentIcons();
  const categories = selectedTab === 'emojis' ? emojiCategoriesData : fontAwesomeCategories;

  return (
    <div className="icon-picker-container">
      {label && <label className="icon-picker-label">{label}</label>}
      
      <div className="icon-picker-input" onClick={() => setShowPicker(!showPicker)}>
        {value ? (
          <span className="selected-icon-display">
            {isEmoji(value) ? (
              <span style={{ fontSize: '1.5rem' }}>{value}</span>
            ) : (
              <i className={`fas fa-${value}`} style={{ fontSize: '1.2rem' }}></i>
            )}
            <span className="icon-name">{value}</span>
          </span>
        ) : (
          <span className="placeholder">Click to select icon</span>
        )}
        <span className="dropdown-arrow">▼</span>
      </div>

      {showPicker && ReactDOM.createPortal(
        <>
          <div className="icon-picker-overlay" onClick={() => setShowPicker(false)}></div>
          <div className="icon-picker-dropdown-large">
            <div className="icon-picker-header">
              <h4>Select Icon</h4>
              <button type="button" className="close-modal-btn" onClick={() => setShowPicker(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="icon-picker-tabs">
              <button
                type="button"
                className={`tab-btn ${selectedTab === 'icons' ? 'active' : ''}`}
                onClick={() => { setSelectedTab('icons'); setSelectedCategory('all'); }}
              >
                <i className="fas fa-icons"></i> Font Awesome
              </button>
              <button
                type="button"
                className={`tab-btn ${selectedTab === 'emojis' ? 'active' : ''}`}
                onClick={() => { setSelectedTab('emojis'); setSelectedCategory('all'); }}
              >
                😀 Emojis
              </button>
            </div>

            <div className="icon-picker-search">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="icon-picker-body">
              <div className="icon-picker-sidebar">
                <h5>Categories</h5>
                {categories.map(cat => (
                  <button
                    key={cat.key}
                    type="button"
                    className={`category-btn ${selectedCategory === cat.key ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.key)}
                  >
                    <span className="category-icon">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              <div className="icon-picker-content">
                {filteredIcons.length > 0 ? (
                  <div className="icon-picker-grid-large">
                    {filteredIcons.map((icon, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`icon-option ${value === icon ? 'selected' : ''}`}
                        onClick={() => handleSelectIcon(icon)}
                        title={icon}
                      >
                        {isEmoji(icon) ? (
                          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                        ) : (
                          <i className={`fas fa-${icon}`}></i>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <p>No icons found for "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default IconPicker;
