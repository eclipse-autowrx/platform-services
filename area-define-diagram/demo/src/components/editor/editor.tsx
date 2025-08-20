// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useState, useCallback, useEffect } from "react";
import _ from 'lodash';

import { BCFormEditor, BCTextShapeEditor } from '.';
import { IAllShape } from '../shapes';
import { ConfirmDialog, BCCloseIcon, BCButton } from "../common";
import { SHAPE } from "../shapes/constant";

interface IEditor {
    shape?: IAllShape;
    onSave?: ( currShape: IAllShape ) => void;
    onDelete?: ( id: string ) => void;
    onClose?: () => void;
}

const Editor = ( props: IEditor ) => {

    const { shape, onClose, onSave, onDelete } = props;

    /**
     * useState
     */
    const [ isOpenDeleteDialog, setOpenDeleteDialog ] = useState<boolean>();

    /**
     * @return {void}
     */
    const checkKeyPress = useCallback(({ keyCode }) => keyCode === 27 && onClose(), []); // ESC key
    
    useEffect( () => {
        window.addEventListener("keydown", checkKeyPress);
        return () => window.removeEventListener("keydown", checkKeyPress);
    }, [ checkKeyPress ] );

    /**
     * @param {IAllShape} curShape
     * @return {void}
     */
    const onFormChange = ( curShape: IAllShape ) => {
        onSave( curShape );
    }

    /**
     * @param {boolean=} answer
     * @return {void}
     */
    const onRemoveDialogAction = ( answer?: boolean ) => {
        setOpenDeleteDialog( false );
        answer && onDelete( shape.id );
    }

    return (
        <div className="w-full h-full flex flex-col" >
            <ConfirmDialog
                open={isOpenDeleteDialog}
                title="Remove"
                content="Do you want to remove this shape?"
                onYes={() => onRemoveDialogAction( true )}
                onNo={() => onRemoveDialogAction()} />
            <div className="flex items-center">
                <div className="text-xl font-semibold mb-2.5 text-black flex-1">Settings</div>
                <BCCloseIcon onClick={onClose} />
            </div>
            {
                shape?.type === SHAPE.TEXT
                    ? <BCTextShapeEditor shape={shape} onChange={onFormChange} />
                    : <BCFormEditor shape={shape} onChange={onFormChange} />
            }
            <div className="mt-3 flex items-center justify-center">
                <BCButton
                    variant="outlined"
                    text="Remove"
                    className="mr-1.5"
                    icon={{ name: "trash", fill: "red" }}
                    color="red"
                    width="100%"
                    height="40px"
                    onClick={() => setOpenDeleteDialog( true )} />
                <BCButton
                    variant="contained"
                    text="Close"
                    icon={{ name: "check", fill: "white" }}
                    width="100%"
                    height="40px"
                    onClick={onClose} />
            </div>
        </div>
    );
}

export default Editor;