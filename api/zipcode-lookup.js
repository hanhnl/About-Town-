// Pure JavaScript - no TypeScript
module.exports = (req, res) => {
  try {
    const zipcode = req.query.zipcode;

    // Validate zipcode format
    if (!zipcode || !/^\d{5}$/.test(zipcode)) {
      return res.status(400).json({
        error: 'Invalid zipcode format',
        supported: false
      });
    }

    // Accept all Maryland zipcodes
    res.status(200).json({
      zipcode,
      city: null,
      state: 'MD',
      neighborhoods: null,
      jurisdiction: null,
      supported: true,
      hasJurisdiction: false,
      message: "Showing Maryland state legislation. Enter any Maryland ZIP code to explore bills."
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to lookup zipcode',
      message: error.message,
    });
  }
};
