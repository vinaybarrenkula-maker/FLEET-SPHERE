require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Trip = require('../models/Trip');
const TripStatusHistory = require('../models/TripStatusHistory');
const FuelEntry = require('../models/FuelEntry');
const Maintenance = require('../models/Maintenance');
const Incident = require('../models/Incident');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const DEMO_PASSWORD = 'Demo@12345';

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    await Promise.all([
      Organization.deleteMany({}), Branch.deleteMany({}), User.deleteMany({}),
      Vehicle.deleteMany({}), Driver.deleteMany({}), Route.deleteMany({}),
      Trip.deleteMany({}), TripStatusHistory.deleteMany({}), FuelEntry.deleteMany({}),
      Maintenance.deleteMany({}), Incident.deleteMany({}), Expense.deleteMany({}),
      Notification.deleteMany({}), AuditLog.deleteMany({}),
    ]);
    console.log('🗑️  Cleared all collections');

    // ─── Organization ──────────────────────────────────────────────
    const org = await Organization.create({
      name: 'Bharat Logistics Pvt Ltd',
      companyCode: 'BLPL',
      email: 'info@bharatlogistics.demo',
      phone: '9876543210',
      address: { street: '42, Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033' },
      status: 'ACTIVE',
      gstNumber: '36AABCB1234A1ZX',
    });

    // ─── Branches ─────────────────────────────────────────────────
    const [branchHyd, branchBng] = await Branch.create([
      { organizationId: org._id, name: 'Hyderabad HQ', branchCode: 'HYD', address: { street: 'Jubilee Hills Rd No 4', city: 'Hyderabad', state: 'Telangana', pincode: '500033' }, contactNumber: '9876543211', email: 'hyd@bharatlogistics.demo', status: 'ACTIVE' },
      { organizationId: org._id, name: 'Bengaluru Branch', branchCode: 'BNG', address: { street: 'Outer Ring Road, Marathahalli', city: 'Bengaluru', state: 'Karnataka', pincode: '560037' }, contactNumber: '9876543212', email: 'bng@bharatlogistics.demo', status: 'ACTIVE' },
    ]);

    // ─── Users ────────────────────────────────────────────────────
    const superAdmin = await User.create({ name: 'Arjun Sharma', email: 'admin@fleetsphere.demo', password: DEMO_PASSWORD, phone: '9000000001', role: 'SUPER_ADMIN', organizationId: org._id, status: 'ACTIVE' });
    const fleetManager = await User.create({ name: 'Priya Reddy', email: 'manager@fleetsphere.demo', password: DEMO_PASSWORD, phone: '9000000002', role: 'FLEET_MANAGER', organizationId: org._id, status: 'ACTIVE' });
    const branchMgrHyd = await User.create({ name: 'Vikram Nair', email: 'branch@fleetsphere.demo', password: DEMO_PASSWORD, phone: '9000000003', role: 'BRANCH_MANAGER', organizationId: org._id, branchId: branchHyd._id, status: 'ACTIVE' });
    const branchMgrBng = await User.create({ name: 'Deepa Krishnan', email: 'branch2@fleetsphere.demo', password: DEMO_PASSWORD, phone: '9000000004', role: 'BRANCH_MANAGER', organizationId: org._id, branchId: branchBng._id, status: 'ACTIVE' });
    const finance1 = await User.create({ name: 'Ramesh Gupta', email: 'finance@fleetsphere.demo', password: DEMO_PASSWORD, phone: '9000000005', role: 'FINANCE_OFFICER', organizationId: org._id, branchId: branchHyd._id, status: 'ACTIVE' });

    // Set branch managers
    await Branch.findByIdAndUpdate(branchHyd._id, { managerId: branchMgrHyd._id });
    await Branch.findByIdAndUpdate(branchBng._id, { managerId: branchMgrBng._id });

    // Driver users
    const driverUsers = await User.create([
      { name: 'Raju Yadav',      email: 'driver@fleetsphere.demo',  password: DEMO_PASSWORD, phone: '9100000001', role: 'DRIVER', organizationId: org._id, branchId: branchHyd._id },
      { name: 'Suresh Kumar',    email: 'driver2@fleetsphere.demo', password: DEMO_PASSWORD, phone: '9100000002', role: 'DRIVER', organizationId: org._id, branchId: branchHyd._id },
      { name: 'Mohan Lal',       email: 'driver3@fleetsphere.demo', password: DEMO_PASSWORD, phone: '9100000003', role: 'DRIVER', organizationId: org._id, branchId: branchHyd._id },
      { name: 'Balaji Swamy',    email: 'driver4@fleetsphere.demo', password: DEMO_PASSWORD, phone: '9100000004', role: 'DRIVER', organizationId: org._id, branchId: branchHyd._id },
      { name: 'Kiran Patil',     email: 'driver5@fleetsphere.demo', password: DEMO_PASSWORD, phone: '9100000005', role: 'DRIVER', organizationId: org._id, branchId: branchBng._id },
      { name: 'Anil Verma',      email: 'driver6@fleetsphere.demo', password: DEMO_PASSWORD, phone: '9100000006', role: 'DRIVER', organizationId: org._id, branchId: branchBng._id },
      { name: 'Srinivas Rao',    email: 'driver7@fleetsphere.demo', password: DEMO_PASSWORD, phone: '9100000007', role: 'DRIVER', organizationId: org._id, branchId: branchBng._id },
      { name: 'Venkat Reddy',    email: 'driver8@fleetsphere.demo', password: DEMO_PASSWORD, phone: '9100000008', role: 'DRIVER', organizationId: org._id, branchId: branchHyd._id },
      { name: 'Naresh Goud',     email: 'driver9@fleetsphere.demo', password: DEMO_PASSWORD, phone: '9100000009', role: 'DRIVER', organizationId: org._id, branchId: branchHyd._id },
      { name: 'Prasad Tiwari',   email: 'driver10@fleetsphere.demo',password: DEMO_PASSWORD, phone: '9100000010', role: 'DRIVER', organizationId: org._id, branchId: branchBng._id },
    ]);

    // ─── Vehicles ─────────────────────────────────────────────────
    const vehicleData = [
      { reg: 'TS09AB1234', type: 'TRUCK',      mfr: 'Tata',   model: 'Prima 4928.S',  year: 2021, branch: branchHyd._id, status: 'AVAILABLE' },
      { reg: 'TS09CD5678', type: 'LORRY',      mfr: 'Ashok Leyland', model: '1920',  year: 2020, branch: branchHyd._id, status: 'AVAILABLE' },
      { reg: 'TS10EF9012', type: 'MINI_TRUCK', mfr: 'Mahindra', model: 'Bolero Pik-Up', year: 2022, branch: branchHyd._id, status: 'ON_TRIP' },
      { reg: 'TS08GH3456', type: 'TANKER',     mfr: 'Tata',   model: 'LPT 1412',     year: 2019, branch: branchHyd._id, status: 'MAINTENANCE' },
      { reg: 'TS07IJ7890', type: 'CONTAINER',  mfr: 'BharatBenz', model: '2523R',    year: 2022, branch: branchHyd._id, status: 'AVAILABLE' },
      { reg: 'TS06KL2345', type: 'TRUCK',      mfr: 'Eicher',  model: 'Pro 6031',    year: 2021, branch: branchHyd._id, status: 'ASSIGNED' },
      { reg: 'TS05MN6789', type: 'VAN',        mfr: 'Force',  model: 'Traveller 26', year: 2020, branch: branchHyd._id, status: 'AVAILABLE' },
      { reg: 'TS04OP0123', type: 'TEMPO',      mfr: 'Tata',   model: 'Ace HT',       year: 2023, branch: branchHyd._id, status: 'AVAILABLE' },
      { reg: 'TS03QR4567', type: 'PICKUP',     mfr: 'Mahindra', model: 'Jeeto',      year: 2022, branch: branchHyd._id, status: 'AVAILABLE' },
      { reg: 'TS02ST8901', type: 'TRUCK',      mfr: 'Tata',   model: 'Ultra 1518.T', year: 2021, branch: branchHyd._id, status: 'AVAILABLE' },
      { reg: 'KA01UV2345', type: 'TRUCK',      mfr: 'Volvo',  model: 'FH 440',       year: 2022, branch: branchBng._id, status: 'AVAILABLE' },
      { reg: 'KA02WX6789', type: 'LORRY',      mfr: 'Ashok Leyland', model: '2518',  year: 2021, branch: branchBng._id, status: 'ON_TRIP' },
      { reg: 'KA03YZ0123', type: 'MINI_TRUCK', mfr: 'Tata',  model: 'Intra V30',    year: 2022, branch: branchBng._id, status: 'AVAILABLE' },
      { reg: 'KA04AB4567', type: 'TANKER',     mfr: 'BharatBenz', model: '1617R',   year: 2020, branch: branchBng._id, status: 'AVAILABLE' },
      { reg: 'KA05CD8901', type: 'CONTAINER',  mfr: 'Eicher', model: 'Pro 8049',    year: 2023, branch: branchBng._id, status: 'MAINTENANCE' },
      { reg: 'KA06EF2345', type: 'VAN',        mfr: 'Force',  model: 'Trax Cruiser', year: 2021, branch: branchBng._id, status: 'AVAILABLE' },
      { reg: 'KA07GH6789', type: 'TEMPO',      mfr: 'Mahindra', model: 'Supro',     year: 2022, branch: branchBng._id, status: 'AVAILABLE' },
      { reg: 'KA08IJ0123', type: 'TRUCK',      mfr: 'Tata',  model: 'Prima 2523.K', year: 2020, branch: branchBng._id, status: 'AVAILABLE' },
      { reg: 'KA09KL4567', type: 'PICKUP',     mfr: 'Isuzu', model: 'D-Max',        year: 2022, branch: branchBng._id, status: 'AVAILABLE' },
      { reg: 'KA10MN8901', type: 'LORRY',      mfr: 'Tata',  model: 'LPT 1613',     year: 2021, branch: branchBng._id, status: 'AVAILABLE' },
    ];

    const futureDate = (months) => { const d = new Date(); d.setMonth(d.getMonth() + months); return d; };
    const pastDate = (months) => { const d = new Date(); d.setMonth(d.getMonth() - months); return d; };

    const vehicles = await Vehicle.create(vehicleData.map((v, i) => ({
      organizationId: org._id, branchId: v.branch, registrationNumber: v.reg,
      vehicleType: v.type, manufacturer: v.mfr, model: v.model, year: v.year,
      fuelType: 'DIESEL', capacity: { weight: 10 + i, unit: 'tons' },
      currentMileage: 20000 + i * 3500, status: v.status,
      insuranceExpiry: i < 3 ? futureDate(1) : futureDate(8),
      registrationExpiry: futureDate(10), pollutionExpiry: futureDate(6),
      purchaseDate: pastDate(24 - i), purchasePrice: 1500000 + i * 100000,
      createdBy: fleetManager._id,
    })));

    // ─── Drivers ──────────────────────────────────────────────────
    const driverDefs = driverUsers.map((u, i) => ({
      organizationId: org._id,
      branchId: i < 7 ? branchHyd._id : branchBng._id,
      userId: u._id,
      employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
      licenseNumber: `TS${String(2015 + i).padStart(4,'0')}${String(i + 1).padStart(7, '0')}`,
      licenseType: ['HMV','HGMV','HMV','HMV','HGMV','HMV','HMV','HGMV','HMV','HMV'][i],
      licenseExpiry: i < 2 ? futureDate(2) : futureDate(18),
      phone: u.phone,
      emergencyContact: { name: 'Family Contact', phone: '9900000' + (i+1), relation: 'Spouse' },
      joiningDate: pastDate(12 - i),
      status: ['AVAILABLE','AVAILABLE','ON_TRIP','ASSIGNED','AVAILABLE','AVAILABLE','AVAILABLE','AVAILABLE','AVAILABLE','AVAILABLE'][i],
      assignedVehicle: i === 2 ? vehicles[2]._id : i === 5 ? vehicles[5]._id : null,
      totalTrips: 20 + i * 5, totalKm: 8000 + i * 2000,
    }));
    const drivers = await Driver.create(driverDefs);

    // ─── Routes ───────────────────────────────────────────────────
    const routes = await Route.create([
      { organizationId: org._id, branchId: branchHyd._id, routeCode: 'HYD-BNG-01', origin: { city: 'Hyderabad', state: 'Telangana' }, destination: { city: 'Bengaluru', state: 'Karnataka' }, distance: 570, estimatedDuration: 600, routeType: 'INTERSTATE', status: 'ACTIVE', createdBy: fleetManager._id },
      { organizationId: org._id, branchId: branchHyd._id, routeCode: 'HYD-MUM-01', origin: { city: 'Hyderabad', state: 'Telangana' }, destination: { city: 'Mumbai', state: 'Maharashtra' }, distance: 710, estimatedDuration: 780, routeType: 'INTERSTATE', status: 'ACTIVE', createdBy: fleetManager._id },
      { organizationId: org._id, branchId: branchHyd._id, routeCode: 'HYD-CHN-01', origin: { city: 'Hyderabad', state: 'Telangana' }, destination: { city: 'Chennai', state: 'Tamil Nadu' }, distance: 625, estimatedDuration: 660, routeType: 'INTERSTATE', status: 'ACTIVE', createdBy: fleetManager._id },
      { organizationId: org._id, branchId: branchHyd._id, routeCode: 'HYD-VJA-01', origin: { city: 'Hyderabad', state: 'Telangana' }, destination: { city: 'Vijayawada', state: 'Andhra Pradesh' }, distance: 275, estimatedDuration: 300, routeType: 'INTERSTATE', status: 'ACTIVE', createdBy: fleetManager._id },
      { organizationId: org._id, branchId: branchBng._id, routeCode: 'BNG-PUN-01', origin: { city: 'Bengaluru', state: 'Karnataka' }, destination: { city: 'Pune', state: 'Maharashtra' }, distance: 840, estimatedDuration: 900, routeType: 'INTERSTATE', status: 'ACTIVE', createdBy: branchMgrBng._id },
      { organizationId: org._id, branchId: branchBng._id, routeCode: 'BNG-CHN-01', origin: { city: 'Bengaluru', state: 'Karnataka' }, destination: { city: 'Chennai', state: 'Tamil Nadu' }, distance: 345, estimatedDuration: 360, routeType: 'INTERSTATE', status: 'ACTIVE', createdBy: branchMgrBng._id },
    ]);

    // ─── Trips ────────────────────────────────────────────────────
    const tripStatusList = ['COMPLETED','COMPLETED','STARTED','DELAYED','PLANNED','ASSIGNED','COMPLETED','CANCELLED'];
    const tripDates = [pastDate(5), pastDate(3), new Date(), new Date(), futureDate(1), new Date(), pastDate(8), pastDate(2)];
    const trips = [];
    for (let i = 0; i < 8; i++) {
      const start = tripDates[i];
      const end = new Date(start); end.setHours(end.getHours() + 10);
      const trip = await Trip.create({
        organizationId: org._id,
        branchId: i < 5 ? branchHyd._id : branchBng._id,
        vehicleId: vehicles[i]._id,
        driverId: drivers[i]._id,
        routeId: routes[i % routes.length]._id,
        cargoDetails: ['Steel Pipes','Cement Bags','Electronic Goods','Chemicals','Textiles','Auto Parts','Rice Bags','Glass'][i],
        plannedStartTime: start,
        actualStartTime: ['STARTED','DELAYED','COMPLETED'].includes(tripStatusList[i]) ? start : null,
        expectedEndTime: end,
        actualEndTime: tripStatusList[i] === 'COMPLETED' ? end : null,
        startMileage: 20000 + i * 1000,
        endMileage: tripStatusList[i] === 'COMPLETED' ? (20000 + i * 1000 + routes[i % routes.length].distance) : null,
        status: tripStatusList[i],
        delayReason: tripStatusList[i] === 'DELAYED' ? 'Heavy traffic on NH44' : undefined,
        createdBy: branchMgrHyd._id,
      });
      await TripStatusHistory.create({ tripId: trip._id, previousStatus: null, newStatus: 'PLANNED', changedBy: branchMgrHyd._id, reason: 'Trip created' });
      if (!['PLANNED'].includes(tripStatusList[i])) {
        await TripStatusHistory.create({ tripId: trip._id, previousStatus: 'PLANNED', newStatus: 'ASSIGNED', changedBy: branchMgrHyd._id });
      }
      if (['STARTED','COMPLETED','DELAYED'].includes(tripStatusList[i])) {
        await TripStatusHistory.create({ tripId: trip._id, previousStatus: 'ASSIGNED', newStatus: 'STARTED', changedBy: drivers[i]._id });
      }
      if (tripStatusList[i] === 'COMPLETED') {
        await TripStatusHistory.create({ tripId: trip._id, previousStatus: 'STARTED', newStatus: 'COMPLETED', changedBy: drivers[i]._id, reason: 'Delivery successful' });
      }
      trips.push(trip);
    }

    // ─── Fuel Entries ─────────────────────────────────────────────
    const fuelEntries = [];
    for (let i = 0; i < 15; i++) {
      const v = vehicles[i % vehicles.length];
      const d = drivers[i % drivers.length];
      const qty = 80 + Math.random() * 120;
      const price = 95 + Math.random() * 5;
      const fe = await FuelEntry.create({
        organizationId: org._id,
        branchId: v.branchId,
        vehicleId: v._id,
        driverId: d._id,
        date: pastDate(0.5 * i),
        fuelType: 'DIESEL',
        quantity: Math.round(qty * 100) / 100,
        pricePerUnit: Math.round(price * 100) / 100,
        odometer: v.currentMileage + i * 500,
        fuelStation: ['HPCL Jubilee Hills','BPCL Marathahalli','IndianOil Secunderabad','HPCL Whitefield'][i % 4],
        submittedBy: driverUsers[i % driverUsers.length]._id,
      });
      fuelEntries.push(fe);
    }

    // ─── Maintenance Records ──────────────────────────────────────
    const svcTypes = ['OIL_CHANGE','BRAKE_SERVICE','TIRE_REPLACEMENT','GENERAL_SERVICE','BATTERY_REPLACEMENT'];
    await Maintenance.create([
      { organizationId: org._id, branchId: branchHyd._id, vehicleId: vehicles[3]._id, serviceType: 'ENGINE_SERVICE', description: 'Major engine overhaul', scheduledDate: pastDate(1), completedDate: null, estimatedCost: 45000, status: 'IN_PROGRESS', vendor: { name: 'Tata Motors Service Center', phone: '9800000001' }, priority: 'HIGH', createdBy: branchMgrHyd._id },
      { organizationId: org._id, branchId: branchHyd._id, vehicleId: vehicles[0]._id, serviceType: 'OIL_CHANGE', description: 'Regular oil change & filter', scheduledDate: new Date(), estimatedCost: 3500, status: 'SCHEDULED', vendor: { name: 'QuickLube Hyderabad' }, priority: 'MEDIUM', createdBy: branchMgrHyd._id },
      { organizationId: org._id, branchId: branchHyd._id, vehicleId: vehicles[1]._id, serviceType: 'TIRE_REPLACEMENT', description: 'Front tires worn out', scheduledDate: pastDate(3), completedDate: pastDate(3), actualCost: 18000, status: 'COMPLETED', vendor: { name: 'Apollo Tyres' }, priority: 'HIGH', createdBy: branchMgrHyd._id },
      { organizationId: org._id, branchId: branchBng._id, vehicleId: vehicles[14]._id, serviceType: 'GENERAL_SERVICE', description: '10000 km service', scheduledDate: pastDate(0.5), completedDate: null, status: 'OVERDUE', estimatedCost: 8000, vendor: { name: 'BharatBenz Service' }, priority: 'URGENT', createdBy: branchMgrBng._id },
      { organizationId: org._id, branchId: branchBng._id, vehicleId: vehicles[10]._id, serviceType: 'BRAKE_SERVICE', description: 'Brake pad replacement', scheduledDate: futureDate(1), estimatedCost: 12000, status: 'SCHEDULED', vendor: { name: 'Volvo Service Center Bengaluru' }, priority: 'MEDIUM', createdBy: branchMgrBng._id },
    ]);

    // ─── Incidents ────────────────────────────────────────────────
    await Incident.create([
      { organizationId: org._id, branchId: branchHyd._id, vehicleId: vehicles[2]._id, driverId: drivers[2]._id, tripId: trips[2]._id, incidentDate: pastDate(0.2), location: { address: 'NH44, Kurnool bypass', city: 'Kurnool', state: 'Andhra Pradesh' }, incidentType: 'ACCIDENT', severity: 'HIGH', description: 'Minor collision with a two-wheeler at Kurnool bypass. Vehicle front bumper damaged. No injuries reported.', status: 'UNDER_INVESTIGATION', reportedBy: driverUsers[2]._id },
      { organizationId: org._id, branchId: branchHyd._id, vehicleId: vehicles[0]._id, driverId: drivers[0]._id, incidentDate: pastDate(2), location: { city: 'Hyderabad', state: 'Telangana' }, incidentType: 'BREAKDOWN', severity: 'MEDIUM', description: 'Engine overheating on Outer Ring Road. Vehicle towed to service center.', status: 'RESOLVED', resolution: 'Coolant leak fixed, thermostat replaced.', reportedBy: driverUsers[0]._id },
      { organizationId: org._id, branchId: branchBng._id, vehicleId: vehicles[11]._id, driverId: drivers[5]._id, incidentDate: pastDate(1), location: { city: 'Bengaluru', state: 'Karnataka' }, incidentType: 'TRAFFIC_VIOLATION', severity: 'LOW', description: 'Speed limit exceeded on NICE Road. Challan issued.', status: 'CLOSED', reportedBy: driverUsers[5]._id },
    ]);

    // ─── Expenses ─────────────────────────────────────────────────
    const expCategories = ['TOLL','PARKING','DRIVER_ALLOWANCE','FUEL','REPAIR'];
    const expStatuses = ['PENDING','APPROVED','REJECTED','PENDING','APPROVED'];
    for (let i = 0; i < 10; i++) {
      await Expense.create({
        organizationId: org._id,
        branchId: i < 6 ? branchHyd._id : branchBng._id,
        vehicleId: vehicles[i % vehicles.length]._id,
        driverId: drivers[i % drivers.length]._id,
        tripId: trips[i % trips.length]._id,
        category: expCategories[i % expCategories.length],
        amount: [450, 200, 500, 8500, 3200, 180, 500, 12000, 350, 800][i],
        date: pastDate(i * 0.3),
        description: ['Toll charges NH44', 'Parking at Hyderabad Dock', 'Per diem allowance', 'Emergency fuel fill', 'Minor tyre repair', 'Toll Bengaluru bypass', 'Driver allowance', 'Radiator hose repair', 'Parking charges', 'Toll NICE road'][i],
        submittedBy: driverUsers[i % driverUsers.length]._id,
        status: expStatuses[i % expStatuses.length],
        approvedBy: expStatuses[i % expStatuses.length] !== 'PENDING' ? finance1._id : null,
        rejectionReason: expStatuses[i % expStatuses.length] === 'REJECTED' ? 'Receipt not attached.' : null,
      });
    }

    // ─── Notifications ────────────────────────────────────────────
    await Notification.create([
      { userId: branchMgrHyd._id, organizationId: org._id, branchId: branchHyd._id, notificationType: 'MAINTENANCE_OVERDUE', title: 'Maintenance Overdue', message: 'Vehicle KA05CD8901 10000 km service is overdue.', isRead: false },
      { userId: branchMgrHyd._id, organizationId: org._id, branchId: branchHyd._id, notificationType: 'INSURANCE_EXPIRY', title: 'Insurance Expiring Soon', message: 'Vehicle TS09AB1234 insurance expires in 30 days.', isRead: false },
      { userId: driverUsers[0]._id, organizationId: org._id, branchId: branchHyd._id, notificationType: 'TRIP_ASSIGNED', title: 'New Trip Assigned', message: `You have been assigned trip ${trips[0].tripNumber}.`, isRead: true },
      { userId: fleetManager._id, organizationId: org._id, notificationType: 'INCIDENT_REPORTED', title: 'HIGH Incident Reported', message: 'A high severity incident has been reported in Kurnool.', isRead: false },
      { userId: driverUsers[2]._id, organizationId: org._id, branchId: branchHyd._id, notificationType: 'EXPENSE_APPROVED', title: 'Expense Approved', message: 'Your expense of ₹450 (TOLL) has been approved.', isRead: false },
    ]);

    // ─── Audit Logs ───────────────────────────────────────────────
    await AuditLog.create([
      { organizationId: org._id, userId: superAdmin._id, userName: superAdmin.name, userRole: 'SUPER_ADMIN', action: 'LOGIN', entity: 'User', ipAddress: '127.0.0.1' },
      { organizationId: org._id, userId: fleetManager._id, userName: fleetManager.name, userRole: 'FLEET_MANAGER', action: 'CREATE', entity: 'Vehicle', entityId: vehicles[0]._id, newData: { registrationNumber: vehicles[0].registrationNumber } },
      { organizationId: org._id, branchId: branchHyd._id, userId: branchMgrHyd._id, userName: branchMgrHyd.name, userRole: 'BRANCH_MANAGER', action: 'CREATE', entity: 'Trip', entityId: trips[0]._id, newData: { tripNumber: trips[0].tripNumber } },
      { organizationId: org._id, branchId: branchHyd._id, userId: finance1._id, userName: finance1.name, userRole: 'FINANCE_OFFICER', action: 'APPROVE', entity: 'Expense' },
    ]);

    console.log('\n✅ Seed data created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 DEMO ACCOUNTS (password for all: Demo@12345)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Super Admin    : admin@fleetsphere.demo');
    console.log('🚛 Fleet Manager  : manager@fleetsphere.demo');
    console.log('🏢 Branch Manager : branch@fleetsphere.demo  (Hyderabad)');
    console.log('🏢 Branch Manager : branch2@fleetsphere.demo (Bengaluru)');
    console.log('💰 Finance Officer: finance@fleetsphere.demo');
    console.log('🚗 Driver         : driver@fleetsphere.demo');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Created: 1 org, 2 branches, ${1+1+2+1+10} users, ${vehicles.length} vehicles, ${drivers.length} drivers, ${routes.length} routes, ${trips.length} trips\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
