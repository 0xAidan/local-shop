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
      console.error('Connectivity test failed:', error);
      
      // Type guard for error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      let details: any = { error: errorMessage };
      
      if (errorMessage.includes('Network request failed')) {
        details.suggestion = 'Make sure both your phone and computer are on the same WiFi network.';
      } else if (errorMessage.includes('fetch')) {
        details.suggestion = 'Check if the backend server is running.';
      } else if (errorMessage.includes('CORS')) {
        details.suggestion = 'Backend needs to be restarted with updated CORS settings.';
      }
      
      return {
        success: false,
        message: 'Failed to connect to backend',
        details,
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