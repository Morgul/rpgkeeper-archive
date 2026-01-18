//----------------------------------------------------------------------------------------------------------------------
// RPGKeeper Configuration
//
// @module config.js
//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    DEBUG: true,

    // Server settings
    listenAddress: "0.0.0.0",
    listenPort: 8081,

    // Session
    sessionKey: 'sid',
    sessionSecret: process.env.SESSION_SECRET || "9799a2dde63b2850ca2aadee07bc4ad01db80e02415b52f8fe3a143500dc9d99f8d1bfff8b8b67de8ae3344ea97687cd",

    // Authentication - Persona (legacy, to be removed)
    //audience: "http://rpgkeeper.skewedaspect.com"
    //audience: "http://localhost:8081",
    audience: "https://rpgk2.skewedaspect.com",
    //checkAudience: false

    // Google OAuth
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID || 'your-client-id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8081/auth/google/callback'
    },

    // Admin
    adminEmail: 'chris.case@g33xnexus.com'
}; // end exports

//----------------------------------------------------------------------------------------------------------------------
