"use client"

import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"

// --- UI Primitives ---
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"
import {useCallback, useEffect, useState} from "react";
import {sendMessageToParent, useMessageHandler} from "@/hooks/use-message-handler.ts";

const MainToolbarContent = ({
  isMobile,
}: {
  isMobile: boolean
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        <ColorHighlightPopover />
        <LinkPopover />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <Spacer />
    </>
  )
}

export function SimpleEditor({
  initialContent,
  editable,
  showToolbar,
  placeholder
} : {
  initialContent: string;
  editable: boolean;
  showToolbar: boolean;
  placeholder: string;
}) {
  const isMobile = useIsBreakpoint();
  const [content, setContent] = useState(initialContent);
  const [isEditable, setIsEditable] = useState(editable);
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
    ],
    content,
    editable,
    onUpdate: ({ editor: updatedEditor }) => {
      const html = updatedEditor.getHTML();
      setContent(html);

      // 发送内容变化消息给父窗口
      sendMessageToParent({
        type: 'CONTENT_CHANGE',
        content: html,
        text: updatedEditor.getText(),
        json: updatedEditor.getJSON(),
        isEmpty: updatedEditor.isEmpty,
      });
    },
    onFocus: () => {
      setIsFocused(true);
      sendMessageToParent({
        type: 'EDITOR_FOCUS',
      });
    },
    onBlur: () => {
      setIsFocused(false);
      sendMessageToParent({
        type: 'EDITOR_BLUR',
      });
    },
    onCreate: () => {
      sendMessageToParent({
        type: 'EDITOR_READY',
      });
    },
  });

  // 处理来自父窗口的消息
  useMessageHandler(useCallback((message) => {
    if (!editor) return;

    switch (message.type) {
      case 'SET_CONTENT':
        editor.commands.setContent(message.content || '');
        break;

      case 'SET_EDITABLE':
        setIsEditable(message.editable);
        editor.setEditable(message.editable);
        break;

      case 'FOCUS':
        editor.commands.focus();
        break;

      case 'INSERT_TEXT':
        editor.commands.insertContent(message.text || '');
        break;

      case 'CLEAR':
        editor.commands.clearContent();
        break;

      default:
        console.warn('Unknown message:', message);
    }
  }, [editor]));

  useEffect(() => {
    editor?.setEditable(isEditable);
    if (isFocused) {
      editor?.commands.focus();
    }
  }, [editor, isFocused, isEditable]);

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        {
          showToolbar && (
            <Toolbar>
              <MainToolbarContent
                isMobile={isMobile}
              />
            </Toolbar>
          )
        }
        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
          placeholder={placeholder}
        />
      </EditorContext.Provider>
    </div>
  );
}
