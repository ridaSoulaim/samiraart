import { ICON_SPARKLES } from '../../constants/icons.js';
import { ANNOTATION_MARKER_STYLES } from './styles.js';
import { Z_OFFSET_MARKER } from '../../constants/theme.js';
import { getEditId } from '../../constants/selectors.js';
import { setComments } from '../../state/annotation-state.js';
import { elementZIndex, getAppRoot } from '../../utils/dom-utils.js';
import {
	showHoverOutline, holdHoverOutline, releaseHoverOutline, lockHoverOutline,
	HOVER_OUTLINE_CLASS, LOCKED_OUTLINE_CLASS,
} from '../overlays/hover-outline.js';

const MARKER_HALF = 14;
const MARKER_MARGIN = 4;

/**
 * `class` attribute with our own hover/locked outline classes removed, so an
 * anchor captured while the panel had the element locked never bakes in a
 * class the element won't carry once re-mounted on a route round-trip.
 * @param {HTMLElement} element
 * @returns {string}
 */
function stableClassName(element) {
	return Array.from(element.classList)
		.filter(className => className !== HOVER_OUTLINE_CLASS && className !== LOCKED_OUTLINE_CLASS)
		.join(' ');
}

const _markers = [];
let _scrollListenerActive = false;
let _stylesInjected = false;

function ensureStyles() {
	if (_stylesInjected) return;
	const style = document.createElement('style');
	style.id = 'annotation-marker-styles';
	style.textContent = ANNOTATION_MARKER_STYLES;
	document.head.appendChild(style);
	_stylesInjected = true;
}

function clampX(x, fixed) {
	const vx = fixed ? x : x - window.scrollX;
	const clamped = Math.max(MARKER_HALF + MARKER_MARGIN, Math.min(window.innerWidth - MARKER_HALF - MARKER_MARGIN, vx));
	return fixed ? clamped : clamped + window.scrollX;
}

function clampY(y, fixed) {
	const vy = fixed ? y : y - window.scrollY;
	const clamped = Math.max(MARKER_HALF + MARKER_MARGIN, Math.min(window.innerHeight - MARKER_HALF - MARKER_MARGIN, vy));
	return fixed ? clamped : clamped + window.scrollY;
}

/** Route an annotation belongs to; it is never re-anchored on any other one. */
function currentRoute() {
	return location.pathname + location.hash;
}

/**
 * Structural anchor: the element's child-index path from the app root plus the
 * tag and classes expected there. Its captured `selector` is unusable for
 * re-querying — Tailwind variants (`md:py-32`) make it invalid CSS.
 * @param {HTMLElement} element
 * @returns {{path: number[], tagName: string, className: string}|null}
 */
function captureAnchor(element) {
	const root = getAppRoot();
	const path = [];
	let node = element;

	while (node && node !== root) {
		const parent = node.parentElement;
		if (!parent) return null;
		path.unshift(Array.prototype.indexOf.call(parent.children, node));
		node = parent;
	}

	const anchor = { path, tagName: element.tagName, className: stableClassName(element) };

	return anchor;
}

/**
 * Corrects for a reordered list: items rendered from one `.map()` are identical
 * in tag and classes, so only their text tells them apart. When no sibling
 * matches either, the text was edited since and the position stands.
 * @param {HTMLElement} candidate
 * @param {object|null} selection - `captureElementMetadata` output.
 * @returns {HTMLElement}
 */
function disambiguateSiblings(candidate, selection) {
	const text = selection?.textContent;
	if (!text || candidate.textContent?.trim() === text) return candidate;

	const siblings = Array.from(candidate.parentElement?.children ?? []);
	return siblings.find(sibling =>
		sibling.tagName === candidate.tagName
		&& stableClassName(sibling) === stableClassName(candidate)
		&& sibling.textContent?.trim() === text) ?? candidate;
}

/**
 * Node currently sitting at the anchor's tree position, or null when the
 * position is empty or now holds a different element.
 * @param {{path: number[], tagName: string, className: string}|null} anchor
 * @param {object|null} selection - `captureElementMetadata` output.
 * @returns {HTMLElement|null}
 */
function resolveByAnchor(anchor, selection) {
	if (!anchor) return null;

	let candidate = getAppRoot();
	for (const index of anchor.path) {
		candidate = candidate?.children[index];
	}
	if (!candidate) return null;

	const actualClassName = stableClassName(candidate);
	const sameElement = candidate.tagName === anchor.tagName && actualClassName === anchor.className;

	return sameElement ? disambiguateSiblings(candidate, selection) : null;
}

/**
 * An edit id is a JSX source location, so every node rendered from one `.map()`
 * call site carries the same one; the anchor picks the annotated instance.
 * @param {{editId: string, anchor: object|null, selection: object|null}} target
 * @returns {HTMLElement|null}
 */
