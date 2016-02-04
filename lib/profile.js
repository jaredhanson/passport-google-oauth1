/**
 * Parse profile.
 *
 * @param {object|string} json
 * @return {object}
 * @api public
 */
exports.parse = function(json) {
  if ('string' == typeof json) {
    json = JSON.parse(json);
  }
  
  var profile = {};
  profile.id = json.feed.id['$t']
  profile.displayName = json.feed.author[0].name['$t'];
  profile.emails = [{ value: json.feed.author[0].email['$t'] }];
  
  return profile;
};
