const { RESULTS_LIMIT } = require('../constants/queryConstants');

class RequestQueryHandler {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Handle date and comparison operators first
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Create final query object
    let finalQuery = { ...parsedQuery };

    // Add search condition if it exists
    if (this.queryString.search) {
      const decodedSearchString = decodeURIComponent(this.queryString.search);
      const searchRegex = new RegExp(
        this.escapeRegex(decodedSearchString),
        'i',
      );
      finalQuery = {
        ...finalQuery,
        carModel: { $regex: searchRegex },
      };
    }

    // Handle completedAt sorting if needed
    if (
      queryStr.includes('completedAt') ||
      queryStr.includes('taskStatus') ||
      queryStr.includes('user') ||
      queryStr.includes('search')
    ) {
      this.query.sort(`-completedAt`);
    }

    // Apply the combined query
    this.query = this.query.find(finalQuery);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(`-${sortBy}`);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || RESULTS_LIMIT;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  escapeRegex(string) {
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
}
module.exports = RequestQueryHandler;
