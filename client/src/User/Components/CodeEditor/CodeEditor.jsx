// client/src/Components/CodeEditor/CodeEditor.jsx
import React from "react";
import Editor from "@monaco-editor/react";
import styles from "../../Styles/CodePlayground/CodeEditor.module.css";

const CodeEditor = ({ code, onChange, language = "plaintext" }) => {
    return (
        <div className={styles.editorContainer}>
            <Editor
                height="35rem"
                language={language}
                value={code}
                onChange={onChange}
                theme="vs-dark"
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
    );
};

export default CodeEditor;
