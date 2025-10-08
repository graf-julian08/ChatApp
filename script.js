// SimpleChatConnect - Frontend JavaScript
// Global variables
let socket;
let currentPartner = null;
let isVideoMode = false;
let peerConnection = null;
let localStream = null;
let videosSwapped = false;
let typingTimeout = null;
let nextButtonTimeout = null;
let disconnectButtonTimeout = null;

// DOM elements
let startScreen, chatScreen, waitingScreen;
let connectButton, nextButton, disconnectButton;
let messageInput, messages, inputArea;
let localVideo, remoteVideo, videoContainer;
let videoStatus, typingIndicator;

// Countries data with ISO codes for flag-icons
const countries = {
  'Afghanistan': 'af', 'Albania': 'al', 'Algeria': 'dz', 'Andorra': 'ad', 'Angola': 'ao',
  'Antigua and Barbuda': 'ag', 'Argentina': 'ar', 'Armenia': 'am', 'Australia': 'au',
  'Austria': 'at', 'Azerbaijan': 'az', 'Bahamas': 'bs', 'Bahrain': 'bh', 'Bangladesh': 'bd',
  'Barbados': 'bb', 'Belarus': 'by', 'Belgium': 'be', 'Belize': 'bz', 'Benin': 'bj',
  'Bhutan': 'bt', 'Bolivia': 'bo', 'Bosnia and Herzegovina': 'ba', 'Botswana': 'bw',
  'Brazil': 'br', 'Brunei': 'bn', 'Bulgaria': 'bg', 'Burkina Faso': 'bf', 'Burundi': 'bi',
  'Cambodia': 'kh', 'Cameroon': 'cm', 'Canada': 'ca', 'Cape Verde': 'cv',
  'Central African Republic': 'cf', 'Chad': 'td', 'Chile': 'cl', 'China': 'cn',
  'Colombia': 'co', 'Comoros': 'km', 'Congo': 'cg', 'Costa Rica': 'cr', 'Croatia': 'hr',
  'Cuba': 'cu', 'Cyprus': 'cy', 'Czech Republic': 'cz', 'Denmark': 'dk', 'Djibouti': 'dj',
  'Dominica': 'dm', 'Dominican Republic': 'do', 'Ecuador': 'ec', 'Egypt': 'eg',
  'El Salvador': 'sv', 'Equatorial Guinea': 'gq', 'Eritrea': 'er', 'Estonia': 'ee',
  'Eswatini': 'sz', 'Ethiopia': 'et', 'Fiji': 'fj', 'Finland': 'fi', 'France': 'fr',
  'Gabon': 'ga', 'Gambia': 'gm', 'Georgia': 'ge', 'Germany': 'de', 'Ghana': 'gh',
  'Greece': 'gr', 'Grenada': 'gd', 'Guatemala': 'gt', 'Guinea': 'gn', 'Guinea-Bissau': 'gw',
  'Guyana': 'gy', 'Haiti': 'ht', 'Honduras': 'hn', 'Hungary': 'hu', 'Iceland': 'is',
  'India': 'in', 'Indonesia': 'id', 'Iran': 'ir', 'Iraq': 'iq', 'Ireland': 'ie',
  'Israel': 'il', 'Italy': 'it', 'Jamaica': 'jm', 'Japan': 'jp', 'Jordan': 'jo',
  'Kazakhstan': 'kz', 'Kenya': 'ke', 'Kiribati': 'ki', 'Kuwait': 'kw', 'Kyrgyzstan': 'kg',
  'Laos': 'la', 'Latvia': 'lv', 'Lebanon': 'lb', 'Lesotho': 'ls', 'Liberia': 'lr',
  'Libya': 'ly', 'Liechtenstein': 'li', 'Lithuania': 'lt', 'Luxembourg': 'lu',
  'Madagascar': 'mg', 'Malawi': 'mw', 'Malaysia': 'my', 'Maldives': 'mv', 'Mali': 'ml',
  'Malta': 'mt', 'Marshall Islands': 'mh', 'Mauritania': 'mr', 'Mauritius': 'mu',
  'Mexico': 'mx', 'Micronesia': 'fm', 'Moldova': 'md', 'Monaco': 'mc', 'Mongolia': 'mn',
  'Montenegro': 'me', 'Morocco': 'ma', 'Mozambique': 'mz', 'Myanmar': 'mm', 'Namibia': 'na',
  'Nauru': 'nr', 'Nepal': 'np', 'Netherlands': 'nl', 'New Zealand': 'nz', 'Nicaragua': 'ni',
  'Niger': 'ne', 'Nigeria': 'ng', 'North Korea': 'kp', 'North Macedonia': 'mk', 'Norway': 'no',
  'Oman': 'om', 'Pakistan': 'pk', 'Palau': 'pw', 'Palestine': 'ps', 'Panama': 'pa',
  'Papua New Guinea': 'pg', 'Paraguay': 'py', 'Peru': 'pe', 'Philippines': 'ph', 'Poland': 'pl',
  'Portugal': 'pt', 'Qatar': 'qa', 'Romania': 'ro', 'Russia': 'ru', 'Rwanda': 'rw',
  'Saint Kitts and Nevis': 'kn', 'Saint Lucia': 'lc', 'Saint Vincent and the Grenadines': 'vc',
  'Samoa': 'ws', 'San Marino': 'sm', 'Sao Tome and Principe': 'st', 'Saudi Arabia': 'sa',
  'Senegal': 'sn', 'Serbia': 'rs', 'Seychelles': 'sc', 'Sierra Leone': 'sl', 'Singapore': 'sg',
  'Slovakia': 'sk', 'Slovenia': 'si', 'Solomon Islands': 'sb', 'Somalia': 'so',
  'South Africa': 'za', 'South Korea': 'kr', 'South Sudan': 'ss', 'Spain': 'es',
  'Sri Lanka': 'lk', 'Sudan': 'sd', 'Suriname': 'sr', 'Sweden': 'se', 'Switzerland': 'ch',
  'Syria': 'sy', 'Taiwan': 'tw', 'Tajikistan': 'tj', 'Tanzania': 'tz', 'Thailand': 'th',
  'Timor-Leste': 'tl', 'Togo': 'tg', 'Tonga': 'to', 'Trinidad and Tobago': 'tt',
  'Tunisia': 'tn', 'Turkey': 'tr', 'Turkmenistan': 'tm', 'Tuvalu': 'tv', 'Uganda': 'ug',
  'Ukraine': 'ua', 'United Arab Emirates': 'ae', 'United Kingdom': 'gb', 'United States': 'us',
  'Uruguay': 'uy', 'Uzbekistan': 'uz', 'Vanuatu': 'vu', 'Vatican City': 'va',
  'Venezuela': 've', 'Vietnam': 'vn', 'Yemen': 'ye', 'Zambia': 'zm', 'Zimbabwe': 'zw'
};

