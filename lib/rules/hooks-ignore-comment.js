/**
 * @fileoverview qdwqd
 * @author Erik Hellman
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

// my rule
const ESLINT_RULE_PATTERN =
  /^\s*(?:eslint|jshint\s+|jslint\s+|istanbul\s+|globals?\s+|exported\s+|jscs)/u;
const RULES_OF_HOOKS_RULE_PATTERN = /(eslint).*(react-hooks\/rules-of-hooks)/u;
const EXHAUSTIVE_DEPS_RULE_PATTERN =
  /(eslint).*(react-hooks\/exhaustive-deps)/u;

function isComment(token) {
  return token.type === "Line" || token.type === "Block";
}

function insertTextAt(index, text) {
  return {
    range: [index, index],
    text,
  };
}

function insertTextBeforeRange(range, text) {
  return insertTextAt(range[0], text);
}

function isEslintRule(token) {
  return ESLINT_RULE_PATTERN.test(token.value);
}

function isExhaustiveDepsRule(token) {
  return EXHAUSTIVE_DEPS_RULE_PATTERN.test(token.value);
}

function isRulesOfHooksRule(token) {
  return RULES_OF_HOOKS_RULE_PATTERN.test(token.value);
}

function getCommentsLineNumbers(comments) {
  let lines = [];

  comments.forEach((token) => {
    lines.push(token.loc.start.line, token.loc.end.line);
  });

  return lines;
  // return and remove duplicates
  //return [...new Set(lines)];
}

function getEmptyLineNumbers(lines) {
  const emptyLines = lines
    .map((line, i) => ({
      code: line.trim(),
      num: i + 1,
    }))
    .filter((line) => !line.code)
    .map((line) => line.num);

  return emptyLines;
}

/**
 * @type {import('eslint').Rule.RuleModule}
 */
module.exports = {
  meta: {
    type: "suggestion", // `problem`, `suggestion`, or `layout`
    docs: {
      description: "qdwqd",
      category: "Fill me in",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: "code", // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },

  create(context) {
    // variables should be defined here
    const sourceCode = context.getSourceCode();
    const comments = sourceCode.getAllComments();
    const options = Object.assign({}, context.options[0]);

    const emptyLines = getEmptyLineNumbers(sourceCode.lines);
    const commentLineNumbers = getCommentsLineNumbers(comments);

    const commentsAndEmptyLines = new Set([
      ...emptyLines,
      ...commentLineNumbers,
    ]);

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      Program() {
        comments.forEach((token) => {
          const lineStart = token.range[0] - token.loc.start.column;
          const range = [lineStart, lineStart];
          const lineNumber = token.loc.start.line;
          const prevLineNumber = lineNumber - 1;

          if (prevLineNumber < 1) return; // test this

          const prevLineIsEmpty = emptyLines.includes(prevLineNumber);

          const prevToken = sourceCode.getTokenBefore(token, {
            includeComments: true,
          });

          // 1. Look for ESLint rule
          if (isEslintRule(token)) {
            // 2. Look for Exhaustive Deps rule
            if (isExhaustiveDepsRule(token)) {
              // 3. Check if the token before is a comment and not an ESLint comment
              if (isComment(prevToken) && !isEslintRule(prevToken)) {
                return;
              }
              // 4. Token before is not a comment, continue.
              // 5. Throw error, all exhaustive-deps ignores should have a descriptive comment before it.
              context.report({
                node: token,
                message:
                  "You are ignoring react-hooks/exhaustive-deps without providing an explanation as to why. Please remember that you should only ignore the react-hooks/exhaustive-deps rule if you know exactly what you are doing. If your code triggers this ESLint rule you are most likely doing something wrong.",
                fix(fixer) {
                  return fixer.insertTextBeforeRange(
                    range,
                    "// Write a comment describing why you are ignoring react-hooks/exhaustive-deps her...\n"
                  );
                },
              });
            }
            // 2. Look for Rules of Hooks rule
            if (isRulesOfHooksRule(token)) {
              // 3. Check if the token before is a comment and not an ESLint comment
              if (isComment(prevToken) && !isEslintRule(prevToken)) {
                return;
              }
              // 4. Token before is not a comment, continue.
              // 5. Throw error, all rules-of-hooks ignores should have a descriptive comment before it.
              context.report({
                node: token,
                message:
                  "You are ignoring react-hooks/rules-of-hooks without providing an explanation as to why. Please remember that you should only ignore the react-hooks/exhaustive-deps rule if you know exactly what you are doing. If your code triggers this ESLint rule you are most likely doing something wrong.",
                fix(fixer) {
                  return fixer.insertTextBeforeRange(
                    range,
                    "// Write a comment describing why you are ignoring react-hooks/rules-of-hooks here...\n"
                  );
                },
              });
            }
          }
        });
      },
    };
  },
};
