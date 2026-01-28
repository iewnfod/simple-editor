import './App.css';
import {SimpleEditor} from "@/components/tiptap-templates/simple/simple-editor.tsx";
import {useEffect, useState} from "react";

function App() {
  const [initialContent, setInitialContent] = useState<string>("");
  const [isEditable, setIsEditable] = useState<boolean>(true);
  const [showToolbar, setShowToolbar] = useState<boolean>(true);
  const [placeholder, setPlaceholder] = useState<string>('Start writing...');
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    console.log('ACCESS_KEY:', import.meta.env.ACCESS_KEY);
    if (import.meta.env.ACCESS_KEY) {
      const key = params.get('key');
      console.log(`Editor Key: ${key}`);
      if (key !== import.meta.env.ACCESS_KEY) {
        setIsDisabled(true);
        return;
      }
    }

    const theme = params.get('theme');
    if (theme === 'dark') {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
    } else if (theme === 'light') {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }

    const contentParam = params.get('content');
    if (contentParam) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInitialContent(decodeURIComponent(contentParam));
      } catch (e) {
        console.error('Failed to decode content param:', e);
      }
    }

    // 获取其他配置
    const editableParam = params.get('editable');
    if (editableParam !== null) {
      setIsEditable(editableParam !== 'false');
    }

    const toolbarParam = params.get('showToolbar');
    if (toolbarParam !== null) {
      setShowToolbar(toolbarParam !== 'false');
    }

    const placeholderParam = params.get('placeholder');
    if (placeholderParam) {
      try {
        setPlaceholder(decodeURIComponent(placeholderParam));
      } catch (e) {
        console.error('Failed to decode placeholder param:', e);
      }
    }
  }, []);

  if (isDisabled) {
    return (
      <div>
        Invalid Access Key
      </div>
    );
  }

  return (
    <SimpleEditor
      initialContent={initialContent}
      showToolbar={showToolbar}
      placeholder={placeholder}
      editable={isEditable}
    />
  );
}

export default App;
