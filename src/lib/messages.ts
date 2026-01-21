export interface ParentMessage {
  type: string;
  [key: string]: any;
}

export interface EditorMessage extends ParentMessage {
  type:
    | 'CONTENT_CHANGE'
    | 'EDITOR_READY'
    | 'EDITOR_FOCUS'
    | 'EDITOR_BLUR'
    | 'EDITOR_ERROR'
    | 'COMMAND_EXECUTED'
    | 'CLEAR';
}

export interface ParentMessageHandlers {
  [type: string]: (data: any) => void;
}

// 父窗口发送给编辑器的消息类型
export interface SetContentMessage {
  type: 'SET_CONTENT';
  content: string;
}

export interface SetEditableMessage {
  type: 'SET_EDITABLE';
  editable: boolean;
}

export interface FocusMessage {
  type: 'FOCUS';
}

export interface InsertTextMessage {
  type: 'INSERT_TEXT';
  text: string;
}

export interface ClearMessage {
  type: 'CLEAR';
}

export type IncomingMessage =
  | SetContentMessage
  | SetEditableMessage
  | FocusMessage
  | InsertTextMessage
  | ClearMessage;
