import { ANNOTATION_PANEL_HTML } from './template.js';
import { ANNOTATION_PANEL_STYLES } from './styles.js';
import { addAnnotationMarker, removeMarker, unhighlightAllMarkers } from './annotation-markers.js';
import { lockHoverOutline, unlockHoverOutline } from '../overlays/hover-outline.js';
import { isInFixedContext, elementZIndex, getElementType } from '../../utils/dom-utils.js';
import { captureElementMetadata } from '../../utils/selection-mode-metadata.js';
import { PANEL_GAP, PANEL_MARGIN, PARENT_TOOLBAR_HEIGHT, ANNOTATION_PANEL_WIDTH, ANNOTATION_PANEL_ESTIMATED_HEIGHT } from '../../constants/layout.js';
import {
	getComments, setComments,
	getPanelMode, setPanelMode,
	getEditingComment, setEditingComment,
	getPendingElements, setPendingElements,
	getPendingSelections, setPendingSelections,
	getAnnotationClickX, setAnnotationClickX,
	getAnnotationClickY, setAnnotationClickY,
	getEditorTranslations,
} from '../../state/annotation-state.js';
import { clearSelectedElements } from '../../state/multi-select-state.js';
import { Z_OFFSET_PANEL } from '../../constants/theme.js';
import { notifyDraftStateChanged } from '../../api/draft-snapshot.js';
import { getEditing } from '../../state/editing-state.js';
import { startInlineEdit, commitCurrentEdit } from '../inline-edit/edit-action.js';
import { showTextFormatToolbar, hideTextFormatToolbar, getToolbarEl } from '../text-format/toolbar/toolbar.js';

const DEFAULT_LABELS = {
	annotationAddComment: 'Add comment',
	annotationSaveComment: 'Save comment',
	annotationPlaceholder: 'Tell AI what to change',
	annotationElementSelected: '{count} element selected',
	annotationElementsSelected: '{count} elements selected',
};

function label(key, replacements = {}) {
	const raw = getEditorTranslations()[key] || DEFAULT_LABELS[key] || key;
	return Object.entries(replacements).reduce(
		(text, [token, value]) => text.replace(`{${token}}`, value), raw
	);
}

let _annotationPanelEl = null;
let _stylesInjected = false;
let _panelKeydownHandler = null;

function selectionLabel(elements) {
	const count = elements.length;
	const key = count === 1 ? 'annotationElementSelected' : 'annotationElementsSelected';
	return label(key, { count });
}

function ensureStyles() {
	if (_stylesInjected) return;
	const style = document.createElement('style');
	style.id = 'annotation-panel-styles';
	style.textContent = ANNOTATION_PANEL_STYLES;
	document.head.appendChild(style);
	_stylesInjected = true;
}

function ensurePanelElement() {
	if (_annotationPanelEl) return _annotationPanelEl;
	ensureStyles();

	const wrapper = document.createElement('div');
	wrapper.innerHTML = ANNOTATION_PANEL_HTML;
	_annotationPanelEl = wrapper.firstElementChild;
	document.body.appendChild(_annotationPanelEl);

	const textarea = _annotationPanelEl.querySelector('#selection-mode-annotation-textarea');
	const commentBtn = _annotationPanelEl.querySelector('#selection-mode-comment-btn');
	const discardBtn = _annotationPanelEl.querySelector('#selection-mode-discard-btn');
	const deleteBtn = _annotationPanelEl.querySelector('#selection-mode-delete-btn');

	textarea.placeholder = label('annotationPlaceholder');
	commentBtn.textContent = label('annotationAddComment');

	textarea.addEventListener('input', () => {
		commentBtn.disabled = !textarea.value.trim();
	});

	commentBtn.addEventListener('click', handleCommentClick);
	discardBtn.addEventListener('click', handleDiscardClick);
	deleteBtn.addEventListener('click', handleDeleteClick);

	return _annotationPanelEl;
}

