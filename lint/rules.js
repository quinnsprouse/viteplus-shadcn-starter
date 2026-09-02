// Project-owned Oxlint rules that keep agents inside Rodeo's patterns.
// Loaded by `lint.jsPlugins` in vite.config.ts and by `plugins` in doctor.config.ts.
// Every rule reports a fix, and none can be silenced inline: disable directives are
// themselves banned, so exceptions live in `lint.overrides` where they are reviewed.
//
// Rule docs: docs/agents/LINT_RULES.md

import { definePlugin, defineRule } from "@oxlint/plugins";

const EFFECT_HOOKS = new Set(["useEffect", "useLayoutEffect", "useInsertionEffect"]);
const BROWSER_GLOBALS = new Set([
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "navigator",
  "location",
]);
const SUBSCRIPTION_CALLS = new Set([
  "setTimeout",
  "setInterval",
  "requestAnimationFrame",
  "requestIdleCallback",
  "addEventListener",
  "subscribe",
  "observe",
  "on",
]);
const DISABLE_DIRECTIVE = /^\s*((?:oxlint|eslint)-disable(?:-next-line|-line)?)/;
const ARBITRARY_HEX = /\[#[0-9a-fA-F]{3,8}\]/;
const INITIAL_PROP = /^(?:default|initial)[A-Z_]/;
const UI_KIT = /(?:^|\/)src\/components\/ui\//;

/** @param {import("@oxlint/plugins").ESTree.Node} node */
function isFunction(node) {
  return (
    node.type === "FunctionDeclaration" ||
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  );
}

/** @param {import("@oxlint/plugins").ESTree.Node} node */
function enclosingFunction(node) {
  let current = node.parent;
  while (current) {
    if (isFunction(current)) return current;
    current = current.parent;
  }
  return null;
}

/** @param {import("@oxlint/plugins").ESTree.Expression | import("@oxlint/plugins").ESTree.Super} callee */
function calleeName(callee) {
  if (callee.type === "Identifier") return callee.name;
  if (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property.type === "Identifier"
  ) {
    return callee.property.name;
  }
  return null;
}

/** Walk the chain `createServerFn(...).a(...).b(...)` back to its root and collect the method names. */
function chainMethods(call) {
  const methods = [];
  let current = call;
  while (current.type === "CallExpression") {
    const { callee } = current;
    if (
      callee.type === "MemberExpression" &&
      !callee.computed &&
      callee.property.type === "Identifier"
    ) {
      methods.push(callee.property.name);
      current = callee.object;
    } else if (callee.type === "Identifier") {
      return { root: callee.name, methods };
    } else {
      return { root: null, methods };
    }
  }
  return { root: null, methods };
}

/** Does any node in the subtree satisfy `predicate`? Skips `parent` back-references. */
function subtreeSome(node, predicate) {
  if (!node || typeof node.type !== "string") return false;
  if (predicate(node)) return true;
  for (const key of Object.keys(node)) {
    if (key === "parent") continue;
    const value = node[key];
    if (Array.isArray(value)) {
      if (
        value.some(
          (child) => child && typeof child.type === "string" && subtreeSome(child, predicate),
        )
      )
        return true;
    } else if (value && typeof value.type === "string" && subtreeSome(value, predicate)) {
      return true;
    }
  }
  return false;
}

/** Top-level return statements of a function body, not descending into nested functions. */
function topLevelReturns(body) {
  const returns = [];
  function visit(node) {
    if (!node || typeof node.type !== "string") return;
    if (node.type === "ReturnStatement") returns.push(node);
    if (isFunction(node)) return;
    for (const key of Object.keys(node)) {
      if (key === "parent") continue;
      const value = node[key];
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value.type === "string") visit(value);
    }
  }
  visit(body);
  return returns;
}

const noEffectHooks = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Ban useEffect, useLayoutEffect, and useInsertionEffect through every import shape; use useMountEffect.",
    },
    messages: {
      banned:
        "{{name}} is banned. Derive state, load data in a route loader, handle events in handlers, or use useMountEffect from @/hooks/use-mount-effect for mount-only sync. See docs/agents/REACT_PATTERNS.md",
    },
    schema: [],
  },
  create(context) {
    // Local names bound to an effect hook, so `import { useEffect as ue }` is caught too.
    const aliases = new Map();
    return {
      ImportDeclaration(node) {
        if (node.source.value !== "react") return;
        for (const specifier of node.specifiers) {
          if (
            specifier.type === "ImportSpecifier" &&
            specifier.imported.type === "Identifier" &&
            EFFECT_HOOKS.has(specifier.imported.name)
          ) {
            aliases.set(specifier.local.name, specifier.imported.name);
          }
        }
      },
      CallExpression(node) {
        const called = calleeName(node.callee);
        if (!called) return;
        const name = EFFECT_HOOKS.has(called) ? called : aliases.get(called);
        if (name) context.report({ node: node.callee, messageId: "banned", data: { name } });
      },
    };
  },
});

