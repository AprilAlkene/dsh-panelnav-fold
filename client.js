/**
 * Collapsible panel navigation.
 *
 * The left column collapses as a whole (ui-sidebar owns `sidebar`) and the
 * global panel list has no fold of its own. This adds one: a sidebar-foot row
 * flips a root attribute, and one CSS rule hides the framework-marked
 * `sidebar.panellist` slot. Nothing else on the column moves.
 *
 * ponytail: relies on the host's `data-slot="<slot key>"` marker (the same
 * convention dsh-cost-meter / dsh-mcp-connector style against). If a future
 * host stops marking that slot the toggle still works but hides nothing; the
 * upgrade path is a native collapsed state on the panellist slot, which the
 * host does not expose today.
 */
window.__ModuleLoader__.load({
  id: 'dsh-panelnav-fold',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const STORAGE_KEY = 'dsh.panelnavFold';
    const ROOT_ATTR = 'data-dsh-panelnav-fold';
    const NAMESPACE = 'panelnav-fold';
    const FALLBACK = { collapse: '收起导航', expand: '展开导航' };

    const CSS = `
.panelnav-fold-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  height: 38px;
  margin: 2px 0;
  padding: 0 var(--dsh-sidebar-inline-padding, 12px);
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: inherit;
  font: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
}
.panelnav-fold-row:hover {
  background: rgba(127, 127, 127, 0.12);
}
.panelnav-fold-row:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -2px;
}
.panelnav-fold-row > svg {
  flex: none;
  opacity: 0.8;
  transition: transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.panelnav-fold-row[aria-expanded="false"] > svg {
  transform: rotate(180deg);
}

/* Height animates through auto: interpolate-size lets the browser interpolate
   the intrinsic height, so no magic max-height is needed. Browsers without it
   simply jump, which is the pre-plugin behavior. */
nav[class*="_panelList"],
nav[aria-label="全局面板"],
nav[aria-label="Global panels"] {
  interpolate-size: allow-keywords;
  overflow: hidden;
  transition:
    height 200ms cubic-bezier(0.2, 0.8, 0.2, 1),
    margin-bottom 200ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 160ms ease;
}
html[${ROOT_ATTR}] nav[class*="_panelList"],
html[${ROOT_ATTR}] nav[aria-label="全局面板"],
html[${ROOT_ATTR}] nav[aria-label="Global panels"] {
  height: 0;
  margin-bottom: 0;
  opacity: 0;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .panelnav-fold-row > svg,
  nav[class*="_panelList"] {
    transition: none;
  }
}
`;

    function readFolded() {
      try {
        return window.localStorage.getItem(STORAGE_KEY) === '1';
      } catch {
        return false;
      }
    }

    function writeFolded(folded) {
      try {
        window.localStorage.setItem(STORAGE_KEY, folded ? '1' : '0');
      } catch {
        /* private mode: the fold still holds for this session */
      }
    }

    function reflect(folded) {
      const root = document.documentElement;
      if (folded) root.setAttribute(ROOT_ATTR, '');
      else root.removeAttribute(ROOT_ATTR);
    }

    function chevron() {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: 16,
          height: 16,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
        },
        h('path', { d: 'M4 10l4-4 4 4' }),
      );
    }

    function Toggle({ t }) {
      const [folded, setFolded] = React.useState(readFolded);
      React.useEffect(() => {
        reflect(folded);
      }, [folded]);
      const label = t(folded ? 'expand' : 'collapse');
      return h(
        'button',
        {
          type: 'button',
          className: 'panelnav-fold-row',
          title: label,
          'aria-label': label,
          'aria-expanded': !folded,
          onClick: () => {
            const next = !folded;
            writeFolded(next);
            setFolded(next);
          },
        },
        chevron(),
        h('span', null, label),
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        reflect(readFolded());

        ctx.effect(() => {
          const style = document.createElement('style');
          style.setAttribute('data-dsh-panelnav-fold', '');
          style.textContent = CSS;
          document.head.appendChild(style);
          return () => style.remove();
        }, 'panelnav-fold: styles');

        let translate;
        ctx.effect(() => {
          const disposers = [];
          try {
            disposers.push(
              ctx.locale.register(NAMESPACE, {
                zh: FALLBACK,
                en: { collapse: 'Collapse navigation', expand: 'Expand navigation' },
              }),
            );
          } catch {
            /* locale is optional; FALLBACK carries both labels */
          }
          try {
            translate = ctx.locale.bind(NAMESPACE);
          } catch {
            translate = undefined;
          }
          return () => {
            translate = undefined;
            for (const dispose of disposers) {
              try {
                dispose();
              } catch {
                /* already disposed */
              }
            }
          };
        }, 'panelnav-fold: locale');

        const t = (key) => {
          try {
            const text = translate ? translate(key) : undefined;
            return text && text !== key ? text : FALLBACK[key];
          } catch {
            return FALLBACK[key];
          }
        };
        const ToggleRow = () => h(Toggle, { t });

        ctx.slots.inject('sidebar.footer.action', () =>
          ctx.slots.register(
            {
              name: 'sidebar.footer.action',
              id: 'panelnav-fold',
              order: 10,
              locale: NAMESPACE,
              label: () => t(readFolded() ? 'expand' : 'collapse'),
            },
            ToggleRow,
          ),
        );
      },
    };
  },
});
