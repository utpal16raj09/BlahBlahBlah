// DOM Elements
const editor = document.getElementById('editor');
const lineNumbers = document.getElementById('line-numbers');
const cursorPosition = document.getElementById('cursor-position');
const fileInfo = document.getElementById('file-info');
const modifiedIndicator = document.getElementById('modified-indicator');
const themeSelector = document.getElementById('theme-selector');
const themeOptions = document.querySelectorAll('.theme-option');
const wordCount = document.getElementById('word-count');
const autoSaveIndicator = document.getElementById('auto-save-indicator');

// Font controls
const fontSizeSelect = document.getElementById('font-size');

// Text style controls
const boldBtn = document.getElementById('bold');
const italicBtn = document.getElementById('italic');
const underlineBtn = document.getElementById('underline');
const strikethroughBtn = document.getElementById('strikethrough');
const textColorBtn = document.getElementById('text-color');
const textColorPicker = document.getElementById('text-color-picker');
const highlightColorBtn = document.getElementById('highlight-color');
const highlightColorPicker = document.getElementById('highlight-color-picker');

// Text alignment controls
const alignLeftBtn = document.getElementById('align-left');
const alignCenterBtn = document.getElementById('align-center');
const alignRightBtn = document.getElementById('align-right');
const alignJustifyBtn = document.getElementById('align-justify');

// Indentation controls
const indentIncreaseBtn = document.getElementById('indent-increase');
const indentDecreaseBtn = document.getElementById('indent-decrease');

// Line spacing dialog
const lineSpacingBtn = document.getElementById('line-spacing');
const lineSpacingDialog = document.getElementById('line-spacing-dialog');
const closeLineSpacingBtn = document.getElementById('close-line-spacing');
const lineHeightValue = document.getElementById('line-height-value');
const lineHeightDisplay = document.getElementById('line-height-display');
const paragraphSpacing = document.getElementById('paragraph-spacing');
const paragraphSpacingDisplay = document.getElementById('paragraph-spacing-display');
const applySpacingBtn = document.getElementById('apply-spacing');
const cancelSpacingBtn = document.getElementById('cancel-spacing');

// Special features
const spellCheckBtn = document.getElementById('spell-check');

// Export options
const exportBtn = document.getElementById('export-btn');
const exportOptions = document.querySelectorAll('[data-export]');

// Shortcuts dialog
const shortcutsDialog = document.getElementById('shortcuts-dialog');
const closeShortcutsBtn = document.getElementById('close-shortcuts');

// Button elements
const newFileBtn = document.getElementById('new-file');
const openFileBtn = document.getElementById('open-file');
const saveFileBtn = document.getElementById('save-file');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const cutBtn = document.getElementById('cut');
const copyBtn = document.getElementById('copy');
const pasteBtn = document.getElementById('paste');

// State variables
let currentFilePath = null;
let isModified = false;

let isDarkTheme = localStorage.getItem('darkTheme') === 'true';
let currentTheme = localStorage.getItem('currentTheme') || 'default';
let isSpellCheckEnabled = localStorage.getItem('spellCheckEnabled') === 'true';
let autoSaveInterval = null;
let autoSaveEnabled = localStorage.getItem('autoSaveEnabled') === 'true' || true;
let autoSaveDelay = parseInt(localStorage.getItem('autoSaveDelay')) || 30000; // 30 seconds

// Create a hidden div to render HTML content
const hiddenDiv = document.createElement('div');
hiddenDiv.style.display = 'none';
document.body.appendChild(hiddenDiv);

// Apply saved theme
if (isDarkTheme) {
    document.body.classList.add('dark-theme');
}

// Apply saved theme if not default
if (currentTheme !== 'default') {
    document.body.classList.add(`${currentTheme}-theme`);
}

// Apply saved font settings

if (localStorage.getItem('fontSize')) {
    editor.style.fontSize = localStorage.getItem('fontSize');
    fontSizeSelect.value = localStorage.getItem('fontSize');
}

// Apply saved line spacing
if (localStorage.getItem('lineHeight')) {
    editor.style.lineHeight = localStorage.getItem('lineHeight');
    lineHeightValue.value = parseFloat(localStorage.getItem('lineHeight'));
    lineHeightDisplay.textContent = localStorage.getItem('lineHeight');
}

if (localStorage.getItem('paragraphSpacing')) {
    editor.style.marginBottom = localStorage.getItem('paragraphSpacing') + 'px';
    paragraphSpacing.value = parseInt(localStorage.getItem('paragraphSpacing'));
    paragraphSpacingDisplay.textContent = localStorage.getItem('paragraphSpacing') + 'px';
}

// Apply spell check setting
editor.spellcheck = isSpellCheckEnabled;
if (isSpellCheckEnabled) {
    spellCheckBtn.classList.add('active');
}

// Font controls - completely simplified
// Font family selector has been removed