const noDisableDirectives = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Ban inline oxlint-disable and eslint-disable comments; exceptions belong in lint.overrides in vite.config.ts.",
    },
    messages: {
      directive:
        "Line {{line}} has an inline lint suppression ({{directive}}). Fix the code, or add a reviewed file-scoped exception under lint.overrides in vite.config.ts.",
    },
    schema: [],
  },
  create(context) {
    // Reported at the very start of the file, not at the comment: a directive would otherwise
    // suppress the diagnostic about itself. A zero-length span at 1:0 sits outside every range.
    const fileStart = { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } };
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const match = DISABLE_DIRECTIVE.exec(comment.value);
          if (match) {
            context.report({
              loc: fileStart,
              messageId: "directive",
              data: { line: String(comment.loc.start.line), directive: match[1] },
            });
          }
        }
      },
    };
  },
});

const serverFnRequiresValidator = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "A createServerFn handler that reads `data` must declare a validator so untrusted input is checked at the boundary.",
    },
    messages: {
      missing:
        "This server function reads `data` without a validator. Add .validator(fn) or .inputValidator(fn) before .handler(); see docs/agents/TANSTACK_START.md",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (calleeName(node.callee) !== "handler") return;
        const { root, methods } = chainMethods(node);
        if (root !== "createServerFn") return;
        if (methods.includes("validator") || methods.includes("inputValidator")) return;
        const handler = node.arguments[0];
        if (!handler || !isFunction(handler)) return;
        const [param] = handler.params;
        if (!param) return;
        const readsData =
          (param.type === "ObjectPattern" &&
            param.properties.some(
              (property) =>
                property.type === "Property" &&
                property.key.type === "Identifier" &&
                property.key.name === "data",
            )) ||
          (param.type === "Identifier" &&
            subtreeSome(
              handler.body,
              (candidate) =>
                candidate.type === "MemberExpression" &&
                candidate.object.type === "Identifier" &&
                candidate.object.name === param.name &&
                !candidate.computed &&
                candidate.property.type === "Identifier" &&
                candidate.property.name === "data",
            ));
        if (readsData) context.report({ node: node.callee, messageId: "missing" });
      },
    };
  },
});

const mountEffectCleanup = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "A useMountEffect callback that starts a timer, listener, or subscription must return a cleanup function, and must not be async.",
    },
    messages: {
      async:
        "useMountEffect callbacks cannot be async; an async function returns a Promise instead of a cleanup. Wrap the async work in an inner function and return a cleanup.",
      cleanup:
        "This useMountEffect starts {{call}} but never returns a cleanup function. Return () => {...} that clears the timer, removes the listener, or unsubscribes.",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (calleeName(node.callee) !== "useMountEffect") return;
        const callback = node.arguments[0];
        if (!callback || !isFunction(callback)) return;
        if (callback.async) {
          context.report({ node: callback, messageId: "async" });
          return;
        }
        let subscription = null;
        subtreeSome(callback.body, (candidate) => {
          if (candidate.type !== "CallExpression") return false;
          const name = calleeName(candidate.callee);
          if (name && SUBSCRIPTION_CALLS.has(name)) {
            subscription = name;
            return true;
          }
          return false;
        });
        if (!subscription) return;
        const returnsCleanup =
          callback.body.type !== "BlockStatement"
            ? isFunction(callback.body)
            : topLevelReturns(callback.body).some(
                (statement) =>
                  statement.argument &&
                  statement.argument.type !== "Literal" &&
                  !(
                    statement.argument.type === "Identifier" &&
                    statement.argument.name === "undefined"
                  ),
              );
        if (!returnsCleanup) {
          context.report({ node: node.callee, messageId: "cleanup", data: { call: subscription } });
        }
      },
    };
  },
});

const noHexColorsInClassName = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Ban arbitrary hex colors in className outside the shadcn kit; use the semantic tokens declared in src/styles/app.css.",
    },
    messages: {
      hex: "Arbitrary hex color in className. Use a semantic token such as text-brand or bg-primary from src/styles/app.css, or add a token there. See docs/agents/UI_MOTION.md",
    },
    schema: [],
  },
  create(context) {
    if (UI_KIT.test(context.filename)) return {};
    function check(node) {
      if (
        node.type === "Literal" &&
        typeof node.value === "string" &&
        ARBITRARY_HEX.test(node.value)
      ) {
        context.report({ node, messageId: "hex" });
      } else if (node.type === "TemplateLiteral") {
        for (const quasi of node.quasis) {
          if (ARBITRARY_HEX.test(quasi.value.raw))
            context.report({ node: quasi, messageId: "hex" });
        }
      } else if (node.type === "JSXExpressionContainer") {
        check(node.expression);
      } else if (node.type === "CallExpression") {
        node.arguments.forEach(check);
      } else if (node.type === "ConditionalExpression") {
        check(node.consequent);
        check(node.alternate);
      } else if (node.type === "LogicalExpression") {
        check(node.right);
      } else if (node.type === "ArrayExpression") {
        node.elements.forEach((element) => element && check(element));
      } else if (node.type === "ObjectExpression") {
        for (const property of node.properties) {
          if (property.type === "Property" && property.key.type === "Literal") check(property.key);
          if (property.type === "Property" && property.key.type === "TemplateLiteral")
            check(property.key);
        }
      }
    }
    return {
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier") return;
        if (node.name.name !== "className" && node.name.name !== "class") return;
        if (node.value) check(node.value);
      },
    };
  },
});

