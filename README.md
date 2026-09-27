This Homey App will connect to 
• the official Electrolux Group Developer API at https://api.developer.electrolux.one
• and support both Electrolux and AEG appliances

Setup Guide

1. Sign in at https://developer.electrolux.one using the same account (email and password) as your Electrolux or AEG mobile app.
2. On the Dashboard, create an API Key, then click GET ACCESS TOKEN to generate an Access Token and Refresh Token.
3. Open the Homey App settings and paste the API Key, Access Token and Refresh Token. The tokens are renewed automatically by the app, so use a token pair dedicated to Homey and don't share it with other apps.
4. Add a Device using the App and choose the relevant type Laundry / Air Purifier etc.
5. If your appliance / device isn't available, please visit https://github.com/gslender/com.electrolux-aeg.ocp/issues/new/choose to request support for your device.

The free Electrolux developer plan allows 5000 API calls per day. When you have many appliances, the polling interval is automatically increased to stay within this limit.

Upgrading from version 1.x: email and password login is no longer supported. After updating, open the app settings and enter your developer credentials - your existing devices are kept.

Thanks!

I wish to acknowledge the original code by https://github.com/rickardp of which elements were used to build out the Air Purifier support.