fontSizeSelect.addEventListener('change', () => {
    const fontSize = fontSizeSelect.value;
    
    // Apply font size to the editor
    editor.style.fontSize = fontSize;
    
    // Update line numbers to match the new font size
    setTimeout(updateLineNumbers, 10);
    
    updateModifiedStatus(true);
});

// Initialize the editor as a contenteditable div
document.addEventListener('DOMContentLoaded', () => {
    // Make sure the editor is properly initialized
    editor.focus();
    
    // Set up the editor to handle paste events properly
    editor.addEventListener('paste', (e) => {
        // Prevent the default paste behavior
        e.preventDefault();
        
        // Get the plain text from the clipboard
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        
        // Insert the text at the cursor position
        document.execCommand('insertText', false, text);
    });
    
    // Set up the editor to handle keydown events
    editor.addEventListener('keydown', (e) => {
        // Handle tab key
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertText', false, '    ');
        }
    });
    
    // Initialize the editor with any saved content
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
    }
    
    // Update line numbers on initial load
    updateLineNumbers();
    
    // Start auto-save if enabled
    if (autoSaveEnabled) {
        startAutoSave();
    }
});

// Make sure the editor is properly updated when content changes
editor.addEventListener('input', () => {
    updateLineNumbers();
    updateWordCount();
    updateModifiedStatus(true);
});

// Make sure the editor scrolls properly
editor.addEventListener('scroll', syncScroll);

// Event Listeners
editor.addEventListener('input', () => {
    updateLineNumbers();
    updateModifiedStatus(true);
    updateWordCount();
    renderHTML();
});

editor.addEventListener('keydown', handleTabKey);
editor.addEventListener('scroll', syncScroll);
editor.addEventListener('click', updateCursorInfo);
editor.addEventListener('keyup', updateCursorInfo);

// Theme selector
themeSelector.addEventListener('click', (e) => {
    e.stopPropagation();
    const themeDropdown = document.querySelector('.theme-dropdown');
    themeDropdown.style.display = themeDropdown.style.display === 'block' ? 'none' : 'block';
});

// Close theme dropdown when clicking outside
document.addEventListener('click', (e) => {
    const themeDropdown = document.querySelector('.theme-dropdown');
    if (!e.target.closest('.theme-selector')) {
        themeDropdown.style.display = 'none';
    }
});

// Theme selection
document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        const theme = e.target.dataset.theme;
        document.body.classList.remove(...document.body.classList);
        document.body.classList.add(theme + '-theme');
        localStorage.setItem('currentTheme', theme);
        document.querySelector('.theme-dropdown').style.display = 'none';
    });
});

// Theme selector functionality - completely rewritten
// Using the already declared variables instead of redeclaring them

// Toggle theme dropdown when clicking the theme button
themeSelector.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent event bubbling
    console.log('Theme selector clicked');
    
    // Toggle dropdown visibility
    if (themeDropdown.style.display === 'none' || themeDropdown.style.display === '') {
        themeDropdown.style.display = 'block';
    } else {
        themeDropdown.style.display = 'none';
    }
});

// Close theme dropdown when clicking outside
document.addEventListener('click', (event) => {
    if (themeDropdown && themeSelector) {
        if (!themeSelector.contains(event.target) && !themeDropdown.contains(event.target)) {
            themeDropdown.style.display = 'none';
        }
    }
});

// Theme options click handlers - completely rewritten
// Using the already declared themeOptions variable
themeOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling
        
        const theme = option.getAttribute('data-theme');
        console.log('Theme selected:', theme);
        
        // Remove active class from all options
        themeOptions.forEach(opt => opt.classList.remove('active'));
        
        // Add active class to selected option
        option.classList.add('active');
        
        // Apply the selected theme
        applyTheme(theme);
        
        // Close the dropdown
        themeDropdown.style.display = 'none';
    });
});

function applyTheme(theme) {
    try {
        console.log('Applying theme:', theme);
        
        // Remove any existing theme classes
        document.body.classList.remove(
            'theme-light', 
            'theme-dark', 
            'theme-blue', 
            'theme-green', 
            'theme-purple', 
            'theme-sepia', 
            'theme-high-contrast'
        );
        
        // Add the new theme class
        if (theme) {
            document.body.classList.add(`theme-${theme}`);
            console.log('Added class:', `theme-${theme}`);
            
            // Update the UI to show the active theme
            document.querySelectorAll('.theme-option').forEach(option => {
                if (option.getAttribute('data-theme') === theme) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
            });
        }
        
        // Save the theme preference
        localStorage.setItem('theme', theme);
        
        // Update isDarkTheme based on the selected theme
        isDarkTheme = (theme === 'dark' || theme === 'high-contrast');
        localStorage.setItem('darkTheme', isDarkTheme);
        
        console.log(`Theme changed to ${theme}`);
    } catch (error) {
        console.error('Error applying theme:', error);
    }
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    console.log('Loading saved theme:', savedTheme);
    
    // Apply the theme with a slight delay to ensure DOM is fully loaded
    setTimeout(() => {
        applyTheme(savedTheme);
        
        // Mark the active theme in the dropdown
        const activeThemeOption = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
        if (activeThemeOption) {
            activeThemeOption.classList.add('active');
        }
    }, 100);
});

