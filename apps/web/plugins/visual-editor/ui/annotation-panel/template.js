import { ICON_DELETE, ICON_CLOSE } from '../../constants/icons.js';

export const ANNOTATION_PANEL_HTML = `
<div id="selection-mode-annotation-panel">
  <div id="selection-mode-annotation-header">
    <span id="selection-mode-annotation-count"></span>
    <button id="selection-mode-discard-btn" title="Close">${ICON_CLOSE}</button>
  </div>
  <textarea id="selection-mode-annotation-textarea" placeholder="Tell AI what to change" rows="1"></textarea>
  <div id="selection-mode-annotation-buttons">
    <div id="selection-mode-delete-wrapper">
      <button id="selection-mode-delete-btn" title="Delete comment">${ICON_DELETE}</button>
    </div>
    <button id="selection-mode-comment-btn" disabled>Add comment</button>
  </div>
</div>
`;
