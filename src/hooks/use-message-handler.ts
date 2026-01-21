import { useEffect } from 'react';
import type {IncomingMessage, ParentMessage} from '../lib/messages';

type MessageHandler = (message: IncomingMessage) => void;

export function useMessageHandler(onMessage: MessageHandler) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent<IncomingMessage>) => {
      // 安全验证：检查消息来源
      if (event.source !== window.parent) {
        return;
      }

      if (event.data && event.data.type) {
        try {
          onMessage(event.data);
        } catch (error) {
          console.error('Error handling message:', error, event.data);
          // 发送错误消息回父窗口
          sendMessageToParent({
            type: 'EDITOR_ERROR',
            error: 'Failed to handle message',
            details: error instanceof Error ? error.message : String(error),
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // 发送就绪消息
    const timer = setTimeout(() => {
      sendMessageToParent({
        type: 'EDITOR_READY',
      });
    }, 100);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timer);
    };
  }, [onMessage]);
}

export function sendMessageToParent(message: ParentMessage) {
  if (window.parent) {
    window.parent.postMessage(message, '*');
  }
}
