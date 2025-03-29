// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Replace with your actual Firebase API key
  authDomain: "predipto-app.firebaseapp.com",
  projectId: "predipto-app",
  storageBucket: "predipto-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase (to be imported in other files)
export const initializeFirebase = () => {
  // This is a placeholder for actual Firebase initialization
  // In a real implementation, you would use:
  // import { initializeApp } from "firebase/app";
  // import { getAuth } from "firebase/auth";
  // import { getFirestore } from "firebase/firestore";
  
  console.log("Firebase initialized with config:", firebaseConfig);
  
  // Return mock Firebase services for our frontend-only implementation
  return {
    app: { name: "predipto-app" },
    auth: {
      currentUser: null,
      onAuthStateChanged: (callback) => {
        // Simulate auth state change when localStorage changes
        window.addEventListener('storage', (event) => {
          if (event.key === 'predipto_user') {
            const user = JSON.parse(localStorage.getItem('predipto_user') || 'null');
            callback(user);
          }
        });
        
        // Initial call with current user
        const user = JSON.parse(localStorage.getItem('predipto_user') || 'null');
        callback(user);
        
        // Return unsubscribe function
        return () => {};
      },
      signInWithEmailAndPassword: async (email, password) => {
        // Simple validation
        if (!email || !password) {
          throw new Error("Email and password are required");
        }
        
        // In a real app, this would call Firebase Auth
        // For our demo, we'll simulate a successful login
        const user = {
          uid: btoa(email).replace(/=/g, ''),
          email,
          displayName: email.split('@')[0],
          photoURL: null
        };
        
        localStorage.setItem('predipto_user', JSON.stringify(user));
        return { user };
      },
      createUserWithEmailAndPassword: async (email, password) => {
        // Simple validation
        if (!email || !password) {
          throw new Error("Email and password are required");
        }
        
        // In a real app, this would call Firebase Auth
        // For our demo, we'll simulate a successful registration
        const user = {
          uid: btoa(email).replace(/=/g, ''),
          email,
          displayName: email.split('@')[0],
          photoURL: null
        };
        
        localStorage.setItem('predipto_user', JSON.stringify(user));
        return { user };
      },
      signOut: async () => {
        localStorage.removeItem('predipto_user');
      }
    },
    firestore: {
      collection: (collectionName) => {
        return {
          doc: (docId) => {
            return {
              get: async () => {
                const storageKey = `predipto_${collectionName}_${docId}`;
                const data = localStorage.getItem(storageKey);
                return {
                  exists: !!data,
                  data: () => data ? JSON.parse(data) : null
                };
              },
              set: async (data) => {
                const storageKey = `predipto_${collectionName}_${docId}`;
                localStorage.setItem(storageKey, JSON.stringify(data));
              },
              update: async (data) => {
                const storageKey = `predipto_${collectionName}_${docId}`;
                const existingData = localStorage.getItem(storageKey);
                const newData = {
                  ...(existingData ? JSON.parse(existingData) : {}),
                  ...data
                };
                localStorage.setItem(storageKey, JSON.stringify(newData));
              }
            };
          },
          where: (field, operator, value) => {
            return {
              get: async () => {
                // Simulate a query by scanning localStorage
                const results = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key.startsWith(`predipto_${collectionName}_`)) {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (operator === '==' && data[field] === value) {
                      results.push({
                        id: key.replace(`predipto_${collectionName}_`, ''),
                        data: () => data
                      });
                    }
                  }
                }
                return { docs: results };
              }
            };
          },
          add: async (data) => {
            const docId = Date.now().toString();
            const storageKey = `predipto_${collectionName}_${docId}`;
            localStorage.setItem(storageKey, JSON.stringify(data));
            return { id: docId };
          }
        };
      }
    }
  };
};
