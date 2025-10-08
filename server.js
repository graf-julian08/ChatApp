const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve static files from root directory
app.use(express.static(path.join(__dirname)));

// Simple data structures
const users = new Map(); // socketId -> user data
const waitingUsers = new Set(); // socketIds waiting for match
const activePairs = new Map(); // socketId -> partnerId
const recentPairs = new Map(); // "userId1,userId2" -> timestamp (30min cooldown)

// Calculate match score (higher = better match)
function calculateMatchScore(user1, user2) {
  let score = 0;
  
  // Check if user1's preferences match user2's data
  if (user1.preferredAge && user2.age && user1.preferredAge === user2.age) {
    score += 10;
  }
  if (user1.preferredGender && user2.gender && user1.preferredGender === user2.gender) {
    score += 10;
  }
  if (user1.preferredCountry && user2.country && user1.preferredCountry === user2.country) {
    score += 10;
  }
  
  // Check if user2's preferences match user1's data
  if (user2.preferredAge && user1.age && user2.preferredAge === user1.age) {
    score += 10;
  }
  if (user2.preferredGender && user1.gender && user2.preferredGender === user1.gender) {
    score += 10;
  }
  if (user2.preferredCountry && user1.country && user2.preferredCountry === user1.country) {
    score += 10;
  }
  
  return score;
}

// Check if two users were recently paired (30min cooldown)
function wereRecentlyPaired(userId1, userId2) {
  const key1 = `${userId1},${userId2}`;
  const key2 = `${userId2},${userId1}`;
  const now = Date.now();
  const cooldown = 30 * 60 * 1000; // 30 minutes
  
  const timestamp1 = recentPairs.get(key1);
  const timestamp2 = recentPairs.get(key2);
  
  if (timestamp1 && (now - timestamp1) < cooldown) return true;
  if (timestamp2 && (now - timestamp2) < cooldown) return true;
  
  return false;
}

// Find best match for a user
function findBestMatch(userId) {
  const user = users.get(userId);
  if (!user) return null;
  
  let bestMatch = null;
  let bestScore = -1;
  
  for (const waitingId of waitingUsers) {
    // Skip self
    if (waitingId === userId) continue;
    
    // Skip if already paired
    if (activePairs.has(waitingId)) continue;
    
    // Skip if recently paired (30min cooldown)
    if (wereRecentlyPaired(userId, waitingId)) continue;
    
    const candidate = users.get(waitingId);
    if (!candidate) continue;
    
    // Calculate match score
    const score = calculateMatchScore(user, candidate);
    
    // Update best match if this is better
    if (score > bestScore) {
      bestScore = score;
      bestMatch = waitingId;
    }
  }
  
  return bestMatch;
}

// Create a pair
function createPair(userId1, userId2) {
  // Verify neither is already paired
  if (activePairs.has(userId1) || activePairs.has(userId2)) {
    console.log('❌ Pairing failed: one or both already paired');
    return false;
  }
  
  // Remove from waiting
  waitingUsers.delete(userId1);
  waitingUsers.delete(userId2);
  
  // Create pair
  activePairs.set(userId1, userId2);
  activePairs.set(userId2, userId1);
  
  // Record pairing for cooldown
  const now = Date.now();
  const key1 = `${userId1},${userId2}`;
  const key2 = `${userId2},${userId1}`;
  recentPairs.set(key1, now);
  recentPairs.set(key2, now);
  
  const user1 = users.get(userId1);
  const user2 = users.get(userId2);
  
  // Notify both users
  io.to(userId1).emit('matched', {
    partner: {
      age: user2.age || null,
      gender: user2.gender || null,
      country: user2.country || null
    }
  });
  
  io.to(userId2).emit('matched', {
    partner: {
      age: user1.age || null,
      gender: user1.gender || null,
      country: user1.country || null
    }
  });
  
  console.log(`✅ Paired: ${userId1} <-> ${userId2}`);
  return true;
}

