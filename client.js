window.__ModuleLoader__.load({
  id: '@local/yuque-notes',
  factory(require) {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const h = React.createElement;
    const { useState, useCallback, useEffect, useLayoutEffect, useRef } = React;
    const createPortal = ReactDOM.createPortal;

    const DOCK_ID = 'yuque-notes-dock';
    const NS = 'yuqueNotes';

    const en = {
      title: 'Yuque notes',
      dockOpen: 'Yuque note',
      dockClose: 'Close',
      placeholder: 'Write the note to publish…',
      send: 'Send',
      sendShortcut: '⌘/Ctrl+Enter',
      sending: 'Publishing…',
      sent: 'Published.',
      sendFail: 'Publish failed.',
      noSession: 'No chat session is available yet. Open any chat once, then try again.',
      noRemote: 'Remote command bridge is unavailable. Reload the page and try again.',
      empty: 'Note content is empty.',
      selectionCapture: 'Save to Yuque note',
      selectionCapturing: 'Saving…',
      selectionCaptured: 'Saved to Yuque note.',
    };
    const zh = {
      title: '语雀小记',
      dockOpen: '语雀小记',
      dockClose: '收起',
      placeholder: '写你想记的内容…',
      send: '发送',
      sendShortcut: '⌘/Ctrl+Enter',
      sending: '正在发布…',
      sent: '已发布。',
      sendFail: '发布失败。',
      noSession: '当前还没有可用对话。先打开任意一个对话一次，再试一次。',
      noRemote: '远程命令桥不可用，请刷新页面后重试。',
      empty: '内容为空。',
      selectionCapture: '记录到小记',
      selectionCapturing: '正在记录…',
      selectionCaptured: '已记录到小记。',
    };

    const YUQUE_BIRD_SRC = 'data:image/png;base64,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';

    function PanelIcon({ size }) {
      return h('img', {
        src: YUQUE_BIRD_SRC,
        width: size,
        height: size,
        alt: '',
        'aria-hidden': true,
        style: {
          display: 'block',
          width: size,
          height: size,
          objectFit: 'contain',
          flex: '0 0 auto',
        },
      });
    }

    function buildCommand(text) {
      const body = String(text || '').replace(/^\s+/, '').replace(/\s+$/, '');
      if (!body) return '';
      return `/yuque-note ${body}`;
    }

    function isSendHotkey(event) {
      if (!event) return false;
      if (event.key !== 'Enter' && event.key !== 'NumpadEnter') return false;
      // macOS: Meta+Enter; Windows/Linux: Ctrl+Enter
      return !!(event.metaKey || event.ctrlKey);
    }

    function pickSessionId(snapshot, preferred) {
      if (preferred) return preferred;
      if (!snapshot || typeof snapshot !== 'object') return undefined;
      if (snapshot.current) return snapshot.current;
      const byId = snapshot.byId;
      if (!byId || typeof byId !== 'object') return undefined;
      const rows = Object.values(byId).filter(Boolean);
      if (rows.length === 0) return undefined;
      const scored = rows.map((row) => ({
        id: row.id || row.sessionId,
        removed: row.removed === true,
        updatedAt: typeof row.updatedAt === 'number' ? row.updatedAt : 0,
      })).filter((row) => row.id);
      scored.sort((a, b) => {
        if (a.removed !== b.removed) return a.removed ? 1 : -1;
        return b.updatedAt - a.updatedAt;
      });
      return scored.length > 0 ? scored[0].id : undefined;
    }

    async function executeYuqueNote(sessionId, command, t) {
      const remote = (typeof ctx !== 'undefined' && ctx.get) ? ctx.get('remote') : null;
      const execute = remote && remote.commands && typeof remote.commands.execute === 'function'
        ? remote.commands.execute.bind(remote.commands)
        : null;
      if (!execute) {
        return { ok: false, message: t('noRemote') };
      }
      const remoteResult = await execute(sessionId, command, []);
      if (!remoteResult || remoteResult.ok === false) {
        const err = remoteResult && remoteResult.error ? remoteResult.error : null;
        const message = err
          ? `${err.message || t('sendFail')}${err.code ? ` (${err.code})` : ''}`
          : t('sendFail');
        return { ok: false, message };
      }
      const execution = remoteResult.value;
      if (execution === undefined || execution === null) {
        return { ok: false, message: `${t('sendFail')} unknown command: /yuque-note` };
      }
      const result = execution.result || execution;
      if (result && result.kind === 'error') {
        return { ok: false, message: result.text || t('sendFail') };
      }
      return { ok: true, message: (result && result.text) ? result.text : t('sent') };
    }

    function usePublishForm({ t, sessionId, useSessions, onSuccess }) {
      const [text, setText] = useState('');
      const [status, setStatus] = useState('');
      const [statusKind, setStatusKind] = useState('info');
      const [busy, setBusy] = useState(false);

      const sessionsSnapshot = useSessions ? useSessions((s) => s) : undefined;

      const sendNote = useCallback(async () => {
        const command = buildCommand(text);
        if (!command) {
          setStatusKind('error');
          setStatus(t('empty'));
          return;
        }
        const targetSession = pickSessionId(sessionsSnapshot, sessionId);
        if (!targetSession) {
          setStatusKind('error');
          setStatus(t('noSession'));
          return;
        }

        setBusy(true);
        setStatusKind('info');
        setStatus(t('sending'));
        try {
          const outcome = await executeYuqueNote(targetSession, command, t);
          setStatusKind(outcome.ok ? 'ok' : 'error');
          setStatus(outcome.message);
          if (outcome.ok) {
            setText('');
            if (typeof onSuccess === 'function') onSuccess(outcome);
          }
        } catch (error) {
          setStatusKind('error');
          setStatus(error && error.message ? error.message : String(error));
        } finally {
          setBusy(false);
        }
      }, [text, sessionsSnapshot, sessionId, t, onSuccess]);

      return {
        text,
        setText,
        status,
        statusKind,
        busy,
        sendNote,
      };
    }

    function statusColor(kind) {
      if (kind === 'error') return 'var(--dsw-alias-label-danger, #c23)';
      if (kind === 'ok') return 'var(--dsw-alias-label-success, #1a7f37)';
      return 'var(--dsw-alias-label-secondary)';
    }

    function ComposerDock({ t, sessionId, useSessions }) {
      const [open, setOpen] = useState(false);
      const [panelPos, setPanelPos] = useState(null);
      const anchorRef = useRef(null);
      const panelRef = useRef(null);
      const textareaRef = useRef(null);
      const closeAfterSuccess = useCallback(() => {
        setOpen(false);
      }, []);
      const form = usePublishForm({
        t,
        sessionId,
        useSessions,
        onSuccess: closeAfterSuccess,
      });

      const updatePanelPos = useCallback(() => {
        const anchor = anchorRef.current;
        if (!anchor || typeof anchor.getBoundingClientRect !== 'function') return;
        const rect = anchor.getBoundingClientRect();
        const width = Math.min(360, Math.max(280, window.innerWidth - 24));
        // Horizontally center the panel over the dock button.
        let left = rect.left + (rect.width / 2) - (width / 2);
        left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
        const gap = 8;
        const panel = panelRef.current;
        const height = panel && typeof panel.getBoundingClientRect === 'function'
          ? panel.getBoundingClientRect().height
          : 220;
        // Prefer directly above the icon; fall back below only if clipped.
        let top = rect.top - height - gap;
        if (top < 12) top = rect.bottom + gap;
        setPanelPos({
          position: 'fixed',
          top,
          left,
          width,
          zIndex: 10050,
        });
      }, []);

      useLayoutEffect(() => {
        if (!open) return undefined;
        updatePanelPos();
        // Re-measure after paint so we use the real panel height.
        const raf = window.requestAnimationFrame(() => updatePanelPos());
        const onWin = () => updatePanelPos();
        window.addEventListener('resize', onWin);
        window.addEventListener('scroll', onWin, true);
        return () => {
          window.cancelAnimationFrame(raf);
          window.removeEventListener('resize', onWin);
          window.removeEventListener('scroll', onWin, true);
        };
      }, [open, updatePanelPos, form.status, form.text]);

      useEffect(() => {
        if (open && textareaRef.current && typeof textareaRef.current.focus === 'function') {
          textareaRef.current.focus();
        }
      }, [open]);

      useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = (event) => {
          const target = event.target;
          if (anchorRef.current && anchorRef.current.contains(target)) return;
          if (panelRef.current && panelRef.current.contains(target)) return;
          if (!form.busy) setOpen(false);
        };
        const onKeyDown = (event) => {
          if (event.key === 'Escape' && !form.busy) {
            setOpen(false);
            return;
          }
          // Allow ⌘/Ctrl+Enter from anywhere while the note panel is open.
          if (!isSendHotkey(event) || form.busy) return;
          const target = event.target;
          const inPanel = panelRef.current && panelRef.current.contains(target);
          const inAnchor = anchorRef.current && anchorRef.current.contains(target);
          if (!inPanel && !inAnchor && target !== document.body) return;
          event.preventDefault();
          event.stopPropagation();
          form.sendNote();
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
          document.removeEventListener('mousedown', onPointerDown);
          document.removeEventListener('keydown', onKeyDown);
        };
      }, [open, form.busy, form.sendNote]);

      // Flex order > ContextMeter's default 0, so this sits to the right of the % meter.
      const trigger = h('button', {
        ref: anchorRef,
        type: 'button',
        onClick: () => setOpen((value) => !value),
        title: t('dockOpen'),
        'aria-expanded': open ? 'true' : 'false',
        style: {
          appearance: 'none',
          border: '1px solid var(--dsw-alias-border-l1)',
          borderRadius: 999,
          padding: '4px 10px',
          minHeight: 22,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1,
          cursor: 'pointer',
          background: open
            ? 'var(--dsw-alias-bg-brand-soft, var(--dsw-alias-bg-layer-2, #e8f5f3))'
            : 'var(--dsw-alias-bg-layer-1)',
          color: 'var(--dsw-alias-label-primary)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          flex: '0 0 auto',
        },
      },
        h(PanelIcon, { size: 14 }),
        t('dockOpen'),
      );

      const panel = open && panelPos && typeof document !== 'undefined'
        ? createPortal(
          h('div', {
            ref: panelRef,
            style: {
              ...panelPos,
              boxSizing: 'border-box',
              padding: 12,
              borderRadius: 12,
              border: '1px solid var(--dsw-alias-border-l1)',
              background: 'var(--dsw-alias-bg-layer-1)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            },
          },
            h('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              },
            },
              h('div', {
                style: {
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--dsw-alias-label-primary)',
                },
              },
                h(PanelIcon, { size: 16 }),
                t('title'),
              ),
              h('button', {
                type: 'button',
                onClick: () => setOpen(false),
                disabled: form.busy,
                style: {
                  appearance: 'none',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--dsw-alias-label-secondary)',
                  cursor: form.busy ? 'wait' : 'pointer',
                  fontSize: 12,
                  padding: '4px 6px',
                },
              }, t('dockClose')),
            ),
            h('textarea', {
              ref: textareaRef,
              value: form.text,
              onChange: (event) => form.setText(event.target.value),
              onKeyDown: (event) => {
                if (!isSendHotkey(event) || form.busy) return;
                event.preventDefault();
                event.stopPropagation();
                form.sendNote();
              },
              placeholder: t('placeholder'),
              rows: 4,
              disabled: form.busy,
              style: {
                boxSizing: 'border-box',
                width: '100%',
                resize: 'vertical',
                minHeight: 88,
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--dsw-alias-border-l1)',
                background: 'var(--dsw-alias-bg-base)',
                color: 'var(--dsw-alias-label-primary)',
                fontSize: 13,
                lineHeight: 1.5,
                fontFamily: 'inherit',
                outline: 'none',
                opacity: form.busy ? 0.7 : 1,
              },
            }),
            h('div', {
              style: {
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexWrap: 'wrap',
              },
            },
              h('button', {
                type: 'button',
                onClick: form.sendNote,
                disabled: form.busy,
                title: t('sendShortcut'),
                style: {
                  appearance: 'none',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: form.busy ? 'wait' : 'pointer',
                  background: 'var(--dsw-alias-bg-brand, #0f766e)',
                  color: 'var(--dsw-alias-label-on-brand, #fff)',
                  opacity: form.busy ? 0.75 : 1,
                },
              }, form.busy ? t('sending') : t('send')),
              h('span', {
                style: {
                  fontSize: 11,
                  color: 'var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary))',
                },
              }, t('sendShortcut')),
              form.status
                ? h('span', {
                  style: {
                    fontSize: 12,
                    lineHeight: 1.4,
                    color: statusColor(form.statusKind),
                    whiteSpace: 'pre-wrap',
                  },
                }, form.status)
                : null,
            ),
          ),
          document.body,
        )
        : null;

      return h('div', {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          // Place after ContextMeter (default flex order 0) inside the dock row.
          order: 1,
          flex: '0 0 auto',
        },
      }, trigger, panel);
    }


    function isInsideConversation(node) {
      if (!node || typeof node.closest !== 'function') {
        // Text nodes: climb to element.
        node = node && node.parentElement ? node.parentElement : null;
      }
      if (!node || typeof node.closest !== 'function') return false;
      return !!(node.closest('[data-conversation-scroll]')
        || node.closest('[data-slot="conversation.chat.flow"]')
        || node.closest('[data-slot="conversation.session"]'));
    }

    function selectionBottomRight(range) {
      if (!range || typeof range.getClientRects !== 'function') return null;
      const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 0 || rect.height > 0);
      if (rects.length === 0) {
        const fallback = typeof range.getBoundingClientRect === 'function'
          ? range.getBoundingClientRect()
          : null;
        if (!fallback || (fallback.width <= 0 && fallback.height <= 0)) return null;
        return { left: fallback.right, top: fallback.bottom };
      }
      // Prefer the last visible line's bottom-right corner of the selection.
      let best = rects[0];
      for (let i = 1; i < rects.length; i += 1) {
        const rect = rects[i];
        if (rect.bottom > best.bottom + 0.5 || (Math.abs(rect.bottom - best.bottom) <= 0.5 && rect.right > best.right)) {
          best = rect;
        }
      }
      return { left: best.right, top: best.bottom };
    }

    function readConversationSelection() {
      if (typeof document === 'undefined' || !document.getSelection) return null;
      const selection = document.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount < 1) return null;
      const text = String(selection.toString() || '').replace(/^\s+/, '').replace(/\s+$/, '');
      if (!text) return null;
      const range = selection.getRangeAt(0);
      const common = range.commonAncestorContainer;
      if (!isInsideConversation(common)) return null;
      const anchor = selectionBottomRight(range);
      if (!anchor) return null;
      return { text, anchor };
    }

    function SelectionQuickCapture({ t, useSessions }) {
      const [selectedText, setSelectedText] = useState('');
      const [anchor, setAnchor] = useState(null);
      const [busy, setBusy] = useState(false);
      const [status, setStatus] = useState('');
      const [statusKind, setStatusKind] = useState('info');
      const [layoutTick, setLayoutTick] = useState(0);
      const hideTimerRef = useRef(null);
      const floatRef = useRef(null);
      const sessionsSnapshot = useSessions ? useSessions((s) => s) : undefined;

      useLayoutEffect(() => {
        if (!selectedText && !status) return undefined;
        const raf = window.requestAnimationFrame(() => setLayoutTick((value) => value + 1));
        return () => window.cancelAnimationFrame(raf);
      }, [selectedText, status, anchor]);
      void layoutTick;

      const refreshSelection = useCallback(() => {
        if (busy) return;
        const next = readConversationSelection();
        if (!next) {
          setSelectedText('');
          setAnchor(null);
          return;
        }
        setSelectedText(next.text);
        setAnchor(next.anchor);
        setStatus('');
        setStatusKind('info');
      }, [busy]);

      useEffect(() => {
        const onSel = () => refreshSelection();
        document.addEventListener('selectionchange', onSel);
        document.addEventListener('mouseup', onSel);
        document.addEventListener('keyup', onSel);
        window.addEventListener('resize', onSel);
        window.addEventListener('scroll', onSel, true);
        return () => {
          document.removeEventListener('selectionchange', onSel);
          document.removeEventListener('mouseup', onSel);
          document.removeEventListener('keyup', onSel);
          window.removeEventListener('resize', onSel);
          window.removeEventListener('scroll', onSel, true);
        };
      }, [refreshSelection]);

      useEffect(() => () => {
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
      }, []);

      const capture = useCallback(async () => {
        const body = String(selectedText || '').replace(/^\s+/, '').replace(/\s+$/, '');
        if (!body) {
          setStatusKind('error');
          setStatus(t('empty'));
          return;
        }
        const targetSession = pickSessionId(sessionsSnapshot, undefined);
        if (!targetSession) {
          setStatusKind('error');
          setStatus(t('noSession'));
          return;
        }
        setBusy(true);
        setStatusKind('info');
        setStatus(t('selectionCapturing'));
        try {
          const outcome = await executeYuqueNote(targetSession, buildCommand(body), t);
          setStatusKind(outcome.ok ? 'ok' : 'error');
          setStatus(outcome.ok ? t('selectionCaptured') : outcome.message);
          if (outcome.ok) {
            if (typeof document !== 'undefined' && document.getSelection) {
              document.getSelection().removeAllRanges();
            }
            setSelectedText('');
            setAnchor(null);
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            hideTimerRef.current = setTimeout(() => {
              setStatus('');
              setStatusKind('info');
              hideTimerRef.current = null;
            }, 1600);
          }
        } catch (error) {
          setStatusKind('error');
          setStatus(error && error.message ? error.message : String(error));
        } finally {
          setBusy(false);
        }
      }, [selectedText, sessionsSnapshot, t]);

      const visible = !!(selectedText || status);
      if (!visible) return null;

      const gap = 8;
      const floatEl = floatRef.current;
      const size = floatEl && typeof floatEl.getBoundingClientRect === 'function'
        ? floatEl.getBoundingClientRect()
        : { width: 148, height: 42 };
      const point = anchor || {
        left: window.innerWidth - 20,
        top: window.innerHeight - 96,
      };
      // Anchor the floating action to the selection's bottom-right corner.
      let left = point.left - size.width;
      let top = point.top + gap;
      left = Math.max(12, Math.min(left, window.innerWidth - size.width - 12));
      top = Math.max(12, Math.min(top, window.innerHeight - size.height - 12));

      return h('div', {
        ref: floatRef,
        style: {
          position: 'fixed',
          left,
          top,
          zIndex: 10040,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
          maxWidth: 'min(360px, calc(100vw - 40px))',
        },
      },
        status
          ? h('div', {
            style: {
              fontSize: 12,
              lineHeight: 1.4,
              padding: '6px 10px',
              borderRadius: 10,
              background: 'var(--dsw-alias-bg-layer-1)',
              border: '1px solid var(--dsw-alias-border-l1)',
              color: statusColor(statusKind),
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              whiteSpace: 'pre-wrap',
            },
          }, status)
          : null,
        selectedText
          ? h('button', {
            type: 'button',
            onMouseDown: (event) => {
              // Keep the current selection while pressing the floating action.
              event.preventDefault();
            },
            onClick: capture,
            disabled: busy,
            title: t('selectionCapture'),
            style: {
              appearance: 'none',
              border: '1px solid var(--dsw-alias-border-l1)',
              borderRadius: 999,
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: busy ? 'wait' : 'pointer',
              background: 'var(--dsw-alias-bg-layer-1)',
              color: 'var(--dsw-alias-label-primary)',
              boxShadow: '0 10px 28px rgba(0,0,0,0.16)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              opacity: busy ? 0.8 : 1,
            },
          },
            h(PanelIcon, { size: 16 }),
            busy ? t('selectionCapturing') : t('selectionCapture'),
          )
          : null,
      );
    }

    // Captured for send; set in apply.
    let ctx = null;

    return {
      inject: ['slots', 'locale', 'remote', 'remote.commands'],
      apply(pluginCtx) {
        ctx = pluginCtx;
        pluginCtx.effect(
          () => pluginCtx.locale.register(NS, { en, zh }),
          'yuque-notes: dictionaries',
        );
        const t = pluginCtx.locale.bind(NS);

        // Below the chat composer, to the right of the context %.
        pluginCtx.slots.inject('conversation.composer.dock', () => pluginCtx.slots.register({
          name: 'conversation.composer.dock',
          id: DOCK_ID,
          order: 2,
          label: () => t('dockOpen'),
          locale: NS,
        }, function YuqueNotesDock(props) {
          return h(ComposerDock, {
            t,
            sessionId: props && props.sessionId,
            useSessions: props && props.useSessions,
          });
        }));

        // Selection quick capture at the bottom-right of the frame.
        pluginCtx.slots.inject('shell.overlay', () => pluginCtx.slots.register({
          name: 'shell.overlay',
          id: 'yuque-notes-selection-capture',
          order: 40,
          label: () => t('selectionCapture'),
          locale: NS,
        }, function YuqueNotesSelectionCapture(props) {
          return h(SelectionQuickCapture, {
            t,
            useSessions: props && props.useSessions,
          });
        }));
      },
    };
  },
});