// Initialize app
function init() {
  console.log('Initializing SimpleChatConnect...');
  
  // Get DOM elements
  startScreen = document.getElementById('start-screen');
  chatScreen = document.getElementById('chat-screen');
  waitingScreen = document.getElementById('waiting-screen');
  
  connectButton = document.getElementById('connect-btn');
  nextButton = document.getElementById('next-btn');
  disconnectButton = document.getElementById('disconnect-btn');
  
  messageInput = document.getElementById('message-input');
  messages = document.getElementById('messages');
  inputArea = document.getElementById('input-area');
  
  localVideo = document.getElementById('local-video');
  remoteVideo = document.getElementById('remote-video');
  videoContainer = document.getElementById('video-container');
  videoStatus = document.getElementById('video-status');
  typingIndicator = document.getElementById('typing-indicator');
  
  // Verify typing indicator exists
  if (!typingIndicator) {
    console.error('❌ CRITICAL: Typing indicator element not found in DOM!');
  } else {
    console.log('✅ Typing indicator element found:', typingIndicator);
  }
  
  // Populate country dropdowns
  populateCountryDropdowns();
  
  // Setup event listeners
  setupEventListeners();
  
  // Connect to server
  connectToServer();
  
  console.log('App initialized successfully');
}

// Populate country dropdowns with flags
function populateCountryDropdowns() {
  const userCountrySelect = document.getElementById('user-country');
  const prefCountrySelect = document.getElementById('pref-country');
  
  // Add countries with flags
  Object.entries(countries).forEach(([name, code]) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = `${name}`;
    userCountrySelect.appendChild(option);
    
    const prefOption = document.createElement('option');
    prefOption.value = name;
    prefOption.textContent = `${name}`;
    prefCountrySelect.appendChild(prefOption);
  });
  
  // Populate age dropdowns
  const userAgeSelect = document.getElementById('user-age');
  const prefAgeSelect = document.getElementById('pref-age');
  
  for (let age = 12; age <= 99; age++) {
    const option = document.createElement('option');
    option.value = age;
    option.textContent = age;
    userAgeSelect.appendChild(option);
    
    const prefOption = document.createElement('option');
    prefOption.value = age;
    prefOption.textContent = age;
    prefAgeSelect.appendChild(prefOption);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Connect button
  if (connectButton) {
    connectButton.addEventListener('click', handleConnect);
    console.log('Connect button listener added');
  }
  
  // Next button with confirmation
  if (nextButton) {
    nextButton.dataset.confirm = 'false';
    nextButton.addEventListener('click', handleNextClick);
  }
  
  // Disconnect button with confirmation
  if (disconnectButton) {
    disconnectButton.dataset.confirm = 'false';
    disconnectButton.addEventListener('click', handleDisconnectClick);
  }
  
  // Send button
  const sendButton = document.getElementById('send-btn');
  if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
  }
  
  // Cancel wait button
  const cancelButton = document.getElementById('cancel-wait-btn');
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      showScreen('start');
    });
  }
  
  // Message input
  if (messageInput) {
    messageInput.addEventListener('input', handleMessageInput);
    messageInput.addEventListener('keypress', handleKeyPress);
  }
  
  // Video swap
  if (localVideo) {
    localVideo.addEventListener('click', toggleVideoSwap);
  }
  if (remoteVideo) {
    remoteVideo.addEventListener('click', toggleVideoSwap);
  }
}