// Text style controls
boldBtn.addEventListener('click', () => document.execCommand('bold', false, null));
italicBtn.addEventListener('click', () => document.execCommand('italic', false, null));
underlineBtn.addEventListener('click', () => document.execCommand('underline', false, null));
strikethroughBtn.addEventListener('click', () => document.execCommand('strikeThrough', false, null));

// Text color button functionality
textColorBtn.addEventListener('click', () => {
    const colorPickerContainer = textColorBtn.nextElementSibling;
    if (colorPickerContainer.style.display === 'block') {
        colorPickerContainer.style.display = 'none';
    } else {
        colorPickerContainer.style.display = 'block';
        textColorPicker.focus();
        textColorPicker.click();
    }
});

// Text color picker functionality
textColorPicker.addEventListener('change', () => {
    const color = textColorPicker.value;
    document.execCommand('foreColor', false, color);
    textColorPicker.parentElement.style.display = 'none';
    updateModifiedStatus(true);
});

// Highlight color button functionality
highlightColorBtn.addEventListener('click', () => {
    const colorPickerContainer = highlightColorBtn.nextElementSibling;
    if (colorPickerContainer.style.display === 'block') {
        colorPickerContainer.style.display = 'none';
    } else {
        colorPickerContainer.style.display = 'block';
        highlightColorPicker.focus();
        highlightColorPicker.click();
    }
});

// Highlight color picker functionality
highlightColorPicker.addEventListener('change', () => {
    const color = highlightColorPicker.value;
    document.execCommand('hiliteColor', false, color);
    highlightColorPicker.parentElement.style.display = 'none';
    updateModifiedStatus(true);
});

// Text alignment controls
alignLeftBtn.addEventListener('click', () => applyTextAlignment('left'));
alignCenterBtn.addEventListener('click', () => applyTextAlignment('center'));
alignRightBtn.addEventListener('click', () => applyTextAlignment('right'));
alignJustifyBtn.addEventListener('click', () => applyTextAlignment('justify'));

function applyTextAlignment(alignment) {
    // Apply alignment using execCommand
    document.execCommand('justify' + alignment.charAt(0).toUpperCase() + alignment.slice(1), false, null);
    
    // Update the active state of alignment buttons
    alignLeftBtn.classList.remove('active');
    alignCenterBtn.classList.remove('active');
    alignRightBtn.classList.remove('active');
    alignJustifyBtn.classList.remove('active');
    
    document.getElementById(`align-${alignment}`).classList.add('active');
    
    updateModifiedStatus(true);
}

// Indentation controls
indentIncreaseBtn.addEventListener('click', increaseIndent);
indentDecreaseBtn.addEventListener('click', decreaseIndent);

// Line spacing dialog
lineSpacingBtn.addEventListener('click', showLineSpacingDialog);
closeLineSpacingBtn.addEventListener('click', () => lineSpacingDialog.classList.add('hidden'));
cancelSpacingBtn.addEventListener('click', () => lineSpacingDialog.classList.add('hidden'));
applySpacingBtn.addEventListener('click', applyLineSpacing);

lineHeightValue.addEventListener('input', () => {
    lineHeightDisplay.textContent = lineHeightValue.value;
});

paragraphSpacing.addEventListener('input', () => {
    paragraphSpacingDisplay.textContent = paragraphSpacing.value + 'px';
});

// Special features
spellCheckBtn.addEventListener('click', toggleSpellCheck);

// Shortcuts dialog
closeShortcutsBtn.addEventListener('click', () => shortcutsDialog.classList.add('hidden'));

// Function to show shortcuts dialog
function showShortcutsDialog() {
    shortcutsDialog.classList.remove('hidden');
}

// Function to show line spacing dialog
function showLineSpacingDialog() {
    lineSpacingDialog.classList.remove('hidden');
    
    // Get current line height and paragraph spacing
    const currentLineHeight = parseFloat(window.getComputedStyle(editor).lineHeight) || 1.5;
    const currentParagraphSpacing = parseInt(window.getComputedStyle(editor).marginBottom) || 0;
    
    // Set current values in the dialog
    lineHeightValue.value = currentLineHeight;
    lineHeightDisplay.textContent = currentLineHeight;
    
    paragraphSpacing.value = currentParagraphSpacing;
    paragraphSpacingDisplay.textContent = currentParagraphSpacing + 'px';
}

