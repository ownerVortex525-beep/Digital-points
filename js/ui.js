window.CF = window.CF || {};

CF.UI = (function () {
  'use strict';

  let toastContainer = null;

  function init() {
    toastContainer = document.getElementById('toast-container');
  }

  function toast(message, opts) {
    opts = opts || {};
    const type = opts.type || 'info';
    const duration = opts.duration || 3000;

    const toastEl = document.createElement('div');
    toastEl.className = 'toast ' + type;
    toastEl.textContent = message;

    toastContainer.appendChild(toastEl);

    setTimeout(() => {
      toastEl.classList.add('fade-out');
      toastEl.addEventListener('animationend', () => {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      });
    }, duration);
  }

  function modal(title, body, opts) {
    opts = opts || {};
    const container = document.getElementById('modal-container');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    const inputEl = document.getElementById('modal-input');
    const buttonsEl = document.getElementById('modal-buttons');
    const okBtn = document.getElementById('modal-ok');
    const cancelBtn = document.getElementById('modal-cancel');

    titleEl.textContent = title;
    bodyEl.innerHTML = body;

    if (opts.input) {
      inputEl.value = opts.inputValue || '';
      inputEl.style.display = 'block';
      if (opts.inputPlaceholder) inputEl.placeholder = opts.inputPlaceholder;
    } else {
      inputEl.style.display = 'none';
    }

    buttonsEl.innerHTML = '';

    const okLabel = opts.okLabel || 'OK';
    const cancelLabel = opts.cancelLabel || 'Cancel';

    const okButton = document.createElement('button');
    okButton.id = 'modal-ok';
    okButton.textContent = okLabel;
    buttonsEl.appendChild(okButton);

    if (opts.closable !== false) {
      const cancelButton = document.createElement('button');
      cancelButton.id = 'modal-cancel';
      cancelButton.textContent = cancelLabel;
      buttonsEl.appendChild(cancelButton);
    }

    container.classList.add('show');

    const cleanup = () => {
      container.classList.remove('show');
      document.onkeydown = null;
    };

    const okHandler = () => {
      if (opts.onOk) {
        opts.onOk(inputEl.value);
      }
      cleanup();
    };

    const cancelHandler = () => {
      if (opts.onCancel) {
        opts.onCancel();
      }
      cleanup();
    };

    okBtn.onclick = okHandler;
    cancelBtn.onclick = cancelHandler;

    document.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        okHandler();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelHandler();
      }
    };
  }

  function confirm(message, opts) {
    opts = opts || {};
    const buttons = opts.buttons || [
      { label: 'OK', variant: 'primary', onClick: function() {} },
      { label: 'Cancel', variant: 'ghost' }
    ];

    const body = '<p>' + message + '</p>';
    const buttonsHtml = buttons.map(function(btn) {
      return '<button data-action="' + btn.variant + '" style="flex:1">' + btn.label + '</button>';
    }).join('');

    const buttonsContainer = document.createElement('div');
    buttonsContainer.innerHTML = '<div class="flex gap-2 mt-4">' + buttonsHtml + '</div>';

    const container = document.getElementById('modal-container');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    const buttonsEl = document.getElementById('modal-buttons');
    const inputEl = document.getElementById('modal-input');

    titleEl.textContent = opts.title || 'Confirm';
    bodyEl.innerHTML = body;
    inputEl.style.display = 'none';
    buttonsEl.innerHTML = '';

    buttons.forEach(function(btn, i) {
      const button = buttonsContainer.querySelectorAll('button')[i];
      button.onclick = function() {
        if (btn.onClick) btn.onClick();
        container.classList.remove('show');
        document.onkeydown = null;
      };
      buttonsEl.appendChild(button.cloneNode(true));
    });

    container.classList.add('show');

    document.onkeydown = function(e) {
      if (e.key === 'Escape') {
        container.classList.remove('show');
        document.onkeydown = null;
      }
    };
  }

  function showShortcuts() {
    const body = `
      <div class="space-y-2">
        <p><strong>CYBER-FORCE OSINT Shortcuts</strong></p>
        <div class="shortcuts-table">
          <table>
            <tr><td>Ctrl/Cmd + D</td><td>Toggle Day/Night theme</td></tr>
            <tr><td>Ctrl/Cmd + E</td><td>Export JSON</td></tr>
            <tr><td>Ctrl/Cmd + P</td><td>Export PNG</td></tr>
            <tr><td>Ctrl/Cmd + N</td><td>New (clear canvas)</td></tr>
            <tr><td>Ctrl/Cmd + O</td><td>Load JSON</td></tr>
            <tr><td>Delete</td><td>Delete selected node/edge</td></tr>
            <tr><td>DoubleClick</td><td>Edit node label</td></tr>
            <tr><td>Right Click</td><td>Context menu</td></tr>
            <tr><td>Mouse Wheel</td><td>Zoom in/out</td></tr>
            <tr><td>Drag</td><td>Pan canvas</td></tr>
            <tr><td>+/-</td><td>Zoom in/out</td></tr>
          </table>
        </div>
      </div>
    `;

    const container = document.getElementById('modal-container');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    const buttonsEl = document.getElementById('modal-buttons');
    const inputEl = document.getElementById('modal-input');

    titleEl.textContent = 'Keyboard Shortcuts';
    bodyEl.innerHTML = body;
    inputEl.style.display = 'none';
    buttonsEl.innerHTML = '';
    container.classList.add('show');

    const okBtn = document.createElement('button');
    okBtn.id = 'modal-ok';
    okBtn.textContent = 'OK';
    buttonsEl.appendChild(okBtn);

    okBtn.onclick = function() {
      container.classList.remove('show');
    };
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'night' ? 'day' : 'night';
    CF.Storage.setTheme(newTheme);
  }

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'night';
  }

  return {
    init,
    toast,
    modal,
    confirm,
    showShortcuts,
    toggleTheme,
    getTheme
  };
})();