function resolveByEditId(target) {
	const matches = Array.from(document.querySelectorAll(`[data-edit-id="${target.editId}"], [data-edit-assisted-id="${target.editId}"]`));
	if (matches.length <= 1) return matches[0] ?? null;

	const anchored = resolveByAnchor(target.anchor, target.selection);
	if (anchored && matches.includes(anchored)) return anchored;

	const text = target.selection?.textContent;
	return (text && matches.find(match => match.textContent?.trim() === text)) || null;
}

/**
 * Element one annotated target currently points at, re-resolved when the stored
 * node was unmounted (re-render, route change); null when it is gone.
 * @param {object} target
 * @param {string} route - Route the annotation was made on.
 * @returns {HTMLElement|null}
 */
function resolveTarget(target, route) {
	if (target.element?.isConnected) return target.element;
	if (currentRoute() !== route) return null;

	const element = target.editId ? resolveByEditId(target) : resolveByAnchor(target.anchor, target.selection);
	if (element) target.element = element;
	return element;
}

/**
 * Elements a marker's annotation still points at. A group keeps its pin as long
 * as at least one member survives, so a partial re-render doesn't drop it.
 * @param {object} entry
 * @returns {HTMLElement[]}
 */
function resolveMarkerElements(entry) {
	const elements = entry.targets
		.map(target => resolveTarget(target, entry.route))
		.filter(Boolean);

	entry.elements = elements;
	if (elements.length) entry.comment.elements = elements;
	return elements;
}

/**
 * Places one marker over its annotation's current elements.
 * @param {object} entry
 * @param {HTMLElement[]} elements - `resolveMarkerElements` output, never empty.
 */
function positionMarker(entry, elements) {
	const anchorElement = elements[0];
	const rect = anchorElement.getBoundingClientRect();
	const fixed = entry.fixed;

	const anchored = elements.length === 1
		&& Array.from(anchorElement.attributes || []).some(attr => attr.name.startsWith('data-edit-'));
	const relativeX = anchored ? 0 : entry.relativeX;
	const relativeY = anchored ? rect.height / 2 : entry.relativeY;

	const baseX = fixed ? rect.left + relativeX : rect.left + window.scrollX + relativeX;
	const baseY = fixed ? rect.top + relativeY : rect.top + window.scrollY + relativeY;
	entry.marker.style.left = `${clampX(baseX, fixed)}px`;
	entry.marker.style.top = `${clampY(baseY, fixed)}px`;
	entry.marker.style.zIndex = Math.max(...elements.map(elementZIndex)) + Z_OFFSET_MARKER;
}

/**
 * Repositions every marker over its annotation, hiding the ones whose elements
 * are no longer on the page so annotations never bleed onto another route. This
 * is also what anchors a restored annotation, once its route renders.
 */
export function refreshAnnotationMarkers() {
	for (const entry of _markers) {
		const elements = resolveMarkerElements(entry);
		if (!elements.length) {
			entry.marker.style.display = 'none';
			continue;
		}
		entry.marker.style.display = '';
		positionMarker(entry, elements);
	}
}

function ensureScrollListener() {
	if (_scrollListenerActive) return;
	_scrollListenerActive = true;
	window.addEventListener('scroll', refreshAnnotationMarkers, true);
	window.addEventListener('resize', refreshAnnotationMarkers);
}

/**
 * Builds and registers the pin of one annotation. `targets` may describe elements
 * that are not on the page: the pin stays hidden until a refresh resolves them.
 * @param {{
 *   comment: import('../../state/annotation-state.js').AnnotationComment,
 *   targets: Array<{element: HTMLElement|null, editId: string|null, anchor: object|null, selection: object|null}>,
 *   relativeX: number,
 *   relativeY: number,
 *   fixed: boolean,
 *   route: string,
 *   onMarkerClick: (comment: object, clientX: number, clientY: number) => void,
 * }} options
 * @returns {object} The marker entry.
 */
function createMarkerEntry({ comment, targets, relativeX, relativeY, fixed, route, onMarkerClick }) {
	ensureStyles();
	ensureScrollListener();

	const marker = document.createElement('div');
	marker.className = 'selection-mode-annotation-marker';
	marker.style.position = fixed ? 'fixed' : 'absolute';
	marker.style.display = 'none';
	marker.innerHTML = ICON_SPARKLES;

	// The outline and panel target `entry.elements`, not the captured ones:
	// re-resolution after a re-render swaps in the freshly mounted nodes.
	const entry = {
		marker,
		elements: targets.map(target => target.element).filter(Boolean),
		relativeX,
		relativeY,
		fixed,
		comment,
		targets,
		route,
	};

	marker.addEventListener('mouseenter', () => {
		holdHoverOutline();
		showHoverOutline(entry.elements);
	});

	marker.addEventListener('mouseleave', () => {
		releaseHoverOutline();
	});

	marker.addEventListener('click', (event) => {
		event.stopPropagation();
		event.preventDefault();
		lockHoverOutline(entry.elements);
		onMarkerClick(comment, event.clientX, event.clientY);
	});

	document.body.appendChild(marker);

	_markers.push(entry);
	comment.marker = marker;

	return entry;
}