// Function to apply line spacing
function applyLineSpacing() {
    const lineHeight = lineHeightValue.value;
    const paragraphSpace = paragraphSpacing.value + 'px';
    
    // Apply line height to the editor
    editor.style.lineHeight = lineHeight;
    
    // Apply paragraph spacing
    const paragraphs = editor.querySelectorAll('p');
    if (paragraphs.length > 0) {
        paragraphs.forEach(p => {
            p.style.marginBottom = paragraphSpace;
        });
    } else {
        // If no paragraphs, apply to the editor itself
        editor.style.marginBottom = paragraphSpace;
    }
    
    // Save preferences
    localStorage.setItem('lineHeight', lineHeight);
    localStorage.setItem('paragraphSpacing', paragraphSpace);
    
    // Close the dialog
    lineSpacingDialog.classList.add('hidden');
    
    updateModifiedStatus(true);
}

// Function to toggle spell check
function toggleSpellCheck() {
    isSpellCheckEnabled = !isSpellCheckEnabled;
    editor.spellcheck = isSpellCheckEnabled;
    
    // Toggle active class
    if (isSpellCheckEnabled) {
        spellCheckBtn.classList.add('active');
    } else {
        spellCheckBtn.classList.remove('active');
    }
    
    // Save preference
    localStorage.setItem('spellCheckEnabled', isSpellCheckEnabled);
}

// Export options
exportOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.preventDefault();
        const format = e.target.getAttribute('data-export');
        exportFile(format);
    });
});

// Function to export file in different formats
function exportFile(format) {
    try {
        // Get the content from the editor
        const content = editor.innerText || '';
        
        // Create a default filename
        let fileName = 'document';
        if (currentFilePath) {
            const pathParts = currentFilePath.split(/[\\\/]/);
            fileName = pathParts[pathParts.length - 1].split('.')[0] || 'document';
        }
        
        // Create a blob with the content
        let blob;
        let mimeType;
        
        switch (format) {
            case 'txt':
                blob = new Blob([content], { type: 'text/plain' });
                fileName += '.txt';
                mimeType = 'text/plain';
                break;
            case 'html':
                const htmlContent = `<!DOCTYPE html>\n<html>\n<head>\n<title>${fileName}</title>\n<style>\nbody { font-family: Arial, sans-serif; margin: 20px; }\n</style>\n</head>\n<body>\n${editor.innerHTML}\n</body>\n</html>`;
                blob = new Blob([htmlContent], { type: 'text/html' });
                fileName += '.html';
                mimeType = 'text/html';
                break;
            case 'pdf':
                alert('PDF export requires additional libraries. Please save as HTML and use a browser\'s print function to create a PDF.');
                return;
            default:
                blob = new Blob([content], { type: 'text/plain' });
                fileName += '.txt';
                mimeType = 'text/plain';
        }
        
        // Create and trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
        
        console.log(`File exported as ${fileName}`);
    } catch (error) {
        console.error('Error exporting file:', error);
        alert('There was an error exporting the file. Please try again.');
    }
}

// File operations
newFileBtn.addEventListener('click', newFile);
openFileBtn.addEventListener('click', openFile);
saveFileBtn.addEventListener('click', saveFile);

// Edit operations
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
cutBtn.addEventListener('click', cut);
copyBtn.addEventListener('click', copy);
pasteBtn.addEventListener('click', paste);

// Implement undo function
function undo() {
    document.execCommand('undo', false, null);
    updateModifiedStatus(true);
}

// Implement redo function
function redo() {
    document.execCommand('redo', false, null);
    updateModifiedStatus(true);
}

// Implement cut function
function cut() {
    document.execCommand('cut', false, null);
    updateModifiedStatus(true);
}

// Implement copy function
function copy() {
    document.execCommand('copy', false, null);
}

// Implement paste function
function paste() {
    document.execCommand('paste', false, null);
    updateModifiedStatus(true);
}

// Search operations - removed

// Keyboard shortcuts
document.addEventListener('keydown', handleKeyboardShortcuts);

// Make sure Ctrl+A works properly for select all
document.addEventListener('keydown', (e) => {
    // Ctrl+A for select all
    if (e.ctrlKey && e.key === 'a' && document.activeElement === editor) {
        e.preventDefault();
        
        // Create a range that encompasses all content
        const range = document.createRange();
        range.selectNodeContents(editor);
        
        // Apply the selection
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
});

// Functions
function updateLineNumbers() {
    // Get the actual content of the editor
    const content = editor.innerText || '';
    const lines = content.split('\n');
    
    // Clear existing line numbers
    lineNumbers.innerHTML = '';
    
    // Get the current font size of the editor
    const editorStyle = window.getComputedStyle(editor);
    const lineHeight = parseInt(editorStyle.lineHeight);
    
    // Set the line numbers to match editor's line height
    lineNumbers.style.lineHeight = `${lineHeight}px`;
    
    // Create line numbers with proper spacing
    for (let i = 0; i < lines.length; i++) {
        const lineNumberDiv = document.createElement('div');
        lineNumberDiv.textContent = i + 1;
        lineNumberDiv.style.height = `${lineHeight}px`;
        lineNumberDiv.style.display = 'flex';
        lineNumberDiv.style.alignItems = 'center';
        lineNumberDiv.style.justifyContent = 'flex-end';
        lineNumberDiv.style.margin = '0';
        lineNumberDiv.style.padding = '0';
        lineNumberDiv.style.position = 'relative';
        lineNumberDiv.style.top = '0';
        lineNumbers.appendChild(lineNumberDiv);
    }
    
    // If there are no lines, add at least one line number
    if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) {
        const lineNumberDiv = document.createElement('div');
        lineNumberDiv.textContent = '1';
        lineNumberDiv.style.height = `${lineHeight}px`;
        lineNumberDiv.style.display = 'flex';
        lineNumberDiv.style.alignItems = 'center';
        lineNumberDiv.style.justifyContent = 'flex-end';
        lineNumberDiv.style.margin = '0';
        lineNumberDiv.style.padding = '0';
        lineNumberDiv.style.position = 'relative';
        lineNumberDiv.style.top = '0';
        lineNumbers.appendChild(lineNumberDiv);
    }
}