const noStateFromProps = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "useState seeded from a prop silently desyncs when the prop changes; derive the value, lift the state, or remount with key.",
    },
    messages: {
      prop: "useState is seeded from prop `{{name}}`, which will not update when the prop changes. Derive it during render, lift the state to the parent, or pass key= to remount. Props named default*/initial* are exempt. See docs/agents/REACT_PATTERNS.md",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (calleeName(node.callee) !== "useState") return;
        const [initial] = node.arguments;
        if (!initial) return;
        const component = enclosingFunction(node);
        if (!component) return;
        const [param] = component.params;
        if (!param) return;
        let propName = null;
        if (
          initial.type === "Identifier" &&
          param.type === "ObjectPattern" &&
          param.properties.some(
            (property) =>
              property.type === "Property" &&
              property.value.type === "Identifier" &&
              property.value.name === initial.name,
          )
        ) {
          propName = initial.name;
        } else if (
          initial.type === "MemberExpression" &&
          !initial.computed &&
          initial.object.type === "Identifier" &&
          param.type === "Identifier" &&
          initial.object.name === param.name &&
          initial.property.type === "Identifier"
        ) {
          propName = initial.property.name;
        }
        if (propName && !INITIAL_PROP.test(propName)) {
          context.report({ node: initial, messageId: "prop", data: { name: propName } });
        }
      },
    };
  },
});

const noModuleScopeBrowserGlobals = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Browser globals touched at module scope crash on the server during SSR; read them inside a handler, useMountEffect, or a typeof guard.",
    },
    messages: {
      ssr: "`{{name}}` is read at module scope, which throws during server rendering. Move the read into a function that runs in the browser, or guard it with typeof {{name}} !== 'undefined'.",
    },
    schema: [],
  },
  create(context) {
    return {
      Identifier(node) {
        if (!BROWSER_GLOBALS.has(node.name)) return;
        const { parent } = node;
        if (!parent) return;
        if (parent.type === "MemberExpression" && parent.property === node && !parent.computed)
          return;
        if (parent.type === "Property" && parent.key === node && !parent.computed) return;
        if (parent.type === "UnaryExpression" && parent.operator === "typeof") return;
        if (parent.type === "ImportSpecifier" || parent.type === "ImportDefaultSpecifier") return;
        if (parent.type.startsWith("TS")) return;
        if (parent.type === "VariableDeclarator" && parent.id === node) return;
        if (enclosingFunction(node)) return;
        const scope = context.sourceCode.getScope(node);
        const declared = scope.references.some(
          (reference) => reference.identifier === node && reference.resolved !== null,
        );
        if (declared) return;
        context.report({ node, messageId: "ssr", data: { name: node.name } });
      },
    };
  },
});

/** `location`, `window.location`, or `globalThis.location`. */
function isLocation(node) {
  if (node.type === "Identifier") return node.name === "location";
  return (
    node.type === "MemberExpression" &&
    !node.computed &&
    node.object.type === "Identifier" &&
    (node.object.name === "window" || node.object.name === "globalThis") &&
    node.property.type === "Identifier" &&
    node.property.name === "location"
  );
}

const noWindowNavigation = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Navigate with the router, not window.location; hard navigations drop router state, loaders, and preloading.",
    },
    messages: {
      navigate:
        "Use the router instead of window.location: useNavigate() or <Link> from @tanstack/react-router keeps loaders, search params, and preloading working. See docs/agents/TANSTACK_START.md",
    },
    schema: [],
  },
  create(context) {
    return {
      AssignmentExpression(node) {
        const target = node.left;
        if (target.type !== "MemberExpression") return;
        if (isLocation(target)) {
          context.report({ node, messageId: "navigate" });
          return;
        }
        if (
          !target.computed &&
          target.property.type === "Identifier" &&
          (target.property.name === "href" || target.property.name === "pathname") &&
          isLocation(target.object)
        ) {
          context.report({ node, messageId: "navigate" });
        }
      },
      CallExpression(node) {
        const { callee } = node;
        if (
          callee.type === "MemberExpression" &&
          !callee.computed &&
          callee.property.type === "Identifier" &&
          (callee.property.name === "assign" || callee.property.name === "replace") &&
          isLocation(callee.object)
        ) {
          context.report({ node, messageId: "navigate" });
        }
      },
    };
  },
});

export default definePlugin({
  meta: { name: "rodeo" },
  rules: {
    "no-effect-hooks": noEffectHooks,
    "no-disable-directives": noDisableDirectives,
    "server-fn-requires-validator": serverFnRequiresValidator,
    "mount-effect-cleanup": mountEffectCleanup,
    "no-hex-colors-in-classname": noHexColorsInClassName,
    "no-state-from-props": noStateFromProps,
    "no-module-scope-browser-globals": noModuleScopeBrowserGlobals,
    "no-window-navigation": noWindowNavigation,
  },
});
