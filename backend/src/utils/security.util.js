/**
 * Detect SQL Injection Patterns
 */
function containsSQLInjection(input) {
  if (typeof input !== 'string') {return false;}


  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(UNION\s+SELECT)/gi,
    /(--|#|\/\*|\*\/)/g,                    // SQL comments
    /(\bOR\b\s+\d+\s*=\s*\d+)/gi,          // OR 1=1 patterns
    /(\bAND\b\s+\d+\s*=\s*\d+)/gi,         // AND 1=1 patterns
    /(\b(SLEEP|WAITFOR|BENCHMARK)\s*\(\s*\d+\s*\))/gi, // Time-based attacks
    /(\b(LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE)\b)/gi, // File operations
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect XSS Patterns
 */
function containsXSS(input) {
  if (typeof input !== 'string') {return false;}

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[^>]*>/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect Path Traversal Attempts
 */
function containsPathTraversal(input) {
  if (typeof input !== 'string') {return false;}

  const pathPatterns = [
    /\.\./g,
    /\.\.\/|\.\.%2F/gi,
    /%2e%2e/gi,
  ];

  return pathPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect Command Injection
 */
function containsCommandInjection(input) {
  if (typeof input !== 'string') {return false;}

  const cmdPatterns = [
    /[;&|`$()]/g,  // No escapes needed inside character class
    /\n/g,
    /\r/g,
  ];

  return cmdPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect NoSQL Injection
 */
function containsNoSQLInjection(input) {
  if (typeof input !== 'string') {return false;}

  const noSqlPatterns = [
    /\$where/gi,
    /\$ne/gi,
    /\$gt/gi,
    /\$lt/gi,
    /\$regex/gi,
    /\$or/gi,
    /\$and/gi,
  ];

  return noSqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect LDAP Injection
 */
function containsLDAPInjection(input) {
  if (typeof input !== 'string') {return false;}

  const ldapPatterns = [
    /\*/g,
    /\(/g,
    /\)/g,
    /\\/g,
    /\|/g,
    /&/g,
  ];

  return ldapPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect XML Injection
 */
function containsXMLInjection(input) {
  if (typeof input !== 'string') {return false;}

  const xmlPatterns = [
    /<!\[CDATA\[/gi,
    /<!ENTITY/gi,
    /<!DOCTYPE/gi,
  ];

  return xmlPatterns.some(pattern => pattern.test(input));
}

module.exports = {
  containsSQLInjection,
  containsXSS,
  containsPathTraversal,
  containsCommandInjection,
  containsNoSQLInjection,
  containsLDAPInjection,
  containsXMLInjection,
};