function handleCommentClick() {
	const textarea = _annotationPanelEl.querySelector('#selection-mode-annotation-textarea');
	const text = textarea.value.trim();
	if (!text) return;

	if (getPanelMode() === 'edit') {
		const editing = getEditingComment();
		if (editing) {
			editing.text = text;
			notifyDraftStateChanged();
		}
		hideAnnotationPanel();
		return;
	}

	const elements = getPendingElements();
	const selections = getPendingSelections();
	const clickX = getAnnotationClickX();
	const clickY = getAnnotationClickY();

	const comment = {
		elements,
		selections,
		text,
		clickX,
		clickY,
		fixed: elements.length ? isInFixedContext(elements[0]) : false,
	};
	setComments([...getComments(), comment]);
	addAnnotationMarker(comment, openPanelForEdit);
	notifyDraftStateChanged();
	hideAnnotationPanel();
}

function handleDiscardClick() {
	hideAnnotationPanel();
}

function handleDeleteClick() {
	const editing = getEditingComment();
	if (!editing) return;

	removeMarker(editing);
	setComments(getComments().filter(c => c !== editing));
	notifyDraftStateChanged();
	hideAnnotationPanel();
}

function positionPanel(clickX, clickY, elements, anchorTop = clickY) {
	const panel = _annotationPanelEl;
	const fixed = elements.length ? isInFixedContext(elements[0]) : false;
	panel.style.position = fixed ? 'fixed' : 'absolute';

	const scrollX = fixed ? 0 : window.scrollX;
	const scrollY = fixed ? 0 : window.scrollY;

	let left = clickX;
	let top = clickY + PANEL_GAP;

	if (left + ANNOTATION_PANEL_WIDTH > window.innerWidth - PANEL_MARGIN) {
		left = window.innerWidth - ANNOTATION_PANEL_WIDTH - PANEL_MARGIN;
	}
	if (left < PANEL_MARGIN) left = PANEL_MARGIN;

	if (top + ANNOTATION_PANEL_ESTIMATED_HEIGHT > window.innerHeight - PARENT_TOOLBAR_HEIGHT - PANEL_MARGIN) {
		// anchorTop is the anchor's top edge (equals clickY for a plain click
		// point, but the toolbar's top when anchored to it) so the panel
		// flips fully above the anchor instead of overlapping its bottom half.
		top = anchorTop - ANNOTATION_PANEL_ESTIMATED_HEIGHT - PANEL_GAP;
	}
	if (top < PANEL_MARGIN) top = PANEL_MARGIN;

	panel.style.left = `${left + scrollX}px`;
	panel.style.top = `${top + scrollY}px`;
	// A group's panel must clear the highest-stacked element it annotates.
	panel.style.zIndex = (elements.length ? Math.max(...elements.map(elementZIndex)) : 0) + Z_OFFSET_PANEL;
}

/**
 * Opens the panel in create mode for a group of one or more elements.
 * @param {HTMLElement[]} elements
 * @param {object[]} selections - `captureElementMetadata` output, one per element.
 */
export function showAnnotationPanel(elements, selections, clickX, clickY, anchorTop = clickY) {
	const panel = ensurePanelElement();

	setPendingElements(elements);
	setPendingSelections(selections);
	setAnnotationClickX(clickX);
	setAnnotationClickY(clickY);
	setPanelMode('create');
	setEditingComment(null);

	const textarea = panel.querySelector('#selection-mode-annotation-textarea');
	const commentBtn = panel.querySelector('#selection-mode-comment-btn');
	const deleteBtn = panel.querySelector('#selection-mode-delete-btn');
	const countEl = panel.querySelector('#selection-mode-annotation-count');

	textarea.value = '';
	commentBtn.disabled = true;
	commentBtn.textContent = label('annotationAddComment');
	deleteBtn.style.display = 'none';
	countEl.textContent = selectionLabel(elements);

	lockHoverOutline(elements);
	positionPanel(clickX, clickY, elements, anchorTop);
	panel.classList.add('active');
	textarea.focus();

	attachPanelKeydown();
}

