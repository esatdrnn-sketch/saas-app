/* Subkoru Embed Widget — https://subkoru.com.tr */
(function (w, d) {
  'use strict';

  var BASE = 'https://subkoru.com.tr';
  var _overlay = null;
  var _handler = null;

  function _cleanup(opts, reason) {
    if (_handler) { w.removeEventListener('message', _handler); _handler = null; }
    if (_overlay) { _overlay.remove(); _overlay = null; }
    if (!opts) return;
    if (reason === 'save'   && opts.onSave)    opts.onSave();
    if (reason === 'cancel' && opts.onCancel)  opts.onCancel();
    if (reason === 'close'  && opts.onClose)   opts.onClose();
  }

  function _buildOverlay() {
    var style = d.createElement('style');
    style.textContent = '@keyframes _sk_spin{to{transform:rotate(360deg)}}#_sk_widget [data-sk=spin]{animation:_sk_spin .65s linear infinite}';
    d.head.appendChild(style);

    var ov = d.createElement('div');
    ov.id = '_sk_widget';
    ov.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:2147483647',
      'background:rgba(15,23,42,0.6)',
      'backdrop-filter:blur(6px)', '-webkit-backdrop-filter:blur(6px)',
      'display:flex', 'align-items:center', 'justify-content:center',
      'padding:16px', 'box-sizing:border-box',
    ].join(';');

    var box = d.createElement('div');
    box.setAttribute('data-sk', 'box');
    box.style.cssText = [
      'position:relative', 'width:100%', 'max-width:480px',
      'height:min(640px,92vh)', 'background:#fff',
      'border-radius:16px', 'overflow:hidden',
      'box-shadow:0 32px 80px rgba(0,0,0,0.45)',
      'display:flex', 'align-items:center', 'justify-content:center',
    ].join(';');

    var spin = d.createElement('div');
    spin.setAttribute('data-sk', 'spin');
    spin.style.cssText = 'width:28px;height:28px;border:2.5px solid #e2e8f0;border-top-color:#4f46e5;border-radius:50%;';

    box.appendChild(spin);
    ov.appendChild(box);
    return { ov: ov, box: box };
  }

  w.Subkoru = {
    open: function (opts) {
      opts = opts || {};
      var apiKey    = opts.apiKey    || (w.SubkoruConfig && w.SubkoruConfig.apiKey)    || '';
      var customerId = opts.customerId || (w.SubkoruConfig && w.SubkoruConfig.customerId) || '';

      if (!apiKey)     { console.error('[Subkoru] apiKey eksik');     return; }
      if (!customerId) { console.error('[Subkoru] customerId eksik'); return; }
      if (_overlay)    return;

      var built = _buildOverlay();
      _overlay = built.ov;
      d.body.appendChild(_overlay);

      _overlay.addEventListener('click', function (e) {
        if (e.target === _overlay) _cleanup(opts, 'close');
      });

      fetch(BASE + '/api/embed/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey, customerId: customerId }),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.token) throw new Error(data.error || 'Oturum açılamadı');
          var ifr = d.createElement('iframe');
          ifr.src = BASE + '/?token=' + encodeURIComponent(data.token) + '&embed=1';
          ifr.style.cssText = 'width:100%;height:100%;border:none;display:block;';
          ifr.allow = 'payment';
          var box = _overlay.querySelector('[data-sk=box]');
          box.innerHTML = '';
          box.appendChild(ifr);
        })
        .catch(function (err) {
          _cleanup(null, null);
          if (opts.onError) opts.onError(err);
          else console.error('[Subkoru]', err.message || err);
        });

      _handler = function (e) {
        if (e.origin !== BASE) return;
        var t = e.data && e.data.type;
        if      (t === 'SUBKORU_SAVED')     _cleanup(opts, 'save');
        else if (t === 'SUBKORU_CANCELLED') _cleanup(opts, 'cancel');
        else if (t === 'SUBKORU_CLOSE')     _cleanup(opts, 'close');
      };
      w.addEventListener('message', _handler);
    },

    close: function () { _cleanup(null, 'close'); },
  };
}(window, document));
