import { ANNOTATION_COLOR, PANEL_BG, PANEL_INPUT_BG, BORDER_COLOR, HOVER_BG, TEXT_MUTED, COLOR_WHITE, BUTTON_LIGHT_TEXT, BUTTON_LIGHT_BG_HOVER, BOX_SHADOW_TOOLBAR } from '../../constants/theme.js';

export const ANNOTATION_PANEL_STYLES = `
	#selection-mode-annotation-panel {
		display: none;
		flex-direction: column;
		gap: 8px;
		position: fixed;
		background: ${PANEL_BG};
		border-radius: 16px;
		border: 1px solid ${BORDER_COLOR};
		padding: 8px;
		width: 320px;
		box-shadow: ${BOX_SHADOW_TOOLBAR};
		pointer-events: all;
		box-sizing: border-box;
		font-family: DM Sans, sans-serif;

		&.active {
			display: flex;
		}
	}

	#selection-mode-annotation-header {
		display: flex;
		align-items: center;
		gap: 16px;
		padding-left: 8px;
	}

	#selection-mode-annotation-count {
		flex: 1 0 0;
		min-width: 0;
		color: ${TEXT_MUTED};
		font-size: 14px;
		line-height: 20px;
		font-weight: 400;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	#selection-mode-annotation-textarea {
		width: 100%;
		min-height: 88px;
		max-height: 160px;
		background: ${PANEL_INPUT_BG};
		border: 1px solid ${BORDER_COLOR};
		border-radius: 8px;
		outline: none;
		padding: 8px 12px;
		color: ${COLOR_WHITE};
		font-size: 16px;
		font-family: inherit;
		resize: none;
		box-sizing: border-box;
		caret-color: ${COLOR_WHITE};
		line-height: 24px;
		overflow-y: auto;
	}

	#selection-mode-annotation-textarea::placeholder {
		color: ${TEXT_MUTED};
	}

	#selection-mode-annotation-buttons {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	#selection-mode-discard-btn,
	#selection-mode-delete-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 8px;
		border-radius: 8px;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-sizing: border-box;
	}

	#selection-mode-discard-btn:hover,
	#selection-mode-delete-btn:hover {
		background: ${HOVER_BG};
	}

	#selection-mode-delete-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		width: 32px;
		height: 32px;
	}

	#selection-mode-comment-btn {
		background: ${COLOR_WHITE};
		border: none;
		color: ${BUTTON_LIGHT_TEXT};
		font-family: inherit;
		font-size: 14px;
		line-height: 20px;
		font-weight: 600;
		cursor: pointer;
		padding: 6px 12px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		white-space: nowrap;
	}

	#selection-mode-comment-btn:hover {
		background: ${BUTTON_LIGHT_BG_HOVER};
	}

	#selection-mode-comment-btn:disabled {
		opacity: 0.2;
		cursor: not-allowed;
		background: ${COLOR_WHITE};
	}
`;

export const ANNOTATION_MARKER_STYLES = `
	.selection-mode-annotation-marker > * {
		pointer-events: none;
	}

	.selection-mode-annotation-marker {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: ${ANNOTATION_COLOR};
		border: 1px solid ${COLOR_WHITE}25;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: auto;
		cursor: pointer;
		user-select: none;
		transform: translate(-50%, -50%);
		transition: transform 0.15s ease;
	}

	.selection-mode-annotation-marker:hover,
	.selection-mode-annotation-marker.highlighted {
		transform: translate(-50%, -50%) scale(1.1);
	}
`;