function syncScroll() {
    lineNumbers.scrollTop = editor.scrollTop;
}

function updateCursorInfo() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editor);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const textBeforeCursor = preCaretRange.toString();
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length;
        const currentColumn = lines[lines.length - 1].length + 1;
        
        cursorPosition.textContent = `Line: ${currentLine}, Column: ${currentColumn}`;
    }
}

function updateModifiedStatus(modified) {
    isModified = modified;
    modifiedIndicator.classList.toggle('hidden', !modified);
}

function updateFileInfo(filename) {
    fileInfo.textContent = filename || 'Untitled';
    document.title = `${filename || 'Untitled'} - Utpal's Text Editor`;
}

function updateWordCount() {
    const text = editor.textContent || '';
    const charCount = text.length;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    
    document.getElementById('word-count').textContent = `Words: ${wordCount}, Characters: ${charCount}`;
}

function toggleTheme() {
    // Show theme dropdown
    const themeDropdown = document.querySelector('.theme-dropdown');
    if (themeDropdown.style.display === 'none' || !themeDropdown.style.display) {
        themeDropdown.style.display = 'block';
    } else {
        themeDropdown.style.display = 'none';
    }
}

function handleTabKey(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        
        // Insert tab at cursor position
        editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
        
        // Move cursor after the inserted tab
        editor.selectionStart = editor.selectionEnd = start + 4;
        
        updateModifiedStatus(true);
    }
}

function newFile() {
    if (isModified) {
        if (!confirm('You have unsaved changes. Do you want to discard them?')) {
            return;
        }
    }
    
    editor.value = '';
    currentFilePath = null;
    updateFileInfo(null);
    updateModifiedStatus(false);
    updateLineNumbers();
}

function openFile() {
    if (isModified) {
        if (!confirm('You have unsaved changes. Do you want to discard them?')) {
            return;
        }
    }
    
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.js,.html,.css,.md';
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            editor.value = e.target.result;
            currentFilePath = file.name;
            updateFileInfo(file.name);
            updateModifiedStatus(false);
            updateLineNumbers();
        };
        reader.readAsText(file);
    });
    
    fileInput.click();
}

function saveFile(saveAs = false) {
    // If saveAs is true, we'll force a "Save As" dialog
    if (saveAs || !currentFilePath) {
        const content = editor.innerHTML;
        
        let suggestedName = currentFilePath || 'untitled';
        let suggestedExt = '.html';
        
        const filename = prompt('Enter filename:', suggestedName + suggestedExt);
        
        if (filename) {
            saveFileContent(filename, content);
            updateFileInfo(filename);
            currentFilePath = filename;
            updateModifiedStatus(false);
        }
    } else {
        // Regular save with existing filename
        saveFileContent(currentFilePath, editor.innerHTML);
        updateModifiedStatus(false);
    }
}

function pasteAsPlainText() {
    navigator.clipboard.readText()
        .then(text => {
            // Insert plain text at cursor position using execCommand
            document.execCommand('insertText', false, text);
            updateModifiedStatus(true);
        })
        .catch(err => {
            console.error('Failed to read clipboard contents: ', err);
            alert('Could not access clipboard. Please check your browser permissions.');
        });
}

function deleteTextAfterCursor() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const startNode = range.startContainer;
        const startOffset = range.startOffset;
        
        // Find the end of the current line
        const textContent = startNode.textContent;
        const lineEnd = textContent.indexOf('\n', startOffset);
        const end = lineEnd !== -1 ? lineEnd : textContent.length;
        
        // Create a new range from cursor to end of line
        const deleteRange = document.createRange();
        deleteRange.setStart(startNode, startOffset);
        deleteRange.setEnd(startNode, end);
        
        // Delete the text
        deleteRange.deleteContents();
        
        // Update the selection
        selection.removeAllRanges();
        selection.addRange(range);
        
        updateModifiedStatus(true);
    }
}