// Break a pair
function breakPair(userId) {
  const partnerId = activePairs.get(userId);
  
  if (partnerId) {
    activePairs.delete(userId);
    activePairs.delete(partnerId);
    console.log(`💔 Pair broken: ${userId} <-> ${partnerId}`);
    return partnerId;
  }
  
  return null;
}

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);
  
  // Find match
  socket.on('find-match', (data) => {
    console.log(`🔍 Find match request from ${socket.id}`);
    
    // Validate user data
    const validAge = data.user.age && data.user.age >= 12 && data.user.age <= 99 ? data.user.age : null;
    const validGender = ['Male', 'Female', 'Other'].includes(data.user.gender) ? data.user.gender : null;
    const validCountry = data.user.country && typeof data.user.country === 'string' ? data.user.country : null;
    
    // Validate preferences
    const validPrefAge = data.preferences.age && data.preferences.age >= 12 && data.preferences.age <= 99 ? data.preferences.age : null;
    const validPrefGender = ['Male', 'Female', 'Other'].includes(data.preferences.gender) ? data.preferences.gender : null;
    const validPrefCountry = data.preferences.country && typeof data.preferences.country === 'string' ? data.preferences.country : null;
    
    // Save user data
    users.set(socket.id, {
      socketId: socket.id,
      age: validAge,
      gender: validGender,
      country: validCountry,
      preferredAge: validPrefAge,
      preferredGender: validPrefGender,
      preferredCountry: validPrefCountry,
      isVideoMode: data.isVideoMode
    });
    
    // Don't match if already paired
    if (activePairs.has(socket.id)) {
      console.log(`⚠️ ${socket.id} already paired`);
      return;
    }
    
    // Try to find a match immediately
    const matchId = findBestMatch(socket.id);
    
    if (matchId) {
      // Match found!
      console.log(`🎯 Immediate match: ${socket.id} -> ${matchId}`);
      createPair(socket.id, matchId);
    } else {
      // No match yet, add to waiting
      console.log(`⏳ No match found, adding ${socket.id} to waiting list`);
      waitingUsers.add(socket.id);
      socket.emit('waiting');
      
      // Try to find match every second
      const interval = setInterval(() => {
        // Stop if no longer waiting
        if (!waitingUsers.has(socket.id)) {
          clearInterval(interval);
          return;
        }
        
        // Stop if already paired
        if (activePairs.has(socket.id)) {
          clearInterval(interval);
          return;
        }
        
        // Stop if user disconnected
        if (!users.has(socket.id)) {
          clearInterval(interval);
          return;
        }
        
        // Try to find match
        const retryMatchId = findBestMatch(socket.id);
        if (retryMatchId) {
          console.log(`🎯 Retry match: ${socket.id} -> ${retryMatchId}`);
          clearInterval(interval);
          createPair(socket.id, retryMatchId);
        }
      }, 1000);
      
      // Store interval ID for cleanup
      socket.matchInterval = interval;
    }
  });
  
  // Chat message
  socket.on('chat-message', (data) => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('chat-message', { message: data.message });
    }
  });
  
  // First message sent
  socket.on('first-message-sent', () => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('remove-system-message');
      io.to(socket.id).emit('remove-system-message');
    }
  });
  
  // Typing indicators
  socket.on('typing-start', () => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      console.log(`⌨️ ${socket.id} typing -> forwarding to ${partnerId}`);
      io.to(partnerId).emit('typing-start');
    } else {
      console.log(`⚠️ ${socket.id} typing-start but no partner found`);
    }
  });
  
  socket.on('typing-stop', () => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      console.log(`🛑 ${socket.id} stopped typing -> forwarding to ${partnerId}`);
      io.to(partnerId).emit('typing-stop');
    }
  });
  
  // WebRTC signaling
  socket.on('video-offer', (data) => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('video-offer', data);
    }
  });
  
  socket.on('video-answer', (data) => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('video-answer', data);
    }
  });
  
  socket.on('ice-candidate', (data) => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('ice-candidate', data);
    }
  });
  
  // Next partner
  socket.on('next-partner', () => {
    console.log(`⏭️ Next partner: ${socket.id}`);
    
    // Break current pair
    const partnerId = breakPair(socket.id);
    
    if (partnerId) {
      // Tell partner user disconnected (stays in chat)
      io.to(partnerId).emit('partner-disconnected');
    }
    
    // Current user searches for new match
    waitingUsers.delete(socket.id);
    const newMatch = findBestMatch(socket.id);
    
    if (newMatch) {
      createPair(socket.id, newMatch);
    } else {
      waitingUsers.add(socket.id);
      socket.emit('waiting');
      
      // Retry interval
      const interval = setInterval(() => {
        if (!waitingUsers.has(socket.id) || activePairs.has(socket.id) || !users.has(socket.id)) {
          clearInterval(interval);
          return;
        }
        const retryMatch = findBestMatch(socket.id);
        if (retryMatch) {
          clearInterval(interval);
          createPair(socket.id, retryMatch);
        }
      }, 1000);
      
      socket.matchInterval = interval;
    }
  });
  
  // Disconnect partner
  socket.on('disconnect-partner', () => {
    console.log(`🔌 Disconnect partner: ${socket.id}`);
    
    // Break current pair
    const partnerId = breakPair(socket.id);
    
    if (partnerId) {
      // Tell partner user disconnected (stays in chat)
      io.to(partnerId).emit('partner-disconnected');
    }
    
    // Current user goes home
    waitingUsers.delete(socket.id);
    if (socket.matchInterval) {
      clearInterval(socket.matchInterval);
    }
    socket.emit('disconnected');
  });
  
  // Socket disconnect
  socket.on('disconnect', () => {
    console.log(`👋 User disconnected: ${socket.id}`);
    
    // Clean up interval
    if (socket.matchInterval) {
      clearInterval(socket.matchInterval);
    }
    
    // Break pair if exists
    const partnerId = breakPair(socket.id);
    
    if (partnerId) {
      // Tell partner user disconnected (NO automatic search)
      io.to(partnerId).emit('partner-disconnected');
    }
    
    // Remove from all data structures
    waitingUsers.delete(socket.id);
    users.delete(socket.id);
  });
});

// Cleanup old recent pairs every 5 minutes
setInterval(() => {
  const now = Date.now();
  const cooldown = 30 * 60 * 1000; // 30 minutes
  let cleaned = 0;
  
  for (const [key, timestamp] of recentPairs.entries()) {
    if (now - timestamp > cooldown) {
      recentPairs.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} old pair records`);
  }
}, 5 * 60 * 1000);

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log(`✨ SimpleChatConnect running on http://localhost:${PORT}`);
  console.log(`🚀 Ready to connect users!`);
});
