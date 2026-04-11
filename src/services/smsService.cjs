const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// Send low balance SMS alert
exports.sendLowBalanceAlert = async (phoneNumber, userName, balance) => {
  try {
    // Format phone to international format
    let formattedPhone = phoneNumber;
    
    // Add +977 for Nepal if not present
    if (!phoneNumber.startsWith('+')) {
      // Remove leading 0 if present
      formattedPhone = phoneNumber.replace(/^0+/, '');
      // Add country code
      formattedPhone = '+977' + formattedPhone;
    }

    const message = `Dear ${userName}, your bus card balance is low. Current balance: Rs ${(balance / 100).toFixed(2)}. Please top up to continue service. -SmartBus`;

    console.log('Sending SMS to:', formattedPhone);

    const result = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedPhone
    });

    console.log('SMS sent successfully! SID:', result.sid);
    console.log('Status:', result.status);
    
    return { 
      success: true, 
      messageId: result.sid,
      status: result.status
    };

  } catch (error) {
    console.error('SMS send error:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Send general alert SMS
exports.sendGeneralAlert = async (phoneNumber, userName, message) => {
  try {
    let formattedPhone = phoneNumber;
    
    if (!phoneNumber.startsWith('+')) {
      formattedPhone = phoneNumber.replace(/^0+/, '');
      formattedPhone = '+977' + formattedPhone;
    }

    const smsText = `Dear ${userName}, ${message} -SmartBus`;

    console.log('Sending SMS to:', formattedPhone);

    const result = await client.messages.create({
      body: smsText,
      from: twilioPhone,
      to: formattedPhone
    });

    console.log('SMS sent successfully! SID:', result.sid);
    
    return { 
      success: true, 
      messageId: result.sid 
    };

  } catch (error) {
    console.error('SMS send error:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
};