function deleteTextBeforeCursor() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const startNode = range.startContainer;
        const startOffset = range.startOffset;
        
        // Find the start of the current line
        const textContent = startNode.textContent;
        let lineStart = 0;
        for (let i = startOffset - 1; i >= 0; i--) {
            if (textContent[i] === '\n') {
                lineStart = i + 1;
                break;
            }
        }
        
        // Create a new range from start of line to cursor
        const deleteRange = document.createRange();
        deleteRange.setStart(startNode, lineStart);
        deleteRange.setEnd(startNode, startOffset);
        
        // Delete the text
        deleteRange.deleteContents();
        
        // Update the selection
        const newRange = document.createRange();
        newRange.setStart(startNode, lineStart);
        newRange.setEnd(startNode, lineStart);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        updateModifiedStatus(true);
    }
}

function duplicateLineOrSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        if (range.collapsed) {
            // No selection, duplicate the current line
            // Get the current line
            const node = range.startContainer;
            const text = node.textContent;
            let lineStart = 0;
            let lineEnd = text.length;
            
            // Find line boundaries
            for (let i = range.startOffset - 1; i >= 0; i--) {
                if (text[i] === '\n') {
                    lineStart = i + 1;
                    break;
                }
            }
            
            for (let i = range.startOffset; i < text.length; i++) {
                if (text[i] === '\n') {
                    lineEnd = i;
                    break;
                }
            }
            
            const line = text.substring(lineStart, lineEnd);
            
            // Insert a new line with the duplicated content
            const newRange = document.createRange();
            newRange.setStart(node, lineEnd);
            newRange.setEnd(node, lineEnd);
            newRange.insertNode(document.createTextNode('\n' + line));
            
            // Set selection to the duplicated line
            const newSelectionRange = document.createRange();
            newSelectionRange.setStart(node, lineEnd + 1);
            newSelectionRange.setEnd(node, lineEnd + 1 + line.length);
            selection.removeAllRanges();
            selection.addRange(newSelectionRange);
        } else {
            // Duplicate the selected text
            const selectedText = range.toString();
            
            // Create a new range at the end of the selection
            const newRange = document.createRange();
            newRange.setStart(range.endContainer, range.endOffset);
            newRange.setEnd(range.endContainer, range.endOffset);
            
            // Insert the duplicated text
            newRange.insertNode(document.createTextNode(selectedText));
            
            // Set selection to the duplicated text
            const newSelectionRange = document.createRange();
            newSelectionRange.setStart(range.endContainer, range.endOffset);
            newSelectionRange.setEnd(range.endContainer, range.endOffset + selectedText.length);
            selection.removeAllRanges();
            selection.addRange(newSelectionRange);
        }
        
        updateModifiedStatus(true);
    }
}

function deleteLineOrSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        if (range.collapsed) {
            // No selection, delete the current line
            const node = range.startContainer;
            const text = node.textContent;
            let lineStart = 0;
            let lineEnd = text.length;
            
            // Find line boundaries
            for (let i = range.startOffset - 1; i >= 0; i--) {
                if (text[i] === '\n') {
                    lineStart = i + 1;
                    break;
                }
            }
            
            for (let i = range.startOffset; i < text.length; i++) {
                if (text[i] === '\n') {
                    lineEnd = i + 1; // Include the newline character
                    break;
                }
            }
            
            // Create a range for the entire line
            const lineRange = document.createRange();
            lineRange.setStart(node, lineStart);
            lineRange.setEnd(node, lineEnd);
            
            // Delete the line
            lineRange.deleteContents();
            
            // Set the cursor position
            const newRange = document.createRange();
            newRange.setStart(node, lineStart);
            newRange.setEnd(node, lineStart);
            selection.removeAllRanges();
            selection.addRange(newRange);
        } else {
            // Delete the selected text
            range.deleteContents();
            
            // The selection will automatically be collapsed to the start position
        }
        
        updateModifiedStatus(true);
    }
}

