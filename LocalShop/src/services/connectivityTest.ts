import { apiService } from './api';

export class ConnectivityTest {
  static async testAPI(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      console.log('🧪 Starting API connectivity test...');
      
      // Test 1: Health check
      console.log('1. Testing health endpoint...');
      const healthResult = await apiService.healthCheck();
      console.log('✅ Health check passed:', healthResult);
      
      // Test 2: API endpoint
      console.log('2. Testing shops endpoint...');
      const shopsResult = await apiService.getShops({ limit: 1 });
      console.log('✅ Shops endpoint passed:', shopsResult);
      
      return {
        success: true,
        message: 'All API tests passed successfully!',
        details: {
          health: healthResult,
          shops: shopsResult
        }
      };
      
    } catch (error) {
      console.error('❌ API connectivity test failed:', error);
      
      let message = 'API connectivity test failed';
      let details = { error: error.message };
      
      if (error.message.includes('Network request failed')) {
        message = 'Cannot connect to server. Please check your internet connection.';
        details.suggestion = 'Make sure both your phone and computer are on the same WiFi network.';
      } else if (error.message.includes('fetch')) {
        message = 'Network error occurred. Please try again.';
        details.suggestion = 'Check if the backend server is running.';
      } else if (error.message.includes('CORS')) {
        message = 'CORS error - server configuration issue.';
        details.suggestion = 'Backend needs to be restarted with updated CORS settings.';
      }
      
      return {
        success: false,
        message,
        details
      };
    }
  }
  
  static async quickTest(): Promise<boolean> {
    try {
      await apiService.healthCheck();
      return true;
    } catch {
      return false;
    }
  }
} 