export function openPanelForEdit(comment, clickX, clickY) {
	const panel = ensurePanelElement();
	const elements = comment.elements;
	const single = elements.length === 1 ? elements[0] : null;

	const currentEditing = getEditing();
	if (currentEditing && currentEditing.targetElement !== single) {
		hideTextFormatToolbar();
		commitCurrentEdit();
	}

	const elementType = single ? getElementType(single) : null;
	const openToolbar = !!single
		&& (elementType === 'text' || elementType === 'button')
		&& (single.hasAttribute('data-edit-id') || single.hasAttribute('data-edit-assisted-id'));

	setPanelMode('edit');
	setEditingComment(comment);
	setPendingElements(elements);
	setPendingSelections(comment.selections);
	setAnnotationClickX(clickX);
	setAnnotationClickY(clickY);

	const textarea = panel.querySelector('#selection-mode-annotation-textarea');
	const commentBtn = panel.querySelector('#selection-mode-comment-btn');
	const deleteBtn = panel.querySelector('#selection-mode-delete-btn');
	const countEl = panel.querySelector('#selection-mode-annotation-count');

	countEl.textContent = selectionLabel(elements);
	textarea.value = comment.text;
	commentBtn.disabled = !comment.text.trim();
	commentBtn.textContent = label('annotationSaveComment');
	deleteBtn.style.display = 'flex';

	let anchorTop = clickY;
	if (openToolbar) {
		if (!getEditing() || getEditing().targetElement !== single) {
			const editId = single.getAttribute('data-edit-id') || single.getAttribute('data-edit-assisted-id');
			if (editId) {
				startInlineEdit(single, editId, single.innerHTML || "", { focusTarget: false });
			}
		}
		showTextFormatToolbar(single);
		const toolbarRect = getToolbarEl()?.getBoundingClientRect();
		if (toolbarRect) {
			clickX = toolbarRect.left;
			clickY = toolbarRect.bottom;
			anchorTop = toolbarRect.top;
		}
	}

	panel.classList.add('active');
	lockHoverOutline(elements);
	unhighlightAllMarkers();
	if (comment.marker) comment.marker.classList.add('highlighted');
	positionPanel(clickX, clickY, elements, anchorTop);

	textarea.focus();
	attachPanelKeydown();
}

/**
 * `restoreFocus: false` skips re-focusing the inline edit, whose `selectionchange`
 * would close a panel the caller opens next; `keepSelection` keeps the group.
 * @param {{ restoreFocus?: boolean, keepSelection?: boolean }} [options]
 */
export function hideAnnotationPanel({ restoreFocus = true, keepSelection = false } = {}) {
	if (!_annotationPanelEl?.classList.contains('active')) return;
	_annotationPanelEl.classList.remove('active');

	setPendingElements([]);
	setPendingSelections([]);
	setEditingComment(null);
	setPanelMode('create');
	if (!keepSelection) clearSelectedElements();

	unlockHoverOutline();
	unhighlightAllMarkers();

	const editing = getEditing();
	if (restoreFocus && editing?.targetElement?.hasAttribute('contenteditable')) {
		editing.targetElement.focus({ preventScroll: true });
		const selection = window.getSelection();
		const range = document.createRange();
		range.selectNodeContents(editing.targetElement);
		range.collapse(false);
		selection.removeAllRanges();
		selection.addRange(range);
	}

	detachPanelKeydown();
}

export function getAnnotationPanelEl() {
	return _annotationPanelEl;
}


function attachPanelKeydown() {
	detachPanelKeydown();
	_panelKeydownHandler = (event) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			hideAnnotationPanel();
		}
	};
	document.addEventListener('keydown', _panelKeydownHandler, true);
}

function detachPanelKeydown() {
	if (_panelKeydownHandler) {
		document.removeEventListener('keydown', _panelKeydownHandler, true);
		_panelKeydownHandler = null;
	}
}

/**
 * Opens the panel for one element or a group, resuming the existing comment when
 * the same target is already annotated and capturing fresh metadata otherwise.
 * @param {HTMLElement|HTMLElement[]} target
 * @param {number} clickX
 * @param {number} clickY
 * @param {number} [anchorTop] - Top edge of the anchor (e.g. a toolbar) used
 *   when flipping the panel above; defaults to clickY for a plain click point.
 */
export function openOrCreateAnnotation(target, clickX, clickY, anchorTop = clickY) {
	const elements = (Array.isArray(target) ? target : [target]).filter(Boolean);
	if (!elements.length) return;

	const existing = getComments().find(comment => comment.elements.length === elements.length
		&& comment.elements.every(element => elements.includes(element)));

	if (existing) {
		openPanelForEdit(existing, existing.clickX, existing.clickY);
	} else {
		showAnnotationPanel(elements, elements.map(captureElementMetadata), clickX, clickY, anchorTop);
	}
}
