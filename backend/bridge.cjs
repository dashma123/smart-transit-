const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const axios = require('axios');

const port = new SerialPort({
  path:  '/dev/cu.usbmodem101',
  baudRate: 9600
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
console.log('Bridge started - listening to Arduino...');

parser.on('data', async (line) => {
  line = line.trim();
  console.log('Received:', line);
  if (!line.startsWith('{')) return;

  try {
    const data = JSON.parse(line);

    if (data.type === 'stop') {
      const res = await axios.post('http://localhost:3000/api/driver/arduino-stop', {
        stop_number: data.stop_number,
        driver_id: '69ca15f0945f072314e58a9a'
      });
      console.log('Stop sent:', res.data.message);
    }

    if (data.type === 'entry') {
      console.log(`Passenger boarded at stop ${data.entry_stop} - Card: ${data.rfid_uid}`);
    }

    if (data.type === 'payment') {
      console.log('Payment data received:', data); // ← shows fare value
      const res = await axios.post('http://localhost:3000/api/wallet/rfid-payment', {
        rfid_uid: data.rfid_uid,
        entry_stop: data.entry_stop,
        exit_stop: data.exit_stop,
        stop_number: data.exit_stop,
        fare: data.fare
      });
      console.log('Payment sent:', res.data.message);
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
});