(() => {
  'use strict';

  const form = document.querySelector('#embed-form');
  const gamePicker = document.querySelector('#game-picker');
  const titleField = document.querySelector('#custom-title');
  const destinationField = document.querySelector('#custom-destinations');
  const promptField = document.querySelector('#custom-prompts');
  const strengthField = document.querySelector('#custom-strength');
  const preview = document.querySelector('#preview');
  const code = document.querySelector('#embed-code');
  const status = document.querySelector('#studio-status');
  const settings = Carnival.readSettings(location.hash);
  let appliedName = '';
  let previewRevision = 0;

  for (const game of Carnival.games) gamePicker.add(new Option(game.name, game.id));
  gamePicker.add(new Option('Today’s featured game', 'featured'));
  const requested = new URLSearchParams(location.search).get('game');
  gamePicker.value = requested === 'featured' || Carnival.gameById(requested) ? requested : 'orbit-wheel';
  titleField.value = settings.title;
  destinationField.value = settings.options.map(option => option.url ? `${option.label} | ${option.url}` : option.label).join('\n');
  promptField.value = settings.prompts.join('\n');
  strengthField.value = settings.turns;

  function lines(value) {
    return value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  }

  function readOptions() {
    const rows = lines(destinationField.value);
    if (rows.length < 2 || rows.length > 32) throw new Error('Enter 2–32 destinations.');
    return rows.map((row, index) => {
      const [label, ...rest] = row.split('|');
      const name = label.trim();
      const address = rest.join('|').trim();
      if (!name || Array.from(name).length > 80) throw new Error(`Destination ${index + 1} needs a name of 1–80 characters.`);
      const url = Carnival.safeDestination(address);
      if (address && !url) throw new Error(`Destination ${index + 1} needs a valid HTTPS address.`);
      return { label: name, url };
    });
  }

  function escapeAttribute(value) {
    return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }

  function updateFields() {
    const id = gamePicker.value;
    document.querySelector('#prompt-fields').hidden = id !== 'featured' && !Carnival.gameById(id)?.prompts;
    strengthField.disabled = id !== 'orbit-wheel' && id !== 'featured';
    document.querySelector('#strength-fields').hidden = strengthField.disabled;
  }

  function apply() {
    updateFields();
    const id = gamePicker.value;
    let options;
    let prompts;
    try {
      options = readOptions();
      prompts = document.querySelector('#prompt-fields').hidden ? Carnival.prompts : lines(promptField.value);
      if (!prompts.length || prompts.length > 24 || prompts.some(prompt => Array.from(prompt).length > 120)) {
        throw new Error('Enter 1–24 actions of up to 120 characters each.');
      }
    } catch (error) {
      status.textContent = error.message;
      return false;
    }
    const title = Carnival.cleanText(titleField.value, 80);
    const config = { title, options, prompts, turns: Carnival.startingStrength(strengthField.value) };
    appliedName = title || Carnival.gameById(id)?.name || 'Today’s featured game';
    const publicBase = /^https?:$/.test(location.protocol) ? location.href : Carnival.canonical;
    const url = Carnival.playerUrl(publicBase, id, config);
    const height = ['orbit-wheel', 'featured'].includes(id) ? 910 : 760;
    preview.title = `Preview of ${appliedName}`;
    preview.height = height;
    const previewUrl = Carnival.playerUrl(location.href, id, config);
    // Changing only a fragment would leave the previous game instance mounted.
    previewUrl.searchParams.set('preview', String(++previewRevision));
    preview.src = previewUrl.href;
    code.value = `<iframe src="${escapeAttribute(url.href)}" title="${escapeAttribute(appliedName)}" width="100%" height="${height}" style="display:block;max-width:680px;border:0" loading="lazy"></iframe>`;
    status.textContent = 'Preview and embed code updated.';
    return true;
  }

  async function copy(value, fallbackField) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const field = fallbackField || document.createElement('textarea');
      if (!fallbackField) {
        field.value = value;
        field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
        document.body.append(field);
      }
      try {
        field.select();
        return document.execCommand('copy');
      } catch {
        return false;
      } finally {
        if (!fallbackField) field.remove();
      }
    }
    return true;
  }

  form.addEventListener('submit', event => { event.preventDefault(); apply(); });
  gamePicker.addEventListener('change', updateFields);
  document.querySelector('#copy-iframe').addEventListener('click', async () => {
    if (code.value) status.textContent = await copy(code.value, code) ? 'Iframe copied.' : 'Select and copy the embed code above.';
  });
  document.querySelector('#copy-brief').addEventListener('click', async () => {
    if (!code.value) return;
    const brief = `Place the ${appliedName} embed below in the section I specify. Match the host page’s spacing, keep the iframe responsive, and check the game at phone width. Preserve the complete src, including its settings.\n\n${code.value}`;
    status.textContent = await copy(brief) ? 'Codex placement prompt copied.' : 'Clipboard unavailable. Copy the iframe above and tell Codex where to place it.';
  });
  apply();
})();
