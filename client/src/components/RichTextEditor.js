import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [imageOptions, setImageOptions] = useState({
    width: 100,
    alignment: 'center',
    position: 'block'
  });
  const [imageNaturalWidth, setImageNaturalWidth] = useState(0);
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleIconSelect = (icon) => {
    const isEmoji = /^[\p{Emoji}]+$/u.test(icon);
    const iconHtml = isEmoji 
      ? `<span class="editor-icon-emoji">${icon}</span>&nbsp;` 
      : `<i class="fas fa-${icon} editor-icon-fa"></i>&nbsp;`;
    
    execCommand('insertHTML', iconHtml);
    setShowIconPicker(false);
  };

  const handleImageSelect = (imageUrl) => {
    // Show image options modal
    setShowImagePicker(false);
    setSelectedImageUrl(imageUrl);
    setShowImageOptions(true);
  };

  const insertImageWithOptions = () => {
    const { width, alignment, position } = imageOptions;
    
    let alignStyle = '';
    
    if (position === 'inline') {
      // Inline with text wrapping
      if (alignment === 'left') {
        alignStyle = 'float: left; margin: 0.5rem 1rem 0.5rem 0;';
      } else if (alignment === 'right') {
        alignStyle = 'float: right; margin: 0.5rem 0 0.5rem 1rem;';
      } else {
        alignStyle = 'display: inline-block; margin: 0.5rem; vertical-align: middle;';
      }
    } else {
      // Block level
      if (alignment === 'center') {
        alignStyle = 'display: block; margin: 1rem auto;';
      } else if (alignment === 'left') {
        alignStyle = 'display: block; margin: 1rem 0;';
      } else {
        alignStyle = 'display: block; margin: 1rem 0; margin-left: auto;';
      }
    }
    
    const imgHtml = `<img src="${selectedImageUrl}" alt="Image" style="max-width: 100%; width: ${width}%; height: auto; border-radius: 8px; ${alignStyle}" />${position === 'block' ? '<br clear="all"/>' : ''}`;
    execCommand('insertHTML', imgHtml);
    
    // Reset states
    setShowImageOptions(false);
    setSelectedImageUrl('');
    setImageOptions({ width: 100, alignment: 'center', position: 'block' });
  };

  const toggleSourceView = () => {
    if (!showSourceCode) {
      // Switch to source view
      setSourceCode(editorRef.current?.innerHTML || '');
      setShowSourceCode(true);
    } else {
      // Switch back to visual editor
      if (editorRef.current) {
        editorRef.current.innerHTML = sourceCode;
        onChange(sourceCode);
      }
      setShowSourceCode(false);
    }
  };

  const handleSourceCodeChange = (e) => {
    setSourceCode(e.target.value);
  };

  const applyColor = (color) => {
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const commonColors = [
    '#000000', '#424242', '#636363', '#9C9C94', '#CEC6CE', '#EFEFEF', '#F7F7F7', '#FFFFFF',
    '#FF0000', '#FF9C00', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9C00FF', '#FF00FF',
    '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#D9D2E9', '#EAD1DC',
    '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#B4A7D6', '#D5A6BD',
    '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#8E7CC3', '#C27BA0',
    '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#674EA7', '#A64D79',
    '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#351C75', '#741B47',
    '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#20124D', '#4C1130'
  ];

  return (
    <div className="rich-text-editor-wrapper">
      <div className="editor-toolbar">
        <button type="button" onClick={toggleSourceView} title="Source Code" className={showSourceCode ? 'active' : ''}>
          <i className="fas fa-code"></i>
        </button>

        <span className="toolbar-divider"></span>

        <button type="button" onClick={() => execCommand('bold')} title="Bold" disabled={showSourceCode}>
          <i className="fas fa-bold"></i>
        </button>
        <button type="button" onClick={() => execCommand('italic')} title="Italic" disabled={showSourceCode}>
          <i className="fas fa-italic"></i>
        </button>
        <button type="button" onClick={() => execCommand('underline')} title="Underline" disabled={showSourceCode}>
          <i className="fas fa-underline"></i>
        </button>
        <button type="button" onClick={() => execCommand('strikeThrough')} title="Strike" disabled={showSourceCode}>
          <i className="fas fa-strikethrough"></i>
        </button>
        
        <span className="toolbar-divider"></span>
        
        <button type="button" onClick={() => execCommand('insertUnorderedList')} title="Bullet List" disabled={showSourceCode}>
          <i className="fas fa-list-ul"></i>
        </button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} title="Numbered List" disabled={showSourceCode}>
          <i className="fas fa-list-ol"></i>
        </button>
        
        <span className="toolbar-divider"></span>
        
        <button type="button" onClick={() => execCommand('justifyLeft')} title="Align Left" disabled={showSourceCode}>
          <i className="fas fa-align-left"></i>
        </button>
        <button type="button" onClick={() => execCommand('justifyCenter')} title="Align Center" disabled={showSourceCode}>
          <i className="fas fa-align-center"></i>
        </button>
        <button type="button" onClick={() => execCommand('justifyRight')} title="Align Right" disabled={showSourceCode}>
          <i className="fas fa-align-right"></i>
        </button>
        
        <span className="toolbar-divider"></span>
        
        <button type="button" onClick={() => execCommand('formatBlock', 'h2')} title="Heading 2" disabled={showSourceCode}>
          <strong>H2</strong>
        </button>
        <button type="button" onClick={() => execCommand('formatBlock', 'h3')} title="Heading 3" disabled={showSourceCode}>
          <strong>H3</strong>
        </button>
        <button type="button" onClick={() => execCommand('formatBlock', 'p')} title="Paragraph" disabled={showSourceCode}>
          <strong>P</strong>
        </button>
        
        <span className="toolbar-divider"></span>
        
        <button type="button" onClick={() => {
          const url = prompt('Enter link URL:');
          if (url) execCommand('createLink', url);
        }} title="Insert Link" disabled={showSourceCode}>
          <i className="fas fa-link"></i>
        </button>
        
        <button type="button" onClick={() => setShowImagePicker(true)} title="Insert Image" className="toolbar-btn-highlight" disabled={showSourceCode}>
          <i className="fas fa-image"></i>
        </button>
        
        <button type="button" onClick={() => setShowIconPicker(true)} title="Insert Icon" className="toolbar-btn-highlight" disabled={showSourceCode}>
          <i className="fas fa-icons"></i>
        </button>
        
        <span className="toolbar-divider"></span>
        
        <button type="button" onClick={() => execCommand('undo')} title="Undo" disabled={showSourceCode}>
          <i className="fas fa-undo"></i>
        </button>
        <button type="button" onClick={() => execCommand('redo')} title="Redo" disabled={showSourceCode}>
          <i className="fas fa-redo"></i>
        </button>

        <div className="color-picker-wrapper">
          <button 
            type="button" 
            onClick={() => setShowColorPicker(!showColorPicker)} 
            title="Text Color" 
            disabled={showSourceCode}
            className="color-btn"
          >
            <i className="fas fa-palette"></i>
            <span className="color-preview" style={{ backgroundColor: selectedColor }}></span>
          </button>
          
          {showColorPicker && (
            <div className="color-picker-dropdown">
              <div className="color-grid">
                {commonColors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`color-option ${selectedColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color);
                      applyColor(color);
                    }}
                    title={color}
                  />
                ))}
              </div>
              <div className="custom-color-input">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => {
                    setSelectedColor(e.target.value);
                    applyColor(e.target.value);
                  }}
                  className="custom-color-picker"
                />
                <span>Custom Color</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSourceCode ? (
        <textarea
          className="editor-source-code"
          value={sourceCode}
          onChange={handleSourceCodeChange}
          placeholder="Edit HTML source code..."
        />
      ) : (
        <div
          ref={editorRef}
          className="editor-content"
          contentEditable={true}
          onInput={handleInput}
          data-placeholder={placeholder || 'Start typing...'}
        />
      )}

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <IconPickerModal onSelect={handleIconSelect} onClose={() => setShowIconPicker(false)} />
      )}

      {/* Image Picker Modal */}
      {showImagePicker && (
        <ImagePickerModal onSelect={handleImageSelect} onClose={() => setShowImagePicker(false)} />
      )}

      {/* Image Options Modal */}
      {showImageOptions && selectedImageUrl && (
        <>
          <div className="picker-modal-overlay" onClick={() => setShowImageOptions(false)}></div>
          <div className="image-options-modal">
            <div className="picker-modal-header">
              <h3>Image Options</h3>
              <button type="button" className="picker-close-btn" onClick={() => setShowImageOptions(false)}>✕</button>
            </div>

            <div className="image-options-content">
              <div className="image-preview">
                <img 
                  src={selectedImageUrl} 
                  alt="Preview" 
                  style={{ 
                    width: `${imageOptions.width}%`, 
                    maxWidth: '100%',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onLoad={(e) => {
                    setImageNaturalWidth(e.target.naturalWidth);
                  }}
                />
                <div className="image-dimensions">
                  <span className="dimensions-text">
                    {imageNaturalWidth > 0 && `Width: ${Math.round((imageOptions.width / 100) * imageNaturalWidth)}px (${imageOptions.width}%)`}
                  </span>
                </div>
              </div>

              <div className="image-options-controls">
                <div className="option-group">
                  <label>
                    Image Width: {imageNaturalWidth > 0 ? `${Math.round((imageOptions.width / 100) * imageNaturalWidth)}px` : `${imageOptions.width}%`}
                  </label>
                  <input 
                    type="range" 
                    min="20" 
                    max="100" 
                    step="5"
                    value={imageOptions.width}
                    onChange={(e) => {
                      const newWidth = parseInt(e.target.value);
                      setImageOptions(prev => ({ ...prev, width: newWidth }));
                    }}
                    className="width-slider"
                  />
                  <div className="width-presets">
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        setImageOptions(prev => ({ ...prev, width: 25 }));
                      }} 
                      className="preset-btn"
                    >
                      25%
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        setImageOptions(prev => ({ ...prev, width: 50 }));
                      }} 
                      className="preset-btn"
                    >
                      50%
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        setImageOptions(prev => ({ ...prev, width: 75 }));
                      }} 
                      className="preset-btn"
                    >
                      75%
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        setImageOptions(prev => ({ ...prev, width: 100 }));
                      }} 
                      className="preset-btn"
                    >
                      100%
                    </button>
                  </div>
                </div>

                <div className="option-group">
                  <label>Image Position</label>
                  <div className="position-buttons">
                    <button 
                      type="button" 
                      className={`position-btn ${imageOptions.position === 'block' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setImageOptions(prev => ({ ...prev, position: 'block' }));
                      }}
                    >
                      <i className="fas fa-square"></i> Block
                      <small>Image on its own line</small>
                    </button>
                    <button 
                      type="button" 
                      className={`position-btn ${imageOptions.position === 'inline' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setImageOptions(prev => ({ ...prev, position: 'inline' }));
                      }}
                    >
                      <i className="fas fa-align-justify"></i> Inline
                      <small>Text wraps around image</small>
                    </button>
                  </div>
                </div>

                <div className="option-group">
                  <label>Alignment</label>
                  <div className="alignment-buttons">
                    <button 
                      type="button" 
                      className={`alignment-btn ${imageOptions.alignment === 'left' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setImageOptions(prev => ({ ...prev, alignment: 'left' }));
                      }}
                    >
                      <i className="fas fa-align-left"></i> Left
                    </button>
                    <button 
                      type="button" 
                      className={`alignment-btn ${imageOptions.alignment === 'center' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setImageOptions(prev => ({ ...prev, alignment: 'center' }));
                      }}
                    >
                      <i className="fas fa-align-center"></i> Center
                    </button>
                    <button 
                      type="button" 
                      className={`alignment-btn ${imageOptions.alignment === 'right' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setImageOptions(prev => ({ ...prev, alignment: 'right' }));
                      }}
                    >
                      <i className="fas fa-align-right"></i> Right
                    </button>
                  </div>
                </div>

                <div className="option-actions">
                  <button type="button" onClick={insertImageWithOptions} className="btn btn-primary">
                    <i className="fas fa-check"></i> Insert Image
                  </button>
                  <button type="button" onClick={() => {
                    setShowImageOptions(false);
                    setSelectedImageUrl('');
                    setImageOptions({ width: 100, alignment: 'center', position: 'block' });
                  }} className="btn btn-secondary">
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Icon Picker Modal Component
const IconPickerModal = ({ onSelect, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('icons');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const iconCategories = {
    all: [
      'home', 'user', 'envelope', 'phone', 'star', 'heart', 'check', 'times', 'plus', 'minus', 'edit', 'trash', 'search', 'cog', 'bell', 'calendar', 'clock', 'image', 'video', 'music', 'camera',
      'map-marker-alt', 'location-arrow', 'globe', 'wifi', 'bluetooth', 'rss', 'battery-full', 'signal',
      'file', 'folder', 'save', 'download', 'upload', 'paperclip', 'link', 'unlink', 'external-link-alt',
      'shopping-cart', 'shopping-bag', 'credit-card', 'dollar-sign', 'euro-sign', 'pound-sign', 'yen-sign',
      'chart-bar', 'chart-line', 'chart-pie', 'chart-area', 'analytics', 'presentation', 'calculator',
      'lock', 'unlock', 'key', 'shield-alt', 'user-lock', 'user-shield', 'fingerprint', 'eye', 'eye-slash',
      'thumbs-up', 'thumbs-down', 'hand-pointer', 'hand-peace', 'hand-rock', 'hand-scissors', 'hand-paper',
      'trophy', 'medal', 'award', 'certificate', 'ribbon', 'bookmark', 'flag', 'star-half-alt',
      'fire', 'bolt', 'sun', 'moon', 'cloud', 'cloud-rain', 'cloud-sun', 'snowflake', 'wind', 'water',
      'briefcase', 'building', 'university', 'graduation-cap', 'book', 'pen', 'pencil-alt', 'marker', 'highlighter', 'eraser',
      'paint-brush', 'palette', 'fill-drip', 'tint', 'spray-can', 'bezier-curve', 'draw-polygon',
      'laptop', 'desktop', 'mobile-alt', 'tablet-alt', 'keyboard', 'mouse', 'headphones', 'microphone', 'server', 'database', 'hdd', 'save',
      'print', 'fax', 'phone-alt', 'phone-square', 'phone-volume', 'mobile', 'tablet',
      'plane', 'car', 'bus', 'train', 'ship', 'bicycle', 'motorcycle', 'taxi', 'truck', 'ambulance', 'helicopter', 'rocket', 'subway',
      'pizza-slice', 'hamburger', 'coffee', 'mug-hot', 'utensils', 'wine-glass', 'beer', 'cocktail', 'ice-cream', 'cookie', 'birthday-cake', 'apple-alt', 'lemon', 'carrot', 'pepper-hot',
      'users', 'user-friends', 'user-plus', 'user-minus', 'user-tie', 'user-md', 'user-nurse', 'user-graduate', 'user-astronaut', 'user-ninja',
      'smile', 'laugh', 'grin', 'sad-tear', 'angry', 'surprise', 'kiss', 'laugh-wink', 'meh', 'frown'
    ],
    interface: ['home', 'search', 'cog', 'sliders-h', 'bell', 'user', 'bars', 'times', 'check', 'plus', 'minus', 'edit', 'trash', 'save', 'download', 'upload', 'share', 'link', 'eye', 'eye-slash', 'ellipsis-h', 'ellipsis-v', 'filter', 'sort', 'sync', 'spinner', 'circle-notch', 'cogs', 'wrench', 'tools', 'hammer', 'screwdriver'],
    communication: ['envelope', 'envelope-open', 'phone', 'phone-alt', 'comment', 'comments', 'comment-dots', 'sms', 'message', 'inbox', 'paper-plane', 'share', 'share-alt', 'at', 'hashtag', 'rss', 'wifi', 'signal', 'broadcast-tower', 'satellite', 'satellite-dish'],
    business: ['briefcase', 'building', 'chart-bar', 'chart-line', 'chart-pie', 'clipboard', 'clipboard-check', 'tasks', 'project-diagram', 'sitemap', 'dollar-sign', 'euro-sign', 'credit-card', 'hand-holding-usd', 'coins', 'wallet', 'receipt', 'file-invoice', 'file-invoice-dollar', 'balance-scale', 'gavel', 'handshake'],
    shopping: ['shopping-cart', 'shopping-bag', 'shopping-basket', 'store', 'store-alt', 'gift', 'tag', 'tags', 'barcode', 'qrcode', 'percent', 'cash-register', 'receipt', 'credit-card', 'money-bill', 'money-check'],
    media: ['image', 'images', 'video', 'film', 'camera', 'camera-retro', 'music', 'headphones', 'microphone', 'play', 'pause', 'stop', 'forward', 'backward', 'volume-up', 'volume-mute', 'photo-video', 'film-alt', 'compact-disc', 'record-vinyl'],
    files: ['file', 'file-alt', 'file-pdf', 'file-word', 'file-excel', 'file-powerpoint', 'file-image', 'file-video', 'file-audio', 'file-code', 'file-archive', 'folder', 'folder-open', 'folder-plus', 'copy', 'paste', 'cut'],
    arrows: ['arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'arrow-circle-up', 'arrow-circle-down', 'arrow-circle-left', 'arrow-circle-right', 'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right', 'angle-up', 'angle-down', 'angle-left', 'angle-right', 'long-arrow-alt-up', 'long-arrow-alt-down', 'long-arrow-alt-left', 'long-arrow-alt-right', 'exchange-alt', 'sync-alt', 'redo', 'undo'],
    social: ['facebook', 'facebook-f', 'twitter', 'instagram', 'linkedin', 'linkedin-in', 'youtube', 'github', 'pinterest', 'whatsapp', 'telegram', 'reddit', 'discord', 'slack', 'skype', 'snapchat', 'tiktok', 'twitch', 'spotify', 'soundcloud'],
    education: ['graduation-cap', 'user-graduate', 'book', 'book-open', 'book-reader', 'bookmark', 'school', 'university', 'chalkboard', 'chalkboard-teacher', 'pencil-alt', 'pen', 'highlighter', 'marker', 'eraser', 'calculator', 'ruler', 'compass', 'flask', 'microscope', 'atom'],
    medical: ['hospital', 'ambulance', 'heartbeat', 'heart', 'stethoscope', 'user-md', 'user-nurse', 'syringe', 'pills', 'prescription', 'thermometer', 'x-ray', 'teeth', 'tooth', 'band-aid', 'first-aid', 'medkit', 'wheelchair', 'hospital-alt'],
    sports: ['football-ball', 'basketball-ball', 'baseball-ball', 'volleyball-ball', 'bowling-ball', 'golf-ball', 'hockey-puck', 'table-tennis', 'futbol', 'dumbbell', 'running', 'walking', 'skiing', 'skating', 'swimmer', 'biking', 'trophy', 'medal', 'award'],
    weather: ['sun', 'moon', 'cloud', 'cloud-sun', 'cloud-moon', 'cloud-rain', 'cloud-showers-heavy', 'snowflake', 'icicles', 'temperature-high', 'temperature-low', 'wind', 'tornado', 'smog', 'umbrella', 'rainbow', 'bolt', 'poo-storm'],
    nature: ['tree', 'leaf', 'seedling', 'spa', 'mountain', 'campground', 'hiking', 'binoculars', 'feather', 'feather-alt', 'paw', 'dog', 'cat', 'horse', 'fish', 'frog', 'spider', 'dragon', 'dove', 'crow']
  };

  const emojiCategories = {
    all: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
      '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖',
      '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄', '💋',
      '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👵', '🧓', '👴', '👲', '👳', '🧕', '🧔', '👱', '👨‍🦰', '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩‍🦰', '👩‍🦱', '👩‍🦳', '👩‍🦲',
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⚛️',
      '⭐', '🌟', '✨', '💫', '⚡', '🔥', '💥', '☄️', '💦', '💧', '🌊', '🌈', '☀️', '🌤', '⛅', '🌥', '☁️', '🌦', '🌧', '⛈', '🌩', '🌨', '❄️', '☃️', '⛄', '🌬', '💨', '🌪', '🌫', '🌙', '🌚', '🌛', '🌜', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔',
      '🌍', '🌎', '🌏', '🌐', '🗺', '🗾', '🧭', '🏔', '⛰', '🌋', '🗻', '🏕', '🏖', '🏜', '🏝', '🏞', '🏟', '🏛', '🏗', '🧱',
      '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙', '🌄', '🌅', '🌆', '🌇', '🌉',
      '♨️', '🎠', '🎡', '🎢', '💈', '🎪', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜', '🏎', '🏍', '🛵', '🚲', '🛴', '🛹', '⛵', '🚤', '🛥', '🛳', '⛴', '🚢', '✈️', '🛫', '🛬', '🚁', '🛩', '🚀', '🛸',
      '⌚', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⏳', '⌛', '📡', '🔋', '🔌', '💡', '🔦', '🕯',
      '🛒', '🛍', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒', '🗓', '📆', '📅', '🗑',
      '🍕', '🍔', '🍟', '🌭', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪'],
    drinks: ['🥛', '🍼', '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊'],
    fruits: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝'],
    vegetables: ['🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠'],
    sports: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '🎖', '🏆', '🥇', '🥈', '🥉']
  };

  const fontAwesomeCategories = [
    { key: 'all', label: 'All Icons', icon: '📦' },
    { key: 'interface', label: 'Interface', icon: '🖥️' },
    { key: 'communication', label: 'Communication', icon: '💬' },
    { key: 'business', label: 'Business', icon: '💼' },
    { key: 'shopping', label: 'Shopping', icon: '🛒' },
    { key: 'media', label: 'Media', icon: '🎵' },
    { key: 'files', label: 'Files', icon: '📁' },
    { key: 'arrows', label: 'Arrows', icon: '➡️' },
    { key: 'social', label: 'Social', icon: '📱' },
    { key: 'education', label: 'Education', icon: '🎓' },
    { key: 'medical', label: 'Medical', icon: '🏥' },
    { key: 'sports', label: 'Sports', icon: '⚽' },
    { key: 'weather', label: 'Weather', icon: '☀️' },
    { key: 'nature', label: 'Nature', icon: '🌳' }
  ];

  const emojiCategoriesData = [
    { key: 'all', label: 'All Emojis', icon: '🎨' },
    { key: 'smileys', label: 'Smileys', icon: '😀' },
    { key: 'emotions', label: 'Emotions', icon: '😢' },
    { key: 'gestures', label: 'Gestures', icon: '👋' },
    { key: 'people', label: 'People', icon: '👨' },
    { key: 'hearts', label: 'Hearts & Love', icon: '❤️' },
    { key: 'symbols', label: 'Symbols', icon: '⭐' },
    { key: 'nature', label: 'Nature & Earth', icon: '🌍' },
    { key: 'buildings', label: 'Buildings', icon: '🏠' },
    { key: 'technology', label: 'Technology', icon: '📱' },
    { key: 'vehicles', label: 'Vehicles', icon: '🚗' },
    { key: 'objects', label: 'Objects', icon: '🎁' },
    { key: 'food', label: 'Food', icon: '🍕' },
    { key: 'drinks', label: 'Drinks', icon: '☕' },
    { key: 'fruits', label: 'Fruits', icon: '🍎' },
    { key: 'vegetables', label: 'Vegetables', icon: '🥕' },
    { key: 'sports', label: 'Sports', icon: '⚽' }
  ];

  const getCurrentIcons = () => {
    const source = selectedTab === 'emojis' ? emojiCategories : iconCategories;
    const icons = source[selectedCategory] || source.all;
    if (!searchTerm) return icons;
    return icons.filter(icon => icon.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const isEmoji = (str) => /^[\p{Emoji}]+$/u.test(str);

  return ReactDOM.createPortal(
    <>
      <div className="picker-modal-overlay" onClick={onClose}></div>
      <div className="picker-modal-wrapper">
        <div className="picker-modal-header">
          <h3>Insert Icon</h3>
          <button type="button" className="picker-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="picker-tabs">
          <button type="button" className={`picker-tab ${selectedTab === 'icons' ? 'active' : ''}`} onClick={() => { setSelectedTab('icons'); setSelectedCategory('all'); }}>
            <i className="fas fa-icons"></i> Icons
          </button>
          <button type="button" className={`picker-tab ${selectedTab === 'emojis' ? 'active' : ''}`} onClick={() => { setSelectedTab('emojis'); setSelectedCategory('all'); }}>
            😀 Emojis
          </button>
        </div>

        <div className="picker-search">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="picker-search-input" />
        </div>

        <div className="picker-body-wrapper">
          <div className="picker-sidebar">
            {selectedTab === 'emojis' ? emojiCategoriesData.map(cat => (
              <button key={cat.key} type="button" className={`picker-category-btn ${selectedCategory === cat.key ? 'active' : ''}`} onClick={() => setSelectedCategory(cat.key)}>
                <span style={{ marginRight: '0.5rem' }}>{cat.icon}</span>
                {cat.label}
              </button>
            )) : fontAwesomeCategories.map(cat => (
              <button key={cat.key} type="button" className={`picker-category-btn ${selectedCategory === cat.key ? 'active' : ''}`} onClick={() => setSelectedCategory(cat.key)}>
                <span style={{ marginRight: '0.5rem' }}>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="picker-grid-wrapper">
            <div className="picker-grid">
              {getCurrentIcons().map((icon, index) => (
                <button key={index} type="button" className="picker-item" onClick={() => onSelect(icon)}>
                  {isEmoji(icon) ? <span style={{ fontSize: '1.5rem' }}>{icon}</span> : <i className={`fas fa-${icon}`}></i>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

// Image Picker Modal Component
const ImagePickerModal = ({ onSelect, onClose }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaGroups, setMediaGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMediaGroups();
    fetchMediaFiles();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchMediaGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/media/groups/list', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setMediaGroups(data.data || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setMediaGroups([]);
    }
  };

  const fetchMediaFiles = async (groupId = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = '/api/media?limit=200';
      if (groupId && groupId !== '' && groupId !== 'null') {
        url += `&group=${groupId}`;
      }
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setMediaFiles(data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching media:', err);
      setMediaFiles([]);
      setLoading(false);
    }
  };

  const handleGroupClick = (groupId) => {
    setSelectedGroup(groupId);
    fetchMediaFiles(groupId);
  };

  const renderGroupIcon = (icon) => {
    if (!icon) return '📁';
    if (/^[\p{Emoji}]+$/u.test(icon)) return icon;
    return <i className={`fas fa-${icon}`}></i>;
  };

  return ReactDOM.createPortal(
    <>
      <div className="picker-modal-overlay" onClick={onClose}></div>
      <div className="picker-modal-wrapper">
        <div className="picker-modal-header">
          <h3>Image from Library</h3>
          <button type="button" className="picker-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="picker-body-wrapper">
          <div className="picker-sidebar">
            <button 
              type="button" 
              className={`picker-category-btn ${selectedGroup === '' ? 'active' : ''}`} 
              onClick={() => handleGroupClick('')}
            >
              📁 All Media
            </button>
            {mediaGroups.map(group => (
              <button 
                key={group._id} 
                type="button" 
                className={`picker-category-btn ${selectedGroup === group._id ? 'active' : ''}`} 
                onClick={() => handleGroupClick(group._id)}
              >
                <span style={{ marginRight: '0.5rem' }}>{renderGroupIcon(group.icon)}</span>
                {group.name}
              </button>
            ))}
          </div>

          <div className="picker-grid-wrapper">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                <p>Loading images...</p>
              </div>
            ) : mediaFiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                <p>No images found in this group</p>
              </div>
            ) : (
              <div className="picker-grid">
                {mediaFiles.map(file => (
                  <button 
                    key={file._id} 
                    type="button" 
                    className="picker-item picker-image-item" 
                    onClick={() => onSelect(file.url)} 
                    title={file.originalName}
                  >
                    <img src={file.url} alt={file.originalName} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default RichTextEditor;
