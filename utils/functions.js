module.exports = {
  escapeRegex: function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  },
};
