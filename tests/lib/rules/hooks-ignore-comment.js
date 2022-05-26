/**
 * @fileoverview qdwqd
 * @author Erik Hellman
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/hooks-ignore-comment"),
  RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run("hooks-ignore-comment", rule, {
  valid: [
    {
      code: `
function MyComponent(props) {
  var asd = useCallback(function() {
     var wut = 123;
     wut;
     // descriptive comment
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props])
}      
      `.trim(),
      errors: [{ message: "Fill me in.", type: "Me too" }],
    },
  ],

  invalid: [
    {
      code: `
function MyComponent(props) {
  var asd = useCallback(function() {
     var wut = 123;
     wut;
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props])
}      
      `.trim(),
      errors: [{ message: "Fill me in.", type: "Me too" }],
    },
  ],
});