function handleKeyboardShortcuts(e) {
    
    // Ctrl+S for save
    if (e.ctrlKey && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        saveFile();
    }
    
    // Ctrl+Shift+S for Save As
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        saveFile(true); // Pass true to indicate "Save As"
    }
    
    // Ctrl+O for open
    if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        openFile();
    }
    
    // Ctrl+N for new
    if (e.ctrlKey && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        newFile();
    }
    
    // Ctrl+Shift+N for new window (we'll just show a message since we don't support multiple windows)
    if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        alert('Multiple windows are not supported in this version.');
    }
    
    // Ctrl+P for print
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        window.print();
    }
    
    // Ctrl+Q or Alt+F4 to close application (we'll just show a message)
    if ((e.ctrlKey && e.key === 'q') || (e.altKey && e.key === 'F4')) {
        e.preventDefault();
        if (isModified) {
            if (confirm('You have unsaved changes. Do you want to save before closing?')) {
                saveFile();
            }
        }
        alert('You can close the browser tab to exit the application.');
    }
    
    // Ctrl+W to close document
    if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        if (isModified) {
            if (confirm('You have unsaved changes. Do you want to save before creating a new file?')) {
                saveFile();
            }
        }
        newFile();
    }
    
    // Ctrl+Z for undo
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
    }
    
    // Ctrl+Y or Ctrl+Shift+Z for redo
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        redo();
    }
    
    // Ctrl+A for select all
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        document.execCommand('selectAll', false, null);
    }
    
    // Ctrl+Shift+F for find in files (we'll just show a message since we don't support it)
    if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        alert('Find in files is not supported in this version.');
    }
    
    // Escape to close dialogs
    if (e.key === 'Escape') {
        lineSpacingDialog.classList.add('hidden');
        shortcutsDialog.classList.add('hidden');
    }
    
    // F1 for keyboard shortcuts help
    if (e.key === 'F1') {
        e.preventDefault();
        showShortcutsDialog();
    }
    
    // Text Formatting Shortcuts
    
    // Ctrl+B for bold
    if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        document.execCommand('bold', false, null);
    }
    
    // Ctrl+I for italic
    if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        document.execCommand('italic', false, null);
    }
    
    // Ctrl+U for underline
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        document.execCommand('underline', false, null);
    }
    
    // Text Alignment Shortcuts
    
    // Ctrl+L for left align
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        applyTextAlignment('left');
    }
    
    // Ctrl+E for center align
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        applyTextAlignment('center');
    }
    
    // Ctrl+R for right align
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        applyTextAlignment('right');
    }
    
    // Ctrl+Shift+L for justify
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        applyTextAlignment('justify');
    }
    
    // Clipboard Operations
    
    // Ctrl+C for copy
    if (e.ctrlKey && e.key === 'c') {
        // No need to prevent default as it's a native browser function
        copy();
    }
    
    // Ctrl+X for cut
    if (e.ctrlKey && e.key === 'x') {
        // No need to prevent default as it's a native browser function
        cut();
    }
    
    // Ctrl+V for paste
    if (e.ctrlKey && e.key === 'v' && !e.shiftKey) {
        // No need to prevent default as it's a native browser function
        paste();
    }
    
    // Ctrl+Shift+V for paste as plain text
    if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        pasteAsPlainText();
    }
    
    // Ctrl+Shift+C for copy formatting (we'll just show a message since we don't support it)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        alert('Copy formatting is not supported in this version.');
    }
    
    // Text Navigation and Selection
    
    // Home, End, Ctrl+Home, Ctrl+End are handled by the browser
    
    // Ctrl+K to delete text after cursor
    if (e.ctrlKey && e.key === 'k' && !e.shiftKey) {
        e.preventDefault();
        deleteTextAfterCursor();
    }
    
    // Ctrl+Shift+K to delete text before cursor
    if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        deleteTextBeforeCursor();
    }
    
    // Ctrl+D to duplicate line or selection
    if (e.ctrlKey && e.key === 'd' && !e.shiftKey) {
        e.preventDefault();
        duplicateLineOrSelection();
    }
    
    // Ctrl+Shift+D to delete line or selection
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        deleteLineOrSelection();
    }
    
    // Ctrl+Shift+P for command palette (we'll just show a message since we don't support it)
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        alert('Command palette is not supported in this version.');
    }
    
    // Ctrl+Shift+T to reopen last closed file (we'll just show a message since we don't support it)
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        alert('Reopening closed files is not supported in this version.');
    }
}





function getSelectedText() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        return selection.toString();
    }
    return '';
}







// Helper function to escape special characters in regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Helper function to select text in a contenteditable div
function selectTextInContentEditable(element, start, end) {
    const textNodes = [];
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    
    let node;
    while (node = walk.nextNode()) {
        textNodes.push(node);
    }
    
    let currentLength = 0;
    let startNode = null, startOffset = 0;
    let endNode = null, endOffset = 0;
    
    // Find the start and end nodes and offsets
    for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        const nodeLength = node.length;
        
        if (startNode === null && start >= currentLength && start < currentLength + nodeLength) {
            startNode = node;
            startOffset = start - currentLength;
        }
        
        if (endNode === null && end >= currentLength && end <= currentLength + nodeLength) {
            endNode = node;
            endOffset = end - currentLength;
            break;
        }
        
        currentLength += nodeLength;
    }
    
    // If we found the nodes, create a range and select it
    if (startNode && endNode) {
        const range = document.createRange();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Scroll to the selection
        const rect = range.getBoundingClientRect();
        if (rect) {
            element.scrollTop = rect.top - element.getBoundingClientRect().top - element.clientHeight / 2;
        }
        
        return true;
    }
    
    return false;
}

// Helper function to get the text offset of a node within the editor
function getTextNodeOffset(root, node, offset) {
    let totalOffset = 0;
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    
    let currentNode;
    while (currentNode = walk.nextNode()) {
        if (currentNode === node) {
            return totalOffset + offset;
        }
        totalOffset += currentNode.length;
    }
    
    return totalOffset;
}