// Connect to server
function connectToServer() {
  socket = io();
  
  // Connection events
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    showScreen('start');
  });
  
  // Matching events
  socket.on('matched', (data) => {
    console.log('Matched with partner:', data);
    currentPartner = data.partner;
    showScreen('chat');
    clearInputAndMessages();
    buildPartnerSummary();
    
    // Only add system message for text chat
    if (!isVideoMode) {
      addSystemMessage('Connected! Start chatting.');
    }
  });
  
  socket.on('partner-disconnected', () => {
    console.log('Partner disconnected');
    closeWebRTC();
    currentPartner = null;
    
    // Show disconnected message in chat (keep chat history)
    addSystemMessage('User disconnected');
    
    // Disable input
    if (messageInput) {
      messageInput.disabled = true;
      messageInput.placeholder = 'User disconnected - click Next or Disconnect';
    }
    
    // Disable send button
    const sendButton = document.getElementById('send-btn');
    if (sendButton) {
      sendButton.disabled = true;
    }
    
    // Stay in chat screen (don't clear messages)
    showScreen('chat');
  });
  
  socket.on('partner-next', () => {
    console.log('Partner clicked next');
    closeWebRTC();
    currentPartner = null;
    clearInputAndMessages();
    showScreen('waiting');
    startWaitingTimer();
  });
  
  socket.on('disconnected', () => {
    console.log('Disconnected - returning home');
    closeWebRTC();
    currentPartner = null;
    clearInputAndMessages();
    showScreen('start');
  });
  
  // Chat events
  socket.on('chat-message', (data) => {
    addMessage(data.message, false);
  });
  
  socket.on('typing-start', () => {
    console.log('🔥🔥🔥 RECEIVED TYPING-START FROM PARTNER 🔥🔥🔥');
    showTypingIndicator();
  });
  
  socket.on('typing-stop', () => {
    console.log('🔥🔥🔥 RECEIVED TYPING-STOP FROM PARTNER 🔥🔥🔥');
    hideTypingIndicator();
  });
  
  socket.on('remove-system-message', () => {
    removeSystemMessage();
  });
  
  // Waiting events
  socket.on('waiting', () => {
    showScreen('waiting');
    startWaitingTimer();
  });
  
  socket.on('relax-to-random', () => {
    updateWaitingMessage('We could not find anyone matching your preferences. Connecting randomly when available...');
  });
  
  // WebRTC events
  socket.on('video-offer', handleVideoOffer);
  socket.on('video-answer', handleVideoAnswer);
  socket.on('ice-candidate', handleIceCandidate);
}

