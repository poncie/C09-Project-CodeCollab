import React from "react";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/theme/monokai.css";
import "codemirror/mode/xml/xml";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/css/css";
import { Controlled as ControlledEditor } from "react-codemirror2";

interface EditorProps {
    displayName: String;
    language: string;
    code: any;
    onChange: any;
    readOnly?: boolean;
}

function Editor({
    displayName,
    language,
    code,
    onChange,
    readOnly,
}: EditorProps) {

    let isReadOnly = readOnly ? readOnly : false;
    
    function handleChange(editor: any, data: String, value: string) {
        onChange({ ...code, [language]: value });
    }
    return (
        <div className="w-full h-full" >
            <div className="bg-gray-700 flex justify-between py-2 px-3 text-white">
                {displayName}
            </div>
          <ControlledEditor
            className="h-full w-full"
            onBeforeChange={handleChange}
            value={code[language]}
            options={{
                lint:true,
                mode:language,
                lineWrapping:true,
                lineNumbers: true,
                theme:'monokai',
                foldGutter:true,
                maxHighlightLength:Infinity,
                autocorrect:true
            }}
            editorDidMount={e => {e.setSize(null, '100%')
        }}
          
          />
        </div>
    );
}

export default Editor;
