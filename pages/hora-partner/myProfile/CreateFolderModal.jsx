"use client";

import React from "react";
import Modal from "./Modal";

const CreateFolderModal = ({
    isOpen,
    onClose,
    folderName,
    setFolderName,
    onCreate,
    loading,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <form
                className="cf-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    onCreate();
                }}
            >
                <h2 className="cf-heading">Create New Folder</h2>

                <input
                    type="text"
                    className="cf-input"
                    placeholder="Type Folder Name"
                    value={typeof folderName === "string" ? folderName : ""}
                    onChange={(e) => setFolderName(e.target.value)}
                    maxLength={50}
                />

                <button
                    type="submit"
                    className="cf-create-btn"
                    disabled={loading || !(typeof folderName === "string" ? folderName : "").trim()}
                >
                    {loading ? "Creating..." : "Create"}
                </button>
            </form>
        </Modal>
    );
};

export default CreateFolderModal;