// Handle connect button
function handleConnect() {
  console.log('Connect button clicked!');
  
  const userData = getUserData();
  const preferences = getPreferences();
  
  console.log('User data:', userData);
  console.log('Preferences:', preferences);
  
  // Check if mode is selected
  const textMode = document.querySelector('input[name="chat-mode"][value="text"]');
  const videoMode = document.querySelector('input[name="chat-mode"][value="video"]');
  
  if (videoMode && videoMode.checked) {
    isVideoMode = true;
  } else {
    isVideoMode = false;
  }
  
  console.log('Video mode:', isVideoMode);
  
  // Emit to server
  socket.emit('find-match', {
    user: userData,
    preferences: preferences,
    isVideoMode: isVideoMode
  });
  
  console.log('Match request sent to server');
  
  showScreen('waiting');
  startWaitingTimer();
  clearInputAndMessages();
}

// Get user data from form
function getUserData() {
  const age = document.getElementById('user-age').value;
  const gender = document.getElementById('user-gender').value;
  const country = document.getElementById('user-country').value;
  
  return {
    age: age ? parseInt(age) : null,
    gender: gender || null,
    country: country || null
  };
}

// Get preferences from form
function getPreferences() {
  const age = document.getElementById('pref-age').value;
  const gender = document.getElementById('pref-gender').value;
  const country = document.getElementById('pref-country').value;
  
  return {
    age: age ? parseInt(age) : null,
    gender: gender || null,
    country: country || null
  };
}

// Handle next button with confirmation
function handleNextClick() {
  const confirmed = nextButton.dataset.confirm === 'true';
  if (!confirmed) {
    nextButton.dataset.confirm = 'true';
    nextButton.textContent = 'REALLY?';
    nextButtonTimeout = setTimeout(() => {
      nextButton.dataset.confirm = 'false';
      nextButton.textContent = 'NEXT';
    }, 10000);
    return;
  }
  clearTimeout(nextButtonTimeout);
  nextButton.dataset.confirm = 'false';
  nextButton.textContent = 'NEXT';
  findNextPartner();
}

// Handle disconnect button with confirmation
function handleDisconnectClick() {
  const confirmed = disconnectButton.dataset.confirm === 'true';
  if (!confirmed) {
    disconnectButton.dataset.confirm = 'true';
    disconnectButton.textContent = 'REALLY?';
    disconnectButtonTimeout = setTimeout(() => {
      disconnectButton.dataset.confirm = 'false';
      disconnectButton.textContent = 'DISCONNECT';
    }, 10000);
    return;
  }
  clearTimeout(disconnectButtonTimeout);
  disconnectButton.dataset.confirm = 'false';
  disconnectButton.textContent = 'DISCONNECT';
  disconnectChat();
}

// Find next partner
function findNextPartner() {
  console.log('Finding next partner...');
  
  // Re-enable input
  if (messageInput) {
    messageInput.disabled = false;
    messageInput.placeholder = 'Type a message...';
  }
  
  // Re-enable send button
  const sendButton = document.getElementById('send-btn');
  if (sendButton) {
    sendButton.disabled = false;
  }
  
  socket.emit('next-partner');
  showScreen('waiting');
  startWaitingTimer();
  clearInputAndMessages();
}

// Disconnect from chat
function disconnectChat() {
  console.log('Disconnecting from chat...');
  socket.emit('disconnect-partner');
  closeWebRTC();
  currentPartner = null;
  clearInputAndMessages();
  
  // Reset button text
  nextButton.dataset.confirm = 'false';
  nextButton.textContent = 'NEXT';
  disconnectButton.dataset.confirm = 'false';
  disconnectButton.textContent = 'DISCONNECT';
}

// Handle message input - BULLETPROOF VERSION
function handleMessageInput() {
  if (messageInput.value.trim()) {
    console.log('🔥🔥🔥 USER TYPING - EMITTING TYPING-START 🔥🔥🔥');
    socket.emit('typing-start');
    
    // Clear previous timeout - NO AUTO-TIMEOUT!
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // NO TIMEOUT - only stops when message sent or input cleared
  } else {
    console.log('🔥🔥🔥 INPUT EMPTY - EMITTING TYPING-STOP 🔥🔥🔥');
    socket.emit('typing-stop');
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  }
}

// Handle key press
function handleKeyPress(e) {
  if (e.key === 'Enter' && messageInput.value.trim()) {
    sendMessage();
  }
}

// Send message
function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    console.log('📤 Sending message:', message);
    socket.emit('chat-message', { message: message });
    addMessage(message, true);
    messageInput.value = '';
    
    // Stop typing indicator
    console.log('🛑 Sending typing-stop after message sent');
    socket.emit('typing-stop');
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Remove system message for both users on first message
    removeSystemMessage();
    socket.emit('first-message-sent');
  }
}

