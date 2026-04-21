const Stop = require('../models/Stop.cjs');
const User = require('../models/User.cjs');

// Get all stops for the logged-in driver
exports.getStops = async (req, res) => {
  try {
    const driverId = req.userId;  // ← Remove .user
    
    const stops = await Stop.find({ driverId })
      .sort({ timestamp: -1 }) // newest first
      .limit(50); // limit to last 50 stops
    
    res.json({ 
      success: true, 
      stops: stops 
    });
  } catch (error) {
    console.error('Get stops error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stops' 
    });
  }
};

// Get statistics for the driver
exports.getStats = async (req, res) => {
  try {
    const driverId = req.userId;  // ← Remove .user
    
    // Total stops
    const totalStops = await Stop.countDocuments({ driverId });
    
    // Today's stops
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayStops = await Stop.countDocuments({
      driverId,
      timestamp: { $gte: todayStart }
    });
    
    // This week's stops
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const thisWeekStops = await Stop.countDocuments({
      driverId,
      timestamp: { $gte: weekStart }
    });
    
    res.json({
      success: true,
      totalStops,
      todayStops,
      thisWeekStops
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stats' 
    });
  }
};

// Record a new stop
exports.recordStop = async (req, res) => {
  try {
    const driverId = req.userId;  // ← Remove .user
    const { stopNumber, route } = req.body;
    
    // Get driver name
    const driver = await User.findById(driverId);
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    // Create new stop
    const newStop = new Stop({
      driverId,
      driverName: driver.name,
      stopNumber: stopNumber || 'Unknown',
      route: route || 'Default Route',
      timestamp: new Date()
    });
    
    await newStop.save();
    
    res.json({ 
      success: true, 
      message: 'Stop recorded successfully',
      stop: newStop
    });
  } catch (error) {
    console.error('Record stop error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record stop' 
    });
  }
};

exports.arduinoRecordStop = async (req, res) => {
  try {
    const { stop_number, driver_id } = req.body;

    const driver = await User.findById(driver_id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const newStop = new Stop({
      driverId: driver._id,
      driverName: driver.name,
      stopNumber: `Stop ${stop_number}`,
      route: 'Default Route',
      timestamp: new Date()
    });

    await newStop.save();

    console.log(`✅ Stop ${stop_number} recorded by ${driver.name}`);

    res.json({
      success: true,
      message: `Stop ${stop_number} recorded`,
      stop: newStop
    });

  } catch (error) {
    console.error('Arduino Stop Error:', error);
    res.status(500).json({ success: false, message: 'Failed to record stop' });
  }
};