const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const getPaginationMeta = (total, page, limit) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };
};

const buildSortObject = (sortBy, sortOrder = 'desc') => {
  const order = sortOrder === 'asc' ? 1 : -1;
  return { [sortBy || 'createdAt']: order };
};

const buildSearchFilter = (searchTerm, fields) => {
  if (!searchTerm) return {};
  const regex = new RegExp(searchTerm, 'i');
  return { $or: fields.map((f) => ({ [f]: regex })) };
};

module.exports = { getPaginationParams, getPaginationMeta, buildSortObject, buildSearchFilter };
