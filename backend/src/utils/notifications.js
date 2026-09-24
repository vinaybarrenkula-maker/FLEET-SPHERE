const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (data) => {
  try {
    await Notification.create(data);
  } catch (err) {
    console.error('Notification create error:', err.message);
  }
};

const sendNotificationToRole = async (organizationId, branchId, roles, notificationData) => {
  try {
    const filter = { organizationId, status: 'ACTIVE', role: { $in: Array.isArray(roles) ? roles : [roles] } };
    if (branchId) filter.branchId = branchId;

    const users = await User.find(filter).select('_id');
    const notifications = users.map((u) => ({
      ...notificationData,
      userId: u._id,
      organizationId,
      branchId: branchId || null,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications, { ordered: false });
    }
  } catch (err) {
    console.error('sendNotificationToRole error:', err.message);
  }
};

const sendNotificationToUser = async (userId, organizationId, branchId, notificationData) => {
  try {
    await Notification.create({ ...notificationData, userId, organizationId, branchId });
  } catch (err) {
    console.error('sendNotificationToUser error:', err.message);
  }
};

module.exports = { createNotification, sendNotificationToRole, sendNotificationToUser };
