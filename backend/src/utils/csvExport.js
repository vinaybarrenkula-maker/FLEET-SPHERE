const { createObjectCsvStringifier } = require('csv-writer');

const exportToCSV = (res, data, headers, filename) => {
  const csvStringifier = createObjectCsvStringifier({ header: headers });
  const csvContent = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}-${Date.now()}.csv"`);
  return res.status(200).send(csvContent);
};

// Common CSV field mappings
const vehicleCSVHeaders = [
  { id: 'registrationNumber', title: 'Registration Number' },
  { id: 'vehicleType', title: 'Vehicle Type' },
  { id: 'manufacturer', title: 'Manufacturer' },
  { id: 'model', title: 'Model' },
  { id: 'year', title: 'Year' },
  { id: 'fuelType', title: 'Fuel Type' },
  { id: 'currentMileage', title: 'Current Mileage (km)' },
  { id: 'status', title: 'Status' },
  { id: 'insuranceExpiry', title: 'Insurance Expiry' },
  { id: 'registrationExpiry', title: 'Registration Expiry' },
];

const driverCSVHeaders = [
  { id: 'name', title: 'Driver Name' },
  { id: 'employeeId', title: 'Employee ID' },
  { id: 'phone', title: 'Phone' },
  { id: 'licenseNumber', title: 'License Number' },
  { id: 'licenseType', title: 'License Type' },
  { id: 'licenseExpiry', title: 'License Expiry' },
  { id: 'status', title: 'Status' },
  { id: 'totalTrips', title: 'Total Trips' },
  { id: 'totalKm', title: 'Total KM' },
];

const tripCSVHeaders = [
  { id: 'tripNumber', title: 'Trip Number' },
  { id: 'vehicleReg', title: 'Vehicle' },
  { id: 'driverName', title: 'Driver' },
  { id: 'origin', title: 'Origin' },
  { id: 'destination', title: 'Destination' },
  { id: 'plannedStartTime', title: 'Planned Start' },
  { id: 'actualStartTime', title: 'Actual Start' },
  { id: 'actualEndTime', title: 'Completed At' },
  { id: 'status', title: 'Status' },
  { id: 'totalDistance', title: 'Distance (km)' },
];

const fuelCSVHeaders = [
  { id: 'date', title: 'Date' },
  { id: 'vehicleReg', title: 'Vehicle' },
  { id: 'driverName', title: 'Driver' },
  { id: 'fuelType', title: 'Fuel Type' },
  { id: 'quantity', title: 'Quantity (L)' },
  { id: 'pricePerUnit', title: 'Price/Unit (₹)' },
  { id: 'totalCost', title: 'Total Cost (₹)' },
  { id: 'odometer', title: 'Odometer (km)' },
  { id: 'fuelStation', title: 'Fuel Station' },
];

const maintenanceCSVHeaders = [
  { id: 'vehicleReg', title: 'Vehicle' },
  { id: 'serviceType', title: 'Service Type' },
  { id: 'description', title: 'Description' },
  { id: 'scheduledDate', title: 'Scheduled Date' },
  { id: 'completedDate', title: 'Completed Date' },
  { id: 'actualCost', title: 'Cost (₹)' },
  { id: 'vendor', title: 'Vendor' },
  { id: 'status', title: 'Status' },
];

const expenseCSVHeaders = [
  { id: 'date', title: 'Date' },
  { id: 'category', title: 'Category' },
  { id: 'amount', title: 'Amount (₹)' },
  { id: 'description', title: 'Description' },
  { id: 'submittedBy', title: 'Submitted By' },
  { id: 'status', title: 'Status' },
  { id: 'vehicleReg', title: 'Vehicle' },
  { id: 'tripNumber', title: 'Trip' },
];

const incidentCSVHeaders = [
  { id: 'incidentDate', title: 'Date' },
  { id: 'incidentType', title: 'Type' },
  { id: 'severity', title: 'Severity' },
  { id: 'location', title: 'Location' },
  { id: 'vehicleReg', title: 'Vehicle' },
  { id: 'driverName', title: 'Driver' },
  { id: 'description', title: 'Description' },
  { id: 'status', title: 'Status' },
];

module.exports = {
  exportToCSV,
  vehicleCSVHeaders,
  driverCSVHeaders,
  tripCSVHeaders,
  fuelCSVHeaders,
  maintenanceCSVHeaders,
  expenseCSVHeaders,
  incidentCSVHeaders,
};
