// Clear NextAuth session cookies
// Run this in the browser console to clear any existing session cookies

// Clear all cookies for localhost:3000
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log("✅ All cookies cleared. Please refresh the page and log in again.");
