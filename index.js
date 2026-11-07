/**
 * Host half: register /yuque-note and publish through the logged-in ego-browser session.
 * No Yuque developer Token is required for this path.
 */
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

export const inject = ['commands', 'shell']

const NOTES_URL = 'https://www.yuque.com/dashboard/notes'
const TASK_SPACE = 'yuque-notes'
const FALLBACK_TASK_SPACE = 'yuque-notes-probe'

function normalizeBody(rawInput) {
  if (typeof rawInput !== 'string') return ''
  return rawInput.replace(/^\s+/, '').replace(/\s+$/, '')
}

function buildPublishScript(bodyPath, marker) {
  // Piped into `ego-browser nodejs` (not ESM), so wrap top-level awaits.
  return `
(async () => {
  const fs = await import('node:fs/promises');
  const body = await fs.readFile(${JSON.stringify(bodyPath)}, 'utf8');
  const marker = ${JSON.stringify(marker)};

  async function openSpace() {
    try {
      return await taskSpace(${JSON.stringify(TASK_SPACE)});
    } catch (error) {
      const message = String(error && error.message ? error.message : error);
      if (message.includes('EGO_TASK_SPACE_NAME_IN_USE')) {
        return await taskSpace(${JSON.stringify(FALLBACK_TASK_SPACE)});
      }
      try {
        return await taskSpace(${JSON.stringify(FALLBACK_TASK_SPACE)});
      } catch {
        throw error;
      }
    }
  }

  function findNearestRef(snapshot, text) {
    const lines = String(snapshot).split(String.fromCharCode(10));
    let hit = -1;
    for (let i = 0; i < lines.length; i += 1) {
      if (lines[i].includes(text)) { hit = i; break; }
    }
    if (hit < 0) return null;
    for (let i = hit; i >= 0 && i >= hit - 12; i -= 1) {
      const line = lines[i];
      const start = line.indexOf('[ref=');
      if (start < 0) continue;
      const from = start + 5;
      const end = line.indexOf(']', from);
      if (end < 0) continue;
      const id = line.slice(from, end);
      let digits = true;
      if (!id) continue;
      for (let j = 0; j < id.length; j += 1) {
        const code = id.charCodeAt(j);
        if (code < 48 || code > 57) { digits = false; break; }
      }
      if (digits) return '@' + id;
    }
    return null;
  }

  const task = await openSpace();
  const page = task.page('p1');
  await page.goto(${JSON.stringify(NOTES_URL)});
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector("text=小记一下", { state: 'visible', timeout: 30000 });

  let snap = await page.snapshot({ scope: 'full_page' });
  let composer = findNearestRef(snap, '记你想记');
  if (!composer) {
    console.log(JSON.stringify({ ok: false, error: 'composer-not-found', snapshot: snap.slice(0, 4000) }));
    throw new Error('未找到语雀小记输入框，请确认浏览器已登录语雀。');
  }

  await page.click(composer, { label: 'focus yuque note composer' });
  await page.keyboard.paste({ text: body });

  // Re-snapshot before clicking publish; refs go stale after edits.
  snap = await page.snapshot({ scope: 'full_page' });
  const publish = findNearestRef(snap, '小记一下') || 'text=小记一下';
  await page.click(publish, { label: 'publish yuque note' });
  await page.waitForFunction(
    (text) => document.body && document.body.innerText.includes(text),
    marker,
    { timeout: 20000 },
  ).catch(() => {});

  const after = await page.snapshot({ scope: 'full_page' });
  const published = after.includes(marker) || after.includes(body.slice(0, Math.min(40, body.length)));
  console.log(JSON.stringify({
    ok: published,
    spaceId: task.spaceId,
    marker,
    preview: body.slice(0, 80),
  }));
  if (!published) {
    throw new Error('已点击发布，但页面上未确认到小记内容；请打开语雀小记页核对。');
  }
})().catch((error) => {
  const message = error && error.message ? error.message : String(error);
  console.log(JSON.stringify({ ok: false, error: message }));
  throw error;
});
`
}

async function publishNote(ctx, body, signal) {
  const marker = body.length <= 64 ? body : body.slice(0, 48)
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  const bodyPath = path.join(os.tmpdir(), `dsh-yuque-note-${stamp}.txt`)
  await fs.writeFile(bodyPath, body, 'utf8')

  const script = buildPublishScript(bodyPath, marker)
  const workspaceRoot = process.cwd() || os.tmpdir()
  const spec = ctx.shell.resolve({
    command: 'ego-browser nodejs',
    stdin: script,
    timeoutMs: 180_000,
    onExpiry: 'kill',
    signal,
    sandboxPolicy: {
      mode: 'danger-full-access',
      workspaceRoot,
    },
  })

  try {
    const handle = await ctx.shell.execute(spec)
    const result = await handle.result()
    const stdout = result.stdout?.text ?? ''
    const stderr = result.stderr?.text ?? ''

    if (result.aborted) {
      throw new Error('发布已取消')
    }
    if (result.timedOut) {
      throw new Error('发布超时：浏览器自动化超过 180 秒')
    }

    // Prefer the last JSON line from the script.
    const lines = stdout.trim().split(/\n/).filter(Boolean)
    let payload = null
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      try {
        payload = JSON.parse(lines[i])
        break
      } catch {
        // keep scanning
      }
    }

    if (result.exitCode !== 0) {
      const detail = (payload && payload.error) || stderr || stdout || `exit ${result.exitCode}`
      throw new Error(`发布失败：${detail}`)
    }
    if (payload && payload.ok === false) {
      throw new Error(`发布失败：${payload.error || 'unknown'}`)
    }
    if (payload && payload.ok) {
      return `已发布到语雀小记（task space ${payload.spaceId}）。`
    }
    return '已触发语雀小记发布，请到 https://www.yuque.com/dashboard/notes 确认。'
  } finally {
    await fs.unlink(bodyPath).catch(() => {})
  }
}

export function apply(ctx) {
  ctx.effect(
    () => ctx.commands.register({
      name: 'yuque-note',
      description: '将文本发布到语雀小记（浏览器自动化，无需 Token）',
      input: { hint: '<小记内容>' },
      handler: async ({ rawInput, signal }) => {
        const body = normalizeBody(rawInput)
        if (!body) {
          return {
            kind: 'error',
            text: '请提供小记内容。可先打开左侧「语雀小记」面板编辑，再运行 /yuque-note。',
          }
        }
        try {
          const text = await publishNote(ctx, body, signal)
          return { kind: 'success', text }
        } catch (error) {
          const message = error && error.message ? error.message : String(error)
          return { kind: 'error', text: message }
        }
      },
    }),
    'yuque-notes: register /yuque-note',
  )
}
