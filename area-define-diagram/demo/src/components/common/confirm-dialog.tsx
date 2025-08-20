// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React from 'react';
import styled from 'styled-components';

import BCButton from './bc-button';

interface IConfirmDialog {
    open: boolean;
    title: string;
    content: string;
    hint?: string;
    width?: number;
    onYes?: () => void;
    onNo?: () => void;
}

const DialogBackDrop = styled.div<{ open }>`
    display: flex;
    flex-direction: column;
    position: fixed;
    z-index: 1;
    padding-top: 100px;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.4);
    display: ${(prop) => prop?.open ? 'block' : 'none'};
`;

const Dialog = styled.div<{width}>`
    position: absolute;
    background: white;
    width: ${(props) => props?.width ? `${props.width}px` : '300px'};
    border-radius: 5px;
    padding: 15px;
    left: 50%;
    top: 30%;
    transform: translate(-50%, -50%);
`

const DialogHeader = styled.div`
    font-size: 20px;
    font-weight: bold;
    color: black;
    margin-bottom: 10px;
`

const DialogContent = styled.div`
    color: black;
    margin-bottom: 15px;
`

const DialogFooter = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
`

const ConfirmDialog = ( props: IConfirmDialog ) => {

    const {
        open, title, content, width,
        onYes, onNo,
    } = props;

    /**
     * @return {void}
     */
    const onProcessNo = () => onNo && onNo();

    /**
     * @return {void}
     */
    const onProcessYes = () => onYes && onYes();

    return(
        <DialogBackDrop open={open} onClick={onProcessNo}>
            <Dialog width={width} onClick={( event: any ) => event?.stopPropagation()}>
                <DialogHeader>{ title }</DialogHeader>
                <DialogContent>{ content }</DialogContent>
                <DialogFooter>
                    <BCButton variant="outlined" text="No" width="60px" height="30px" onClick={onProcessNo} />
                    <BCButton variant="contained" text="Yes" className="ml-2" width="60px" height="30px" onClick={onProcessYes} />
                </DialogFooter>
            </Dialog>
        </DialogBackDrop>
    );
}

export default ConfirmDialog;