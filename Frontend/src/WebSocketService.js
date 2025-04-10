// WebSocketService.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = {};
    this.isConnected = false;
    this.reconnectDelay = 5000;
  }

  connect(serverUrl) {
    this.client = new Client({
      // Instead of direct websocket, use SockJS as configured in your backend
      webSocketFactory: () => new SockJS(`${serverUrl}/ws`),
      connectHeaders: {},
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to STOMP websocket');
        this.isConnected = true;
        
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
      }
    });

    this.client.activate();
  }

  resubscribe(topic) {
    if (this.subscriptions[topic] && this.subscriptions[topic].callbacks.length > 0) {
      const subscription = this.client.subscribe(topic, (message) => {
        const data = JSON.parse(message.body);
        this.subscriptions[topic].callbacks.forEach(callback => callback(data));
      });
      
      this.subscriptions[topic].id = subscription.id;
    }
  }

  subscribe(topic, callback) {
    if (!this.client || !this.isConnected) {
      console.error('STOMP client not connected. Cannot subscribe.');
      return;
    }

    if (!this.subscriptions[topic]) {
      this.subscriptions[topic] = {
        id: null,
        callbacks: []
      };
      
      const subscription = this.client.subscribe(topic, (message) => {
        const data = JSON.parse(message.body);
        this.subscriptions[topic].callbacks.forEach(callback => callback(data));
      });
      
      this.subscriptions[topic].id = subscription.id;
    }
    
    if (callback && !this.subscriptions[topic].callbacks.includes(callback)) {
      this.subscriptions[topic].callbacks.push(callback);
    }
  }

  unsubscribe(topic) {
    if (!this.client || !this.isConnected) {
      console.error('STOMP client not connected. Cannot unsubscribe.');
      return;
    }

    if (this.subscriptions[topic] && this.subscriptions[topic].id) {
      this.client.unsubscribe(this.subscriptions[topic].id);
      delete this.subscriptions[topic];
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.subscriptions = {};
      this.isConnected = false;
    }
  }
}

// Create a single instance for the application
const wsService = new WebSocketService();
export default wsService;