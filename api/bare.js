// Absolute bare minimum - no dependencies at all
exports.default = function(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ bare: 'minimum' }));
};
