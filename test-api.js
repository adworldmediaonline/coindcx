// Simple test script to verify CoinDCX API connection
// Run with: node test-api.js
//
// Note: Make sure to set your API credentials as environment variables first:
// export COINDCX_API_KEY=your_api_key
// export COINDCX_SECRET=your_secret_key

import crypto from 'crypto';

class CoinDCXTest {
  constructor(apiKey, secret) {
    this.apiKey = apiKey;
    this.secret = secret;
    this.baseUrl = 'https://api.coindcx.com';
  }

  generateSignature(endpoint, body = null) {
    const timestamp = Date.now().toString();
    const message = `${endpoint}${timestamp}${
      body ? JSON.stringify(body) : ''
    }`;
    return crypto
      .createHmac('sha256', this.secret)
      .update(message)
      .digest('hex');
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const timestamp = Date.now().toString();
    const signature = this.generateSignature(endpoint, body);

    const headers = {
      'Content-Type': 'application/json',
      'X-Auth-APIKey': this.apiKey,
      'X-Auth-Signature': signature,
      'X-Auth-Timestamp': timestamp,
    };

    const config = {
      method,
      headers,
    };

    if (body && method === 'POST') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('Request failed:', error.message);
      throw error;
    }
  }

  async testConnection() {
    console.log('🔍 Testing CoinDCX API Connection...\n');

    try {
      // Test 1: Get market details
      console.log('1️⃣ Testing market data endpoint...');
      const markets = await this.makeRequest('/exchange/v1/markets_details');
      console.log('✅ Market data endpoint working');
      console.log(`📊 Found ${markets.length} trading pairs\n`);

      // Test 2: Get account balance
      console.log('2️⃣ Testing account balance endpoint...');
      const balance = await this.makeRequest('/exchange/v1/users/balances');
      console.log('✅ Account balance endpoint working');
      console.log(`💰 Balances found: ${balance.balances?.length || 0}\n`);

      // Test 3: Get BTC/USDT market data
      console.log('3️⃣ Testing specific market data (BTC/USDT)...');
      const btcMarket = markets.find(
        m => m.symbol === 'BTCUSDT' || m.symbol === 'BTC/USDT'
      );
      if (btcMarket) {
        console.log('✅ BTC/USDT market found');
        console.log(`💵 Current price: $${btcMarket.last_price || 'N/A'}`);
        console.log(`📈 24h change: ${btcMarket.change_24_hour || 'N/A'}%\n`);
      } else {
        console.log('⚠️ BTC/USDT market not found in response\n');
      }

      console.log(
        '🎉 All API tests passed! Your CoinDCX API is working correctly.'
      );
      console.log('🚀 You can now use the AI bot with real market data.');
    } catch (error) {
      console.error('❌ API test failed:', error.message);
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Check your API key and secret in .env.local');
      console.log('2. Verify API permissions in CoinDCX dashboard');
      console.log('3. Ensure your IP is whitelisted (if required)');
      console.log('4. Check your internet connection');
      process.exit(1);
    }
  }
}

// Run the test
const apiKey = process.env.COINDCX_API_KEY;
const secret = process.env.COINDCX_SECRET;

if (!apiKey || !secret) {
  console.error('❌ Missing API credentials!');
  console.log('Please set your API credentials as environment variables:');
  console.log('export COINDCX_API_KEY=your_api_key_here');
  console.log('export COINDCX_SECRET=your_secret_here');
  console.log('');
  console.log('Or create a .env file and run: source .env && node test-api.js');
  process.exit(1);
}

const tester = new CoinDCXTest(apiKey, secret);
tester.testConnection();
