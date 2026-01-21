// CommonJS format - should work even with "type": "module"
module.exports = (req, res) => {
  res.status(200).json({
    message: 'CommonJS test works',
    timestamp: new Date().toISOString()
  });
};