function ensureVisible(index) {
    // Approximate the position to scroll to
    const lineHeight = 20; // Approximate line height in pixels
    const charsPerLine = 80; // Approximate characters per line
    const lineNumber = Math.floor(index / charsPerLine);
    const scrollPosition = lineNumber * lineHeight;
    
    // Adjust scroll position to ensure the found text is visible
    if (scrollPosition < editor.scrollTop || 
        scrollPosition > editor.scrollTop + editor.clientHeight - lineHeight) {
        editor.scrollTop = scrollPosition - editor.clientHeight / 2;
    }
}

function startAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    
    autoSaveInterval = setInterval(() => {
        if (isModified) {
            const content = editor.innerHTML;
            localStorage.setItem('autoSaveContent', content);
            localStorage.setItem('autoSaveTime', new Date().toISOString());
            
            // Show auto-save indicator
            autoSaveIndicator.classList.remove('hidden');
            setTimeout(() => {
                autoSaveIndicator.classList.add('hidden');
            }, 2000);
            
            updateModifiedStatus(false);
        }
    }, autoSaveDelay);
}

// Check for auto-saved content on load
(function checkAutoSavedContent() {
    const autoSavedContent = localStorage.getItem('autoSaveContent');
    const autoSaveTime = localStorage.getItem('autoSaveTime');
    
    if (autoSavedContent && autoSaveTime) {
        const timeAgo = new Date(autoSaveTime);
        const now = new Date();
        const diffInMinutes = Math.floor((now - timeAgo) / (1000 * 60));
        
        if (diffInMinutes < 60 && autoSavedContent.trim() !== '') {
            if (confirm(`Found auto-saved content from ${diffInMinutes} minutes ago. Would you like to restore it?`)) {
                editor.innerHTML = autoSavedContent;
                updateLineNumbers();
                updateWordCount();
            } else {
                localStorage.removeItem('autoSaveContent');
                localStorage.removeItem('autoSaveTime');
            }
        }
    }
})();

// Syntax highlighting for code
function applySyntaxHighlighting() {
    if (window.hljs) {
        const content = editor.value;
        // Try to detect language
        const highlighted = hljs.highlightAuto(content);
        if (highlighted.relevance > 5) {
            // Only apply if relevance is high enough
            editor.classList.add('syntax-highlighted');
            // This is just a visual indicator, actual highlighting would require a more complex editor
        } else {
            editor.classList.remove('syntax-highlighted');
        }
    }
}

// Add event listener for syntax highlighting
editor.addEventListener('input', debounce(applySyntaxHighlighting, 500));

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

function insertTextAtCursor(text) {
    const selection = window.getSelection();
    if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        updateModifiedStatus(true);
    }
}

function increaseIndent() {
    const selection = getSelectedText();
    if (selection.length > 0) {
        const range = editor.value.substring(editor.selectionStart, editor.selectionEnd);
        const replacement = `    ${range}`;
        insertTextAtCursor(replacement);
    } else {
        editor.value = editor.value.substring(0, editor.selectionStart) + '    ' + editor.value.substring(editor.selectionStart);
        editor.selectionStart = editor.selectionEnd = editor.selectionStart + 4;
    }
}

function decreaseIndent() {
    const selection = getSelectedText();
    if (selection.length > 0) {
        const range = editor.value.substring(editor.selectionStart, editor.selectionEnd);
        const replacement = range.replace(/^    /gm, '');
        insertTextAtCursor(replacement);
    } else {
        const textBeforeCursor = editor.value.substring(0, editor.selectionStart);
        const indent = textBeforeCursor.match(/( *)$/)[1];
        if (indent.length >= 4) {
            editor.value = editor.value.substring(0, editor.selectionStart - 4) + editor.value.substring(editor.selectionStart);
            editor.selectionStart = editor.selectionEnd = editor.selectionStart - 4;
        }
    }
}

function renderHTML() {
    // Get the content from the textarea
    const content = editor.value;
    
    // Create a temporary div to hold the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Check if the content has HTML tags
    if (content.includes('<') && content.includes('>')) {
        // Apply styles to make HTML content visible in the editor
        editor.classList.add('html-content');
    } else {
        editor.classList.remove('html-content');
    }
}

function applyUnderlineWithColor() {
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        if (range.toString().length > 0) {
            // Instead of using execCommand, we'll create a custom span
            const span = document.createElement('span');
            span.style.textDecoration = 'underline';
            span.style.textDecorationThickness = '2px';
            
            // Get the current text color
            const computedStyle = window.getComputedStyle(editor);
            const textColor = computedStyle.color;
            
            // Set the text decoration color
            span.style.textDecorationColor = textColor;
            
            // Extract the selected content
            const selectedContent = range.extractContents();
            span.appendChild(selectedContent);
            
            // Insert the span with the styled content
            range.insertNode(span);
            
            // Update the selection
            selection.removeAllRanges();
            selection.addRange(range);
            
            updateModifiedStatus(true);
        }
    }
}
