// WebSocketService.js
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = {};
    this.isConnected = false;
    this.reconnectDelay = 5000;
    this.connectionPromise = null;
    this.connectionResolve = null;
    this.connectionReject = null;
  }

  connect(serverUrl) {
    console.log(`Attempting to connect to WebSocket at ${serverUrl}/ws`);
    
    // Clean up any existing connection
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {
        console.warn('Error deactivating existing client', e);
      }
      this.client = null;
    }
    
    // Create a new promise for connection tracking
    this.connectionPromise = new Promise((resolve, reject) => {
      this.connectionResolve = resolve;
      this.connectionReject = reject;
    });

    try {
      const socket = new SockJS(`${serverUrl}/ws`);
      
      // Debug the socket connection
      socket.onopen = () => {
        console.log('SockJS socket opened successfully');
      };
      
      socket.onerror = (error) => {
        console.error('SockJS socket error:', error);
        if (this.connectionReject) {
          this.connectionReject(error);
        }
      };
      
      socket.onclose = (event) => {
        console.log('SockJS socket closed:', event);
      };

      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {},
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: function(str) {
          console.log('STOMP Debug:', str);
        },
        onConnect: (frame) => {
          console.log('Connected to STOMP websocket', frame);
          this.isConnected = true;
          
          // Resolve the connection promise
          if (this.connectionResolve) {
            this.connectionResolve();
          }
          
          // Resubscribe to topics after reconnection
          Object.keys(this.subscriptions).forEach(topic => {
            this.resubscribe(topic);
          });
        },
        onDisconnect: () => {
          console.log('Disconnected from STOMP websocket');
          this.isConnected = false;
        },
        onStompError: (frame) => {
          console.error('STOMP error', frame);
          if (this.connectionReject) {
            this.connectionReject(new Error(`STOMP error: ${frame.headers.message}`));
          }
        }
      });
      
      console.log('Activating STOMP client');
      this.client.activate();
    } catch (e) {
      console.error('Error creating WebSocket connection:', e);
      if (this.connectionReject) {
        this.connectionReject(e);
      }
    }
    
    // Add timeout for connection
    setTimeout(() => {
      if (!this.isConnected && this.connectionReject) {
        this.connectionReject(new Error('WebSocket connection timeout after 10 seconds'));
      }
    }, 10000);
    
    return this.connectionPromise;
  }

  waitForConnection() {
    return this.connectionPromise;
  }

  resubscribe(topic) {
    if (this.subscriptions[topic] && this.subscriptions[topic].callbacks.length > 0) {
      try {
        const subscription = this.client.subscribe(topic, (message) => {
          try {
            const data = JSON.parse(message.body);
            this.subscriptions[topic].callbacks.forEach(callback => callback(data));
          } catch (e) {
            console.error(`Error parsing message from ${topic}:`, e);
          }
        });
        this.subscriptions[topic].id = subscription.id;
        console.log(`Resubscribed to ${topic}`);
      } catch (e) {
        console.error(`Error resubscribing to ${topic}:`, e);
      }
    }
  }

  async subscribe(topic, callback) {
    console.log(`Attempting to subscribe to ${topic}`);
    
    // Wait for connection before subscribing
    if (!this.isConnected) {
      console.log(`Not connected yet, waiting for connection before subscribing to ${topic}`);
      try {
        await this.waitForConnection();
        console.log(`Connection established, proceeding with subscription to ${topic}`);
      } catch (e) {
        console.error(`Failed to connect to WebSocket while trying to subscribe to ${topic}:`, e);
        // Store the subscription request for later attempt
        if (!this.subscriptions[topic]) {
          this.subscriptions[topic] = {
            id: null,
            callbacks: []
          };
        }
        if (callback && !this.subscriptions[topic].callbacks.includes(callback)) {
          this.subscriptions[topic].callbacks.push(callback);
        }
        return;
      }
    }
    
    try {
      if (!this.subscriptions[topic]) {
        this.subscriptions[topic] = {
          id: null,
          callbacks: []
        };
        
        const subscription = this.client.subscribe(topic, (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log(`Received message on ${topic}:`, data);
            this.subscriptions[topic].callbacks.forEach(callback => callback(data));
          } catch (e) {
            console.error(`Error processing message from ${topic}:`, e);
          }
        });
        
        this.subscriptions[topic].id = subscription.id;
        console.log(`Successfully subscribed to ${topic} with subscription ID ${subscription.id}`);
      }
      
      if (callback && !this.subscriptions[topic].callbacks.includes(callback)) {
        this.subscriptions[topic].callbacks.push(callback);
        console.log(`Added callback for ${topic}, total callbacks: ${this.subscriptions[topic].callbacks.length}`);
      }
    } catch (e) {
      console.error(`Error subscribing to ${topic}:`, e);
    }
  }

  unsubscribe(topic) {
    console.log(`Attempting to unsubscribe from ${topic}`);
    
    if (!this.isConnected || !this.client) {
      console.log(`Not connected, just removing ${topic} from subscription list`);
      if (this.subscriptions[topic]) {
        delete this.subscriptions[topic];
      }
      return;
    }
    
    if (this.subscriptions[topic] && this.subscriptions[topic].id) {
      try {
        this.client.unsubscribe(this.subscriptions[topic].id);
        console.log(`Successfully unsubscribed from ${topic}`);
      } catch (e) {
        console.warn(`Error unsubscribing from ${topic}:`, e);
      }
      delete this.subscriptions[topic];
    } else {
      console.log(`No active subscription found for ${topic}`);
    }
  }

  disconnect() {
    console.log('Attempting to disconnect WebSocket');
    if (this.client) {
      try {
        this.client.deactivate();
        console.log('Successfully deactivated STOMP client');
      } catch (e) {
        console.warn('Error while disconnecting WebSocket:', e);
      }
      this.client = null;
      this.subscriptions = {};
      this.isConnected = false;
    } else {
      console.log('No active client to disconnect');
    }
  }
}

// Create a single instance for the application
const wsService = new WebSocketService();
export default wsService;