// Add message to chat
function addMessage(text, isOwn) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isOwn ? 'own' : 'other'}`;
  messageDiv.textContent = text;
  messages.appendChild(messageDiv);
  messages.scrollTop = messages.scrollHeight;
}

// Add system message
function addSystemMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message system';
  messageDiv.textContent = text;
  messageDiv.id = 'system-message';
  messages.appendChild(messageDiv);
  messages.scrollTop = messages.scrollHeight;
}

// Remove system message
function removeSystemMessage() {
  const systemMessage = document.getElementById('system-message');
  if (systemMessage) {
    systemMessage.remove();
  }
}

// Show typing indicator - BULLETPROOF VERSION
function showTypingIndicator() {
  console.log('🔥 SHOW TYPING INDICATOR CALLED');
  
  // Find element fresh every time
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.style.display = 'block';
    indicator.style.visibility = 'visible';
    indicator.style.opacity = '1';
    indicator.textContent = 'User is typing';
    console.log('✅ TYPING INDICATOR SHOWN - ELEMENT FOUND AND MADE VISIBLE');
  } else {
    console.error('❌ TYPING INDICATOR ELEMENT NOT FOUND - CREATING NEW ONE');
    
    // Create new element if not found
    const newIndicator = document.createElement('div');
    newIndicator.id = 'typing-indicator';
    newIndicator.className = 'typing-indicator';
    newIndicator.textContent = 'User is typing';
    newIndicator.style.display = 'block';
    newIndicator.style.visibility = 'visible';
    newIndicator.style.opacity = '1';
          newIndicator.style.position = 'fixed';
          newIndicator.style.bottom = '145px';
    newIndicator.style.left = '0';
    newIndicator.style.background = 'transparent';
    newIndicator.style.color = '#000000';
    newIndicator.style.padding = '8px 20px';
    newIndicator.style.fontSize = '0.875rem';
    newIndicator.style.fontStyle = 'normal';
    newIndicator.style.borderLeft = '2px solid #000000';
    newIndicator.style.zIndex = '999';
    
    const messages = document.getElementById('messages');
    if (messages) {
      messages.appendChild(newIndicator);
      console.log('✅ NEW TYPING INDICATOR CREATED AND ADDED');
    }
  }
}

// Hide typing indicator - BULLETPROOF VERSION
function hideTypingIndicator() {
  console.log('🔥 HIDE TYPING INDICATOR CALLED');
  
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.style.display = 'none';
    indicator.style.visibility = 'hidden';
    indicator.style.opacity = '0';
    console.log('✅ TYPING INDICATOR HIDDEN');
  }
}

// Build partner summary
function buildPartnerSummary() {
  const partnerSummary = document.getElementById('partner-summary');
  if (partnerSummary && currentPartner) {
    // Clear previous content
    partnerSummary.innerHTML = '';
    
    const parts = [];
    
    // Add country with flag if available
    if (currentPartner.country) {
      const countryCode = countries[currentPartner.country];
      if (countryCode) {
        // Create flag element safely
        const flagSpan = document.createElement('span');
        flagSpan.className = `fi fi-${countryCode}`;
        partnerSummary.appendChild(flagSpan);
        
        // Add country name as text
        const countryText = document.createTextNode(` ${currentPartner.country}`);
        partnerSummary.appendChild(countryText);
        
        // Mark that we added country
        parts.push('country');
      } else {
        parts.push(currentPartner.country);
      }
    }
    
    // Add age and gender
    const textParts = [];
    if (currentPartner.age) textParts.push(currentPartner.age);
    if (currentPartner.gender) textParts.push(currentPartner.gender);
    
    // Append remaining parts
    if (parts.length > 0 || textParts.length > 0) {
      if (parts.includes('country') && textParts.length > 0) {
        const separator = document.createTextNode(' · ');
        partnerSummary.appendChild(separator);
      }
      if (textParts.length > 0) {
        const textNode = document.createTextNode(textParts.join(' · '));
        partnerSummary.appendChild(textNode);
      }
    } else {
      partnerSummary.textContent = 'Unknown';
    }
  }
}

// Show screen
function showScreen(screenName) {
  console.log('Showing screen:', screenName);
  
  // Hide all screens
  if (startScreen) {
    startScreen.classList.remove('active');
    startScreen.style.display = 'none';
  }
  if (chatScreen) {
    chatScreen.classList.remove('active');
    chatScreen.style.display = 'none';
  }
  if (waitingScreen) {
    waitingScreen.classList.remove('active');
    waitingScreen.style.display = 'none';
  }
  
  // Show selected screen
  switch (screenName) {
    case 'start':
      if (startScreen) {
        startScreen.classList.add('active');
        startScreen.style.display = 'flex';
      }
      break;
    case 'chat':
      if (chatScreen) {
        chatScreen.classList.add('active');
        chatScreen.style.display = 'flex';
        
        // Show appropriate content based on mode
        const textContent = document.getElementById('text-chat-content');
        const videoContent = document.getElementById('video-chat-content');
        
        if (isVideoMode) {
          if (textContent) textContent.style.display = 'none';
          if (videoContent) {
            videoContent.style.display = 'flex';
            startVideoChat();
          }
        } else {
          if (videoContent) videoContent.style.display = 'none';
          if (textContent) {
            textContent.style.display = 'flex';
            ensureInputVisible();
          }
        }
      }
      break;
    case 'waiting':
      if (waitingScreen) {
        waitingScreen.classList.add('active');
        waitingScreen.style.display = 'flex';
      }
      break;
  }
}

// Ensure input field is always visible (handled by CSS)
function ensureInputVisible() {
  // Not needed anymore - CSS handles visibility
}

// Clear input and messages
function clearInputAndMessages() {
  if (messageInput) {
    messageInput.value = '';
  }
  if (messages) {
    messages.innerHTML = '';
  }
  // Always hide typing indicator when clearing
  hideTypingIndicator();
}


// Start waiting timer
function startWaitingTimer() {
  const waitingMessage = document.getElementById('waiting-message');
  if (!waitingMessage) return;
  
  waitingMessage.textContent = 'Searching for partner...';
  
  // After 30 seconds, show alternative message
  setTimeout(() => {
    if (waitingMessage) {
      waitingMessage.textContent = 'It seems like no one is online right now. Please change your preferences (if any) or try again later.';
    }
  }, 30000);
}

// Update waiting message
function updateWaitingMessage(message) {
  const waitingMessage = document.getElementById('waiting-message');
  if (waitingMessage) {
    waitingMessage.textContent = message;
  }
}

// Toggle video swap
function toggleVideoSwap() {
  if (videoContainer) {
    videoContainer.classList.toggle('swapped');
  }
}

// Start video chat
async function startVideoChat() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });
    
    localVideo.srcObject = localStream;
    
    // Create peer connection
    createPeerConnection();
    
    // Send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('video-offer', { offer: offer });
    
    videoStatus.textContent = 'Connecting...';
  } catch (error) {
    console.error('Error starting video chat:', error);
    videoStatus.textContent = 'Error starting video chat';
  }
}

// Create peer connection
function createPeerConnection() {
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };
  
  peerConnection = new RTCPeerConnection(configuration);
  
  // Add local stream
  if (localStream) {
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
  }
  
  // Handle remote stream
  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };
  
  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', { candidate: event.candidate });
    }
  };
  
  // Connection state
  peerConnection.onconnectionstatechange = () => {
    if (peerConnection.connectionState === 'connected') {
      videoStatus.textContent = 'Video chat active!';
    } else if (peerConnection.connectionState === 'disconnected') {
      videoStatus.textContent = 'Connection lost';
    } else if (peerConnection.connectionState === 'failed') {
      videoStatus.textContent = 'Connection failed';
      peerConnection.restartIce();
    }
  };
}

// Handle video offer
async function handleVideoOffer(data) {
  if (peerConnection) {
    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('video-answer', { answer: answer });
  }
}

// Handle video answer
async function handleVideoAnswer(data) {
  if (peerConnection) {
    await peerConnection.setRemoteDescription(data.answer);
  }
}

// Handle ICE candidate
async function handleIceCandidate(data) {
  if (peerConnection) {
    await peerConnection.addIceCandidate(data.candidate);
  }
}

// Close WebRTC
function closeWebRTC() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  
  if (localVideo) localVideo.srcObject = null;
  if (remoteVideo) remoteVideo.srcObject = null;
  if (videoStatus) videoStatus.textContent = 'Initializing video chat...';
  videosSwapped = false;
}

// Start app
init();