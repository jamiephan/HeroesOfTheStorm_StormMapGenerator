/**
 * @typedef {Object} ErrorResponse
 * @property {error} error true
 * @property {string} message The Error message provided
 */

/**
 * Generate Error Message Response JSON
 * @param {String} message The error message
 * @returns {ErrorResponse}
 */
module.exports = (message) => {
  return {
    error: true,
    message
  }
}