/**
 * Adds the single pin that represents one annotation, tracked against the first of its elements
 * @param {import('../../state/annotation-state.js').AnnotationComment} comment
 * @param {(comment: object, clientX: number, clientY: number) => void} onMarkerClick
 */
export function addAnnotationMarker(comment, onMarkerClick) {
	const { elements, selections, clickX, clickY, fixed } = comment;
	const anchorElement = elements[0];
	const rect = anchorElement.getBoundingClientRect();

	const anchorToLeftBorder = elements.length === 1
		&& (anchorElement.hasAttribute('data-edit-id') || anchorElement.hasAttribute('data-edit-assisted-id'));

	const entry = createMarkerEntry({
		comment,
		targets: elements.map((element, index) => ({
			element,
			editId: getEditId(element),
			anchor: captureAnchor(element),
			selection: selections[index] ?? null,
		})),
		relativeX: anchorToLeftBorder ? 0 : clickX - rect.left,
		relativeY: anchorToLeftBorder ? rect.height / 2 : clickY - rect.top,
		fixed,
		route: currentRoute(),
		onMarkerClick,
	});

	entry.marker.style.display = '';
	positionMarker(entry, elements);
}

/**
 * Recreates the pin of a persisted annotation
 * @param {import('../../state/annotation-state.js').AnnotationComment} comment
 * @param {ReturnType<typeof exportAnnotationMarkers>[number]} serialized
 * @param {(comment: object, clientX: number, clientY: number) => void} onMarkerClick
 */
function addRestoredAnnotationMarker(comment, serialized, onMarkerClick) {
	createMarkerEntry({
		comment,
		targets: (serialized.targets ?? []).map(target => ({
			element: null,
			editId: target.editId ?? null,
			anchor: target.anchor ?? null,
			selection: target.selection ?? null,
		})),
		relativeX: serialized.relativeX ?? 0,
		relativeY: serialized.relativeY ?? 0,
		fixed: !!serialized.fixed,
		route: serialized.route ?? currentRoute(),
		onMarkerClick,
	});
}

/**
 * Rebuilds annotation comments and their pins from a snapshot. Nothing is
 * resolved here: the refresh pass anchors each annotation as its route renders
 * @param {ReturnType<typeof exportAnnotationMarkers>|null|undefined} serialized
 * @param {(comment: object, clientX: number, clientY: number) => void} onMarkerClick
 */
export function importAnnotationMarkers(serialized, onMarkerClick) {
	clearAllAnnotationMarkers();
	setComments([]);

	if (!Array.isArray(serialized)) return;

	// Without targets an annotation can never be anchored again, so it would sit
	// in the draft as a change the user cannot see, reach or remove.
	const annotations = serialized.filter(annotation => annotation?.targets?.length);
	if (!annotations.length) return;

	const comments = annotations.map(annotation => ({
		elements: [],
		selections: annotation.targets.map(target => target.selection).filter(Boolean),
		text: annotation.text ?? '',
		clickX: annotation.clickX ?? 0,
		clickY: annotation.clickY ?? 0,
		fixed: !!annotation.fixed,
	}));

	setComments(comments);
	comments.forEach((comment, index) => addRestoredAnnotationMarker(comment, annotations[index], onMarkerClick));
	refreshAnnotationMarkers();
}

/**
 * Serializes every annotation for persistence
 * @returns {Array<{
 *   targets: Array<{editId: string|null, anchor: object|null, selection: object|null}>,
 *   text: string, clickX: number, clickY: number,
 *   relativeX: number, relativeY: number, fixed: boolean, route: string,
 * }>}
 */
export function exportAnnotationMarkers() {
	return _markers.map(entry => ({
		targets: entry.targets.map(({ editId, anchor, selection }) => ({ editId, anchor, selection })),
		text: entry.comment.text ?? '',
		clickX: entry.comment.clickX ?? 0,
		clickY: entry.comment.clickY ?? 0,
		relativeX: entry.relativeX,
		relativeY: entry.relativeY,
		fixed: entry.fixed,
		route: entry.route,
	}));
}

export function removeMarker(comment) {
	const index = _markers.findIndex(e => e.comment === comment);
	if (index === -1) return;
	const entry = _markers[index];
	entry.marker.remove();
	_markers.splice(index, 1);
}

/** Highlights the pin of whichever annotation covers the element, group or not. */
export function highlightMarkerForElement(element) {
	for (const entry of _markers) {
		if (entry.elements.includes(element)) {
			entry.marker.classList.add('highlighted');
		}
	}
}

export function unhighlightAllMarkers() {
	for (const entry of _markers) {
		entry.marker.classList.remove('highlighted');
	}
}

export function clearAllAnnotationMarkers() {
	for (const entry of _markers) {
		entry.marker.remove();
	}
	_markers.length = 0;
	window.removeEventListener('scroll', refreshAnnotationMarkers, true);
	window.removeEventListener('resize', refreshAnnotationMarkers);
	_scrollListenerActive = false;
}
