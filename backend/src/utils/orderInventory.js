const Product = require('../models/Product');

const reserveInventoryForOrder = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || product.productType !== 'stock' || !product.inventory) {
      continue;
    }
    if (product.inventory.quantity < item.quantity) {
      throw new Error(`Insufficient inventory for ${product.name}`);
    }
    product.inventory.quantity -= item.quantity;
    await product.save();
  }
};

const restoreInventoryForOrder = async (items) => {
  for (const item of items) {
    try {
      const product = await Product.findById(item.product);
      if (product && product.productType === 'stock' && product.inventory) {
        product.inventory.quantity += item.quantity;
        await product.save();
      }
    } catch (error) {
      console.error(`Error restoring inventory for product ${item.product}:`, error);
    }
  }
};

module.exports = {
  reserveInventoryForOrder,
  restoreInventoryForOrder,
};
