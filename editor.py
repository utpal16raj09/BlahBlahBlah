import tkinter as tk
from tkinter import filedialog, messagebox, simpledialog, ttk
from tkinter import font as tkfont
import os

class ModernTextEditor:
    def __init__(self, root):
        self.root = root
        self.root.title("Untitled")
        self.root.geometry("900x700")
        
        # Set theme variables
        self.theme_mode = tk.StringVar(value="light")
        
        # Define color schemes
        self.color_schemes = {
            "light": {
                "bg": "#ffffff",
                "fg": "#333333",
                "text_bg": "#f5f5f5",
                "text_fg": "#333333",
                "menu_bg": "#f0f0f0",
                "highlight_bg": "#e0e0e0",
                "select_bg": "#c2dcf0",
                "select_fg": "#000000",
                "status_bg": "#f0f0f0",
                "button_bg": "#e0e0e0",
                "button_fg": "#333333",
                "accent": "#4a86e8"
            },
            "dark": {
                "bg": "#2d2d2d",
                "fg": "#e0e0e0",
                "text_bg": "#1e1e1e",
                "text_fg": "#e0e0e0",
                "menu_bg": "#333333",
                "highlight_bg": "#3d3d3d",
                "select_bg": "#264f78",
                "select_fg": "#ffffff",
                "status_bg": "#333333",
                "button_bg": "#3d3d3d",
                "button_fg": "#e0e0e0",
                "accent": "#4a86e8"
            }
        }
        
        # File path for the current file
        self.filename = ""
        self.changed = False
        
        # Create main frame
        self.main_frame = tk.Frame(self.root)
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Create a text widget with scrollbar
        self.text_frame = tk.Frame(self.main_frame)
        self.text_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=(5, 10))
        
        # Create vertical scrollbar
        self.scrollbar_y = tk.Scrollbar(self.text_frame)
        self.scrollbar_y.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Create horizontal scrollbar
        self.scrollbar_x = tk.Scrollbar(self.text_frame, orient=tk.HORIZONTAL)
        self.scrollbar_x.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Create text editor with both scrollbars
        self.editor = tk.Text(
            self.text_frame,
            yscrollcommand=self.scrollbar_y.set,
            xscrollcommand=self.scrollbar_x.set,
            wrap=tk.NONE,
            undo=True,
            padx=5,
            pady=5,
            borderwidth=0,
            relief=tk.FLAT
        )
        self.editor.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Configure scrollbars
        self.scrollbar_y.config(command=self.editor.yview)
        self.scrollbar_x.config(command=self.editor.xview)
        
        # Set font
        self.text_font = tkfont.Font(family="Consolas", size=12)
        self.editor.configure(font=self.text_font)
        
        # Create status bar
        self.status_frame = tk.Frame(self.main_frame, height=25)
        self.status_frame.pack(side=tk.BOTTOM, fill=tk.X)
        
        self.status_label = tk.Label(self.status_frame, text="Line: 1, Column: 0", anchor=tk.W, padx=10)
        self.status_label.pack(side=tk.LEFT)
        
        self.theme_button = ttk.Button(self.status_frame, text="Toggle Theme", command=self.toggle_theme)
        self.theme_button.pack(side=tk.RIGHT, padx=10, pady=2)
        
        # Create toolbar
        self.toolbar = tk.Frame(self.main_frame, height=35)
        self.toolbar.pack(side=tk.TOP, fill=tk.X, pady=(2, 5))
        
        # Toolbar buttons
        self.new_button = ttk.Button(self.toolbar, text="New", command=self.new_file)
        self.new_button.pack(side=tk.LEFT, padx=2)
        
        self.open_button = ttk.Button(self.toolbar, text="Open", command=self.open_file)
        self.open_button.pack(side=tk.LEFT, padx=2)
        
        self.save_button = ttk.Button(self.toolbar, text="Save", command=self.save_file)
        self.save_button.pack(side=tk.LEFT, padx=2)
        
        self.separator1 = ttk.Separator(self.toolbar, orient=tk.VERTICAL)
        self.separator1.pack(side=tk.LEFT, padx=5, fill=tk.Y, pady=2)
        
        self.cut_button = ttk.Button(self.toolbar, text="Cut", command=self.cut)
        self.cut_button.pack(side=tk.LEFT, padx=2)
        
        self.copy_button = ttk.Button(self.toolbar, text="Copy", command=self.copy)
        self.copy_button.pack(side=tk.LEFT, padx=2)
        
        self.paste_button = ttk.Button(self.toolbar, text="Paste", command=self.paste)
        self.paste_button.pack(side=tk.LEFT, padx=2)
        
        self.separator2 = ttk.Separator(self.toolbar, orient=tk.VERTICAL)
        self.separator2.pack(side=tk.LEFT, padx=5, fill=tk.Y, pady=2)
        
        self.find_button = ttk.Button(self.toolbar, text="Find", command=self.find)
        self.find_button.pack(side=tk.LEFT, padx=2)
        
        self.replace_button = ttk.Button(self.toolbar, text="Replace", command=self.replace)
        self.replace_button.pack(side=tk.LEFT, padx=2)
        
        # Create menu bar
        self.menu_bar = tk.Menu(self.root)
        self.root.config(menu=self.menu_bar)
        
        # File menu
        self.file_menu = tk.Menu(self.menu_bar, tearoff=0)
        self.menu_bar.add_cascade(label="File", menu=self.file_menu)
        self.file_menu.add_command(label="New", accelerator="Ctrl+N", command=self.new_file)
        self.file_menu.add_command(label="Open", accelerator="Ctrl+O", command=self.open_file)
        self.file_menu.add_command(label="Insert File", accelerator="Ctrl+I", command=self.insert_file)
        self.file_menu.add_separator()
        self.file_menu.add_command(label="Save", accelerator="Ctrl+S", command=self.save_file)
        self.file_menu.add_command(label="Save As", accelerator="Ctrl+Shift+S", command=self.save_as)
        self.file_menu.add_separator()
        self.file_menu.add_command(label="Exit", accelerator="Ctrl+Q", command=self.quit_app)
        
        # Edit menu
        self.edit_menu = tk.Menu(self.menu_bar, tearoff=0)
        self.menu_bar.add_cascade(label="Edit", menu=self.edit_menu)
        self.edit_menu.add_command(label="Undo", accelerator="Ctrl+Z", command=self.undo)
        self.edit_menu.add_separator()
        self.edit_menu.add_command(label="Cut", accelerator="Ctrl+X", command=self.cut)
        self.edit_menu.add_command(label="Copy", accelerator="Ctrl+C", command=self.copy)
        self.edit_menu.add_command(label="Paste", accelerator="Ctrl+V", command=self.paste)
        self.edit_menu.add_command(label="Delete", command=self.delete)
        
        # Search menu
        self.search_menu = tk.Menu(self.menu_bar, tearoff=0)
        self.menu_bar.add_cascade(label="Search", menu=self.search_menu)
        self.search_menu.add_command(label="Find", accelerator="Ctrl+F", command=self.find)
        self.search_menu.add_command(label="Find Again", accelerator="Ctrl+G", command=self.find_again)
        self.search_menu.add_command(label="Replace", accelerator="Ctrl+R", command=self.replace)
        self.search_menu.add_command(label="Replace Again", accelerator="Ctrl+T", command=self.replace_again)
        
        # View menu
        self.view_menu = tk.Menu(self.menu_bar, tearoff=0)
        self.menu_bar.add_cascade(label="View", menu=self.view_menu)
        self.view_menu.add_command(label="Toggle Theme", command=self.toggle_theme)
        
        # Line numbers
        self.line_numbers = tk.Text(self.text_frame, width=4, padx=3, pady=5, takefocus=0, 
                                   borderwidth=0, relief=tk.FLAT)
        self.line_numbers.pack(side=tk.LEFT, fill=tk.Y, before=self.editor)
        self.line_numbers.config(state=tk.DISABLED)
        
        # Keyboard bindings
        self.editor.bind("<<Modified>>", self.on_text_modified)
        self.editor.bind("<KeyRelease>", self.update_status)
        self.editor.bind("<ButtonRelease-1>", self.update_status)
        self.editor.bind("<Configure>", self.update_line_numbers)
        self.editor.bind("<KeyRelease>", self.update_line_numbers, add="+")
        self.editor.bind("<MouseWheel>", self.update_line_numbers)
        
        self.root.bind("<Control-n>", lambda event: self.new_file())
        self.root.bind("<Control-o>", lambda event: self.open_file())
        self.root.bind("<Control-i>", lambda event: self.insert_file())
        self.root.bind("<Control-s>", lambda event: self.save_file())
        self.root.bind("<Control-S>", lambda event: self.save_as())
        self.root.bind("<Control-q>", lambda event: self.quit_app())
        self.root.bind("<Control-z>", lambda event: self.undo())
        self.root.bind("<Control-x>", lambda event: self.cut())
        self.root.bind("<Control-c>", lambda event: self.copy())
        self.root.bind("<Control-v>", lambda event: self.paste())
        self.root.bind("<Control-f>", lambda event: self.find())
        self.root.bind("<Control-g>", lambda event: self.find_again())
        self.root.bind("<Control-r>", lambda event: self.replace())
        self.root.bind("<Control-t>", lambda event: self.replace_again())
        
        # Search variables
        self.search_text = ""
        self.replace_text = ""
        self.last_search_pos = "1.0"
        
        # Apply initial theme
        self.apply_theme()
        self.update_line_numbers()
    
    def toggle_theme(self):
        """Toggle between light and dark themes"""
        current_theme = self.theme_mode.get()
        new_theme = "dark" if current_theme == "light" else "light"
        self.theme_mode.set(new_theme)
        self.apply_theme()
    
    def apply_theme(self):
        """Apply the current theme to all UI elements"""
        theme = self.color_schemes[self.theme_mode.get()]
        
        # Configure main window
        self.root.configure(bg=theme["bg"])
        self.main_frame.configure(bg=theme["bg"])
        self.text_frame.configure(bg=theme["bg"])
        self.toolbar.configure(bg=theme["bg"])
        self.status_frame.configure(bg=theme["status_bg"])
        
        # Configure text editor
        self.editor.configure(
            bg=theme["text_bg"],
            fg=theme["text_fg"],
            insertbackground=theme["fg"],
            selectbackground=theme["select_bg"],
            selectforeground=theme["select_fg"]
        )
        
        # Configure line numbers
        self.line_numbers.configure(
            bg=theme["text_bg"],
            fg=theme["accent"]
        )
        
        # Configure status bar
        self.status_label.configure(
            bg=theme["status_bg"],
            fg=theme["fg"]
        )
        
        # Configure menus
        for menu in [self.file_menu, self.edit_menu, self.search_menu, self.view_menu]:
            menu.configure(
                bg=theme["menu_bg"],
                fg=theme["fg"],
                activebackground=theme["highlight_bg"],
                activeforeground=theme["fg"]
            )
        
        # Update line numbers with new theme
        self.update_line_numbers()
    
    def update_line_numbers(self, event=None):
        """Update the line numbers display"""
        # Get the total number of lines
        text_content = self.editor.get("1.0", "end-1c")
        line_count = text_content.count('\n') + 1
        
        # Enable editing of line numbers
        self.line_numbers.config(state=tk.NORMAL)
        self.line_numbers.delete("1.0", tk.END)
        
        # Add line numbers
        for i in range(1, line_count + 1):
            self.line_numbers.insert(tk.END, f"{i}\n")
        
        # Sync scrolling with main text widget
        self.line_numbers.yview_moveto(self.editor.yview()[0])
        
        # Disable editing of line numbers
        self.line_numbers.config(state=tk.DISABLED)
    
    def update_status(self, event=None):
        """Update the status bar with cursor position"""
        cursor_position = self.editor.index(tk.INSERT)
        line, column = cursor_position.split('.')
        self.status_label.config(text=f"Line: {line}, Column: {column}")
    
    def on_text_modified(self, event):
        self.editor.edit_modified(False)  # Reset the modified flag
        if not self.changed:
            self.changed = True
            self.update_title()
        
        # Update line numbers when text changes
        self.update_line_numbers()
    
    def update_title(self):
        title = os.path.basename(self.filename) if self.filename else "Untitled"
        if self.changed:
            title += " (modified)"
        self.root.title(title)
    
    def check_save(self):
        if self.changed:
            response = messagebox.askyesnocancel(
                "Save Changes",
                "The current file has not been saved.\nWould you like to save it now?"
            )
            if response is None:  # Cancel
                return False
            elif response:  # Yes
                return self.save_file()
            else:  # No
                return True
        return True
    
    def new_file(self):
        if not self.check_save():
            return
        
        self.editor.delete("1.0", tk.END)
        self.filename = ""
        self.changed = False
        self.update_title()
        self.update_line_numbers()
    
    def open_file(self):
        if not self.check_save():
            return
        
        file_path = filedialog.askopenfilename(
            filetypes=[("Text files", "*.txt"), ("Python files", "*.py"), ("All files", "*.*")]
        )
        
        if file_path:
            self.load_file(file_path)
    
    def load_file(self, file_path, insert_pos=None):
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            if insert_pos:
                self.editor.insert(insert_pos, content)
            else:
                self.editor.delete("1.0", tk.END)
                self.editor.insert("1.0", content)
                self.filename = file_path
                self.changed = False
                self.update_title()
            
            self.update_line_numbers()
        except Exception as e:
            messagebox.showerror("Error", f"Error reading from file '{file_path}':\n{str(e)}")
    
    def insert_file(self):
        file_path = filedialog.askopenfilename(
            filetypes=[("Text files", "*.txt"), ("Python files", "*.py"), ("All files", "*.*")]
        )
        
        if file_path:
            insert_pos = self.editor.index(tk.INSERT)
            self.load_file(file_path, insert_pos)
            self.changed = True
            self.update_title()
    
    def save_file(self):
        if not self.filename:
            return self.save_as()
        
        try:
            content = self.editor.get("1.0", tk.END)
            with open(self.filename, 'w', encoding='utf-8') as file:
                file.write(content)
            self.changed = False
            self.update_title()
            return True
        except Exception as e:
            messagebox.showerror("Error", f"Error writing to file '{self.filename}':\n{str(e)}")
            return False
    
    def save_as(self):
        file_path = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("Python files", "*.py"), ("All files", "*.*")]
        )
        
        if file_path:
            self.filename = file_path
            return self.save_file()
        return False
    
    def quit_app(self):
        if self.check_save():
            self.root.destroy()
    
    def undo(self):
        try:
            self.editor.edit_undo()
        except tk.TclError:
            pass
    
    def cut(self):
        if self.editor.tag_ranges(tk.SEL):
            self.copy()
            self.delete()
    
    def copy(self):
        if self.editor.tag_ranges(tk.SEL):
            self.root.clipboard_clear()
            self.root.clipboard_append(self.editor.get(tk.SEL_FIRST, tk.SEL_LAST))
    
    def paste(self):
        try:
            text = self.root.clipboard_get()
            self.editor.insert(tk.INSERT, text)
        except tk.TclError:
            pass
    
    def delete(self):
        if self.editor.tag_ranges(tk.SEL):
            self.editor.delete(tk.SEL_FIRST, tk.SEL_LAST)
    
    def find(self):
        find_dialog = tk.Toplevel(self.root)
        find_dialog.title("Find")
        find_dialog.transient(self.root)
        find_dialog.resizable(False, False)
        find_dialog.geometry("300x100")
        
        # Apply theme to dialog
        theme = self.color_schemes[self.theme_mode.get()]
        find_dialog.configure(bg=theme["bg"])
        
        # Create widgets
        tk.Label(find_dialog, text="Find what:", bg=theme["bg"], fg=theme["fg"]).grid(row=0, column=0, sticky=tk.W, padx=10, pady=10)
        find_entry = tk.Entry(find_dialog, width=25, bg=theme["text_bg"], fg=theme["text_fg"])
        find_entry.grid(row=0, column=1, padx=5, pady=10)
        find_entry.insert(0, self.search_text)
        
        # Buttons
        button_frame = tk.Frame(find_dialog, bg=theme["bg"])
        button_frame.grid(row=1, column=0, columnspan=2, pady=10)
        
        find_next_btn = ttk.Button(
            button_frame, text="Find Next", 
            command=lambda: self.find_next_action(find_entry.get(), find_dialog)
        )
        find_next_btn.pack(side=tk.LEFT, padx=5)
        
        cancel_btn = ttk.Button(button_frame, text="Cancel", command=find_dialog.destroy)
        cancel_btn.pack(side=tk.LEFT, padx=5)
        
        # Make dialog modal
        find_entry.focus_set()
        find_dialog.grab_set()
        find_dialog.wait_window()
    
    def find_next_action(self, find_text, dialog=None):
        self.search_text = find_text
        if dialog:
            dialog.destroy()
        
        self.find_again()
    
    def find_again(self):
        if not self.search_text:
            self.find()
            return
        
        # Clear previous selection
        self.editor.tag_remove(tk.SEL, "1.0", tk.END)
        
        # Start search from last position
        start_pos = self.last_search_pos
        if start_pos == tk.END:
            start_pos = "1.0"
        
        # Find text (case-insensitive)
        pos = self.editor.search(self.search_text, start_pos, nocase=True, stopindex=tk.END)
        
        if pos:
            end_pos = f"{pos}+{len(self.search_text)}c"
            self.editor.tag_add(tk.SEL, pos, end_pos)
            self.editor.mark_set(tk.INSERT, end_pos)
            self.editor.see(pos)
            self.last_search_pos = end_pos
        else:
            messagebox.showinfo("Find", f"Cannot find '{self.search_text}'")
            self.last_search_pos = "1.0"
    
    def replace(self):
        # Create a dialog for replace
        replace_dialog = tk.Toplevel(self.root)
        replace_dialog.title("Replace")
        replace_dialog.transient(self.root)
        replace_dialog.resizable(False, False)
        replace_dialog.geometry("350x150")
        
        # Apply theme to dialog
        theme = self.color_schemes[self.theme_mode.get()]
        replace_dialog.configure(bg=theme["bg"])
        
        # Create widgets
        tk.Label(replace_dialog, text="Find:", bg=theme["bg"], fg=theme["fg"]).grid(row=0, column=0, sticky=tk.W, padx=10, pady=10)
        find_entry = tk.Entry(replace_dialog, width=25, bg=theme["text_bg"], fg=theme["text_fg"])
        find_entry.grid(row=0, column=1, padx=5, pady=10)
        find_entry.insert(0, self.search_text)
        
        tk.Label(replace_dialog, text="Replace with:", bg=theme["bg"], fg=theme["fg"]).grid(row=1, column=0, sticky=tk.W, padx=10, pady=10)
        replace_entry = tk.Entry(replace_dialog, width=25, bg=theme["text_bg"], fg=theme["text_fg"])
        replace_entry.grid(row=1, column=1, padx=5, pady=10)
        replace_entry.insert(0, self.replace_text)
        
        # Buttons
        button_frame = tk.Frame(replace_dialog, bg=theme["bg"])
        button_frame.grid(row=2, column=0, columnspan=2, pady=10)
        
        replace_all_btn = ttk.Button(
            button_frame, text="Replace All", 
            command=lambda: self.replace_all_action(find_entry.get(), replace_entry.get(), replace_dialog)
        )
        replace_all_btn.pack(side=tk.LEFT, padx=5)
        
        replace_next_btn = ttk.Button(
            button_frame, text="Replace Next", 
            command=lambda: self.replace_next_action(find_entry.get(), replace_entry.get(), replace_dialog)
        )
        replace_next_btn.pack(side=tk.LEFT, padx=5)
        
        cancel_btn = ttk.Button(button_frame, text="Cancel", command=replace_dialog.destroy)
        cancel_btn.pack(side=tk.LEFT, padx=5)
        
        # Make dialog modal
        find_entry.focus_set()
        replace_dialog.grab_set()
        replace_dialog.wait_window()
    
    def replace_next_action(self, find_text, replace_text, dialog=None):
        self.search_text = find_text
        self.replace_text = replace_text
        
        if dialog:
            dialog.destroy()
        
        # If there's a selection, replace it
        if self.editor.tag_ranges(tk.SEL):
            sel_first = self.editor.index(tk.SEL_FIRST)
            sel_last = self.editor.index(tk.SEL_LAST)
            selected_text = self.editor.get(sel_first, sel_last)
            
            if selected_text.lower() == self.search_text.lower():
                self.editor.delete(sel_first, sel_last)
                self.editor.insert(sel_first, self.replace_text)
                end_pos = f"{sel_first}+{len(self.replace_text)}c"
                self.last_search_pos = end_pos
        
        # Find the next occurrence
        self.find_again()
    
    def replace_again(self):
        if not self.search_text or not self.replace_text:
            self.replace()
            return
        
        self.replace_next_action(self.search_text, self.replace_text)
    
    def replace_all_action(self, find_text, replace_text, dialog=None):
        self.search_text = find_text
        self.replace_text = replace_text
        
        if dialog:
            dialog.destroy()
        
        if not self.search_text:
            return
        
        # Start from the beginning
        start_pos = "1.0"
        count = 0
        
        while True:
            pos = self.editor.search(self.search_text, start_pos, nocase=True, stopindex=tk.END)
            if not pos:
                break
            
            end_pos = f"{pos}+{len(self.search_text)}c"
            self.editor.delete(pos, end_pos)
            self.editor.insert(pos, self.replace_text)
            
            # Update start position for next search
            start_pos = f"{pos}+{len(self.replace_text)}c"
            count += 1
        
        if count > 0:
            messagebox.showinfo("Replace", f"Replaced {count} occurrences")
        else:
            messagebox.showinfo("Replace", f"Cannot find '{self.search_text}'")

if __name__ == "__main__":
    root = tk.Tk()
    style = ttk.Style()
    style.theme_use('clam')  # Use a modern theme for ttk widgets
    editor = ModernTextEditor(root)
    root.protocol("WM_DELETE_WINDOW", editor.quit_app)
    root.mainloop()
