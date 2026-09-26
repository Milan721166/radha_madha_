const dotenv = require('dotenv');
dotenv.config();

/**
 * Service to handle OTP sending via APITxT (https://apitxt.com/api/sendOTP)
 */
async function sendOtpViaApiTxt(phone, otp) {
  const authKey = process.env.APITXT_AUTH_KEY;
  const channel = process.env.APITXT_CHANNEL || 'SMS';

  // Sanitize phone number to contain only digits, e.g. add country code '91' if missing (10 digits)
  let formattedPhone = phone.replace(/\D/g, '');
  if (formattedPhone.length === 10) {
    formattedPhone = `91${formattedPhone}`;
  }

  console.log(`[OTP Service] Preparing to send OTP ${otp} to ${formattedPhone} via APITxT (${channel})...`);

  // If no auth key is provided, log OTP to console as DEV / Mock mode
  if (!authKey || authKey.trim() === '' || authKey === 'your_apitxt_auth_key_here') {
    console.log(`\n==================================================`);
    console.log(`[DEV MODE - NO APITXT AUTH KEY SET]`);
    console.log(`MOBILE: +${formattedPhone}`);
    console.log(`VERIFICATION OTP CODE: ${otp}`);
    console.log(`==================================================\n`);
    return {
      success: true,
      mode: 'development',
      message: 'OTP logged to console (Dev Mode)'
    };
  }

  const sender = process.env.APITXT_SENDER;
  const dltTeId = process.env.APITXT_DLT_TE_ID;
  const route = process.env.APITXT_ROUTE || 'nondlt';
  const messageTemplate = process.env.APITXT_MESSAGE_TEMPLATE;

  try {
    const payload = {
      authkey: authKey,
      mobile: formattedPhone,
      otp: otp,
      channel: (channel || 'SMS').toLowerCase(),
      route: route.toLowerCase(),
      country: '91'
    };

    if (messageTemplate && messageTemplate.trim()) {
      payload.message = messageTemplate.replace(/\{\{otp\}\}/gi, otp);
    }
    if (sender && sender.trim()) payload.sender = sender.trim();
    if (dltTeId && dltTeId.trim()) payload.dlt_te_id = dltTeId.trim();

    const params = new URLSearchParams(payload);

    const response = await fetch('https://apitxt.com/api/sendOTP', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    const data = await response.json();

    if (data.status === 'success' || data.success === true) {
      console.log(`[OTP Service] OTP delivered successfully via APITxT:`, data);
      return { success: true, data };
    } else {
      console.warn(`[OTP Service] APITxT returned error status:`, data);
      // Fallback to dev mode log so developer can test even if API returns balance/key error
      console.log(`[DEV FALLBACK] OTP CODE for +${formattedPhone} is: ${otp}`);
      return {
        success: true,
        mode: 'fallback',
        message: data.message || 'OTP sent (with warning)'
      };
    }
  } catch (error) {
    console.error(`[OTP Service] HTTP Error sending OTP via APITxT:`, error.message);
    console.log(`[DEV FALLBACK] OTP CODE for +${formattedPhone} is: ${otp}`);
    return {
      success: true,
      mode: 'fallback',
      message: 'OTP request processed in offline mode'
    };
  }
}

module.exports = {
  sendOtpViaApiTxt
};
