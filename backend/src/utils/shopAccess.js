const mongoose = require('mongoose');

const toIdString = (id) => {
  if (!id) return '';
  return id.toString();
};

const userOwnsShop = (user, shopId) => {
  if (!user?.shops?.length || !shopId) return false;
  const target = toIdString(shopId);
  return user.shops.some((shopRef) => toIdString(shopRef) === target);
};

const toObjectId = (id) => {
  if (!id) return null;
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
};

module.exports = {
  userOwnsShop,
  toIdString,
  toObjectId,
};
