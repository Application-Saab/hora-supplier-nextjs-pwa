"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import { useRouter } from "next/navigation";

const SelectFolderModal = ({ isOpen, onClose, onAddFolder, onNext, subFolders = [] }) => {

    const [selectedFolder, setSelectedFolder] = useState(null);
    const router = useRouter();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select the folder">
            <div className="sf-wrapper">
                <div className="sf-grid">
                    {/* Create folder card */}
                    <div className="sf-add-card" onClick={onAddFolder}>
                        <div className="sf-add-circle">
                            <svg
                                width="25.36"
                                height="28.47"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M7 1V13M1 7H13"
                                    stroke="#8b5a8c"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="sf-add-title">Create Folder</div>
                            <div className="sf-add-sub">Add New folder</div>
                        </div>
                    </div>

                    {subFolders.map((subFolder) => (
                        <div
                            key={subFolder._id}
                            className="sf-folder"
                            onClick={() => setSelectedFolder(subFolder)}
                        >
                            <div
                                className="outer-sf-folder-circle"
                                style={{
                                    border:
                                        selectedFolder?._id === subFolder._id
                                            ? "2.14px solid #8b5a8c"
                                            : "2.14px solid #E0E0E0",
                                }}
                            >
                                <div className="sf-folder-circle">
                                    {subFolder.folderDp ? (
                                        <img src={subFolder.folderDp} alt={subFolder.folderName} />
                                    ) : (
                                        <span>
                                            {subFolder.folderName?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <span className="sf-folder-name">
                                {subFolder.folderName}
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    className="sf-next-btn"
                    onClick={() => router.push(`/myProfile/subfolder/${selectedFolder._id}`)}
                    disabled={!selectedFolder}
                >
                    Next
                </button>
            </div>
        </Modal>
    );
};

export default SelectFolderModal;