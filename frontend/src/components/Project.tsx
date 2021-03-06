import { useEffect, useState } from "react";
import { ResizableBox } from "react-resizable";

import Language from "../@types/language";
import CodeRender from "../components/CodeRender";
import Dropdown from "../components/Dropdown";
import Editor from "../components/Editor";
import Navbar from "../components/Navbar";
import CopyPopup from "../components/CopyPopup";
import ButtonOCR from "../components/OCR/ButtonOCR";
import { Languages } from "../config/languages";
import { useQuery } from "@apollo/client";
import projectOperations from "../graphql/operations/projectOperations";
import LoadingScreen from "../components/LoadingScreen";
import { useParams } from "react-router-dom";
import OwnerCard from "./OwnerCard";

import ShareDB from "sharedb/lib/client";
import { Socket } from "sharedb/lib/sharedb";
import AddCollaboratorButton from "./addCollaborator/addCollaboratorButton";
const otText = require("ot-text");
const ShareDBCodeMirror = require("sharedb-codemirror");
ShareDB.types.map["json0"].registerSubtype(otText.type);

interface ProjectProps {
    code: any;
    setCode?: any;
    errorBox: any;
    visible: boolean;
    isOwner: boolean;
    isCollaborator: boolean;
}

const Project: React.FC<ProjectProps> = ({
    code,
    setCode,
    errorBox,
    visible,
    isOwner,
    isCollaborator,
}) => {
    // Get project ID from route
    const params: any = useParams();
    const projectId = params.projectId;
    const [openCopyPopup, setOpenCopyPopup] = useState(false);

    // Get Project
    const { data, loading } = useQuery(projectOperations.getProjectById, {
        variables: {
            id: projectId,
        },
    });

    const socket = new WebSocket(process.env.REACT_APP_WEB_SOCKET!);
    const shareConnection = new ShareDB.Connection(socket as Socket);
    const isReadOnly = !(isOwner || isCollaborator);
    const [html, setHtml] = useState("");
    const [htmlVisible, setHtmlVisible] = useState(true);
    const [css, setCss] = useState("");
    const [cssVisible, setCssVisible] = useState(false);
    const [js, setJs] = useState("");
    const [jsVisible, setJsVisible] = useState(false);

    function setupShareDB(editor: any, lang: any) {
        let doc = shareConnection.get("files", data.getProjectById[lang]);
        ShareDBCodeMirror.attachDocToCodeMirror(doc, editor, {
            key: "content",
            verbose: false,
        });
    }

    function changeLanguage(item: any) {
        setSelected(item);
        if (item.option === "HTML") {
            setJsVisible(false);
            setCssVisible(false);
            setHtmlVisible(true);
        } else if (item.option === "CSS") {
            setHtmlVisible(false);
            setJsVisible(false);
            setCssVisible(true);
        } else if (item.option === "JS") {
            setHtmlVisible(false);
            setCssVisible(false);
            setJsVisible(true);
        }
    }

    const srcDoc = `
       <!DOCTYPE html>
       <html lang="en">
           <head>
               <meta charset="utf-8" />
               <title>The HTML5 Herald</title>
               <meta name="description" content="The HTML5 Herald" />
               <meta name="author" content="SitePoint" />
               <style>
                   ${css}
               </style>
           </head>

           <body>
               ${html}
               <script>
                   ${js}
               </script>
           </body>
       </html>`;

    const [width, setWidth] = useState<number>(window.innerWidth);

    const [selected, setSelected] = useState<Language>(Languages[0]);

    useEffect(() => {
        window.addEventListener("resize", () => {
            setWidth(window.innerWidth);
        });
        return () => {
            window.removeEventListener("resize", () => {
                setWidth(window.innerWidth);
            });
        };
    }, []);

    // Called when copy popup is closed
    const handleCloseCopyPopup = (event: object, reason: string) => {
        if (reason === "clickaway") {
            return;
        }
        setOpenCopyPopup(false);
    };

    if (loading) return <LoadingScreen />;
    return (
        <div className="bg-blue-100 h-full w-full overflow-auto">
            <Navbar />
            {visible && errorBox}

            <OwnerCard
                name={data.getProjectById.name}
                email={data.getProjectById.owner.email}
                setOpenCopyPopup={setOpenCopyPopup}
                isReadOnly={isReadOnly}
            />
            <div className="flex justify-evenly">
                <Dropdown
                    title="Select Language"
                    list={Languages}
                    setSelected={changeLanguage}
                    className="py-2 px-5 w-1/5 shadow-xs"
                />
                <ButtonOCR />
                {isOwner && <AddCollaboratorButton projectId={projectId} />}
            </div>

            <div className="h-full w-full m-0 flex">
                <ResizableBox
                    className="relative flex justify-items-center m-1 shadow-xs"
                    height={window.innerHeight * 1}
                    width={width / 2}
                    maxConstraints={[
                        (width * 5) / 2,
                        window.innerHeight * 0.75,
                    ]}
                    minConstraints={[width / 2, window.innerHeight * 0.75]}
                    axis="x"
                    handle={
                        <div
                            className="absolute right-0 h-10 w-20 bg-no-repeat shadow-md bg-center bg-gray-500 cursor-pointer"
                            style={{
                                backgroundImage: `url(/media/horizontal-resize.svg)`,
                            }}
                        />
                    }
                    handleSize={[20, 20]}
                >
                    <Editor
                        language={"xml"}
                        displayName={"HTML"}
                        onChange={setHtml}
                        code={html}
                        setupShareDB={setupShareDB}
                        readOnly={isReadOnly ? isReadOnly : false}
                        visible={htmlVisible}
                    />
                    <Editor
                        language={"css"}
                        displayName={"CSS"}
                        onChange={setCss}
                        code={css}
                        setupShareDB={setupShareDB}
                        readOnly={isReadOnly ? isReadOnly : false}
                        visible={cssVisible}
                    />
                    <Editor
                        language={"javascript"}
                        displayName={"JS"}
                        onChange={setJs}
                        code={js}
                        setupShareDB={setupShareDB}
                        readOnly={isReadOnly ? isReadOnly : false}
                        visible={jsVisible}
                    />
                </ResizableBox>
                <ResizableBox
                    className="relative px-2 flex justify-items-center m-1 shadow-xs"
                    height={window.innerHeight * 1}
                    width={width / 2}
                    maxConstraints={[
                        (width * 5) / 2,
                        window.innerHeight * 0.75,
                    ]}
                    minConstraints={[width / 2, window.innerHeight * 0.75]}
                    axis="x"
                >
                    <CodeRender srcDoc={srcDoc} />
                </ResizableBox>
                <CopyPopup
                    openCopyPopup={openCopyPopup}
                    handleCloseCopyPopup={handleCloseCopyPopup}
                />
            </div>
        </div>
    );
};

export default Project;
