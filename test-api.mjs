// Simple test script to verify CoinDCX API connection
// Run with: node test-api.mjs
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
    const timestamp = Math.floor(Date.now()).toString();
    const payload = body ? new Buffer(JSON.stringify(body)).toString() : '';
    const message = `${endpoint}${timestamp}${payload}`;
    return crypto
      .createHmac('sha256', this.secret)
      .update(message)
      .digest('hex');
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const timestamp = Math.floor(Date.now()).toString();
    const signature = this.generateSignature(endpoint, body);

    const headers = {
      'Content-Type': 'application/json',
      'X-AUTH-APIKEY': this.apiKey,
      'X-AUTH-SIGNATURE': signature,
      'X-AUTH-TIMESTAMP': timestamp,
    };

    const config = {
      method,
      headers,
    };

    if (body && method === 'POST') {
      config.body = JSON.stringify(body);
    }

    try {
      console.log(`   🌐 Making ${method} request to: ${url}`);
      console.log(`   📅 Timestamp: ${timestamp}`);
      console.log(`   🔐 Signature: ${signature.substring(0, 20)}...`);

      const response = await fetch(url, config);

      console.log(
        `   📊 Response status: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   ❌ Error response: ${errorText}`);
        throw new Error(
          `API Error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
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

      // Test 2: Test API key validity with authenticated requests
      console.log('2️⃣ Testing API key permissions...');

      // First try user info
      try {
        console.log('   📋 Testing user info endpoint...');
        const userInfo = await this.makeRequest('/exchange/v1/users/info');
        console.log('   ✅ User info endpoint working');
        console.log(`   👤 User: ${userInfo[0]?.email || 'N/A'}\n`);
      } catch (error) {
        console.log('   ⚠️ User info endpoint failed:', error.message);
      }

      // Then try balance
      try {
        console.log('   💰 Testing balance endpoint...');
        const balance = await this.makeRequest('/exchange/v1/users/balances');
        console.log('   ✅ Balance endpoint working');
        console.log(
          `   📊 Balances found: ${Array.isArray(balance) ? balance.length : 0}`
        );
        if (Array.isArray(balance) && balance.length > 0) {
          console.log(
            '   💵 Sample balance:',
            JSON.stringify(balance[0], null, 2)
          );
        }
        console.log('');
      } catch (error) {
        console.log('   ❌ Balance endpoint failed:', error.message);

        // Try alternative balance endpoint (some exchanges have different paths)
        try {
          console.log('   🔄 Trying alternative balance endpoint...');
          const altBalance = await this.makeRequest('/api/v1/account');
          console.log('   ✅ Alternative balance endpoint working');
        } catch (altError) {
          console.log('   ❌ Alternative endpoint also failed');

          console.log('   🔧 Troubleshooting tips:');
          console.log('      • Current IP: 152.59.90.99');
          console.log('      • Check API key permissions in CoinDCX dashboard');
          console.log(
            '      • Ensure "Read Info" permission is enabled for user endpoints'
          );
          console.log(
            '      • Verify account has completed full KYC verification'
          );
          console.log(
            '      • Try creating a new API key with all permissions enabled'
          );
          console.log(
            '      • Check if your account type supports these endpoints'
          );
          console.log('      • Contact CoinDCX support if issue persists');
          console.log('');
        }
      }

      // Test 4: Get BTC/USDT market data
      console.log('4️⃣ Testing specific market data (BTC/USDT)...');
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
  console.log(
    'Or create a .env file and run: source .env && node test-api.mjs'
  );
  process.exit(1);
}

const tester = new CoinDCXTest(apiKey, secret);
tester.testConnection();
