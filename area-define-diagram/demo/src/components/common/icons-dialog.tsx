// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import _ from 'lodash';

import BCButton from './bc-button';
import { BCIcon, ALL_ICONS } from './bc-icon';

interface IIConsDialog {
    open: boolean;
    onClose: () => void;
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

const Dialog = styled.div`
    position: absolute;
    background: white;
    max-height: 400px;
    overflow: auto;
    border-radius: 5px;
    padding: 15px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
`

const IconsDialog = ( props: IIConsDialog ) => {

    const { open, onClose } = props;

    /**
     * useState
     */
    const [ iconKeys, setIconKeys ] = useState<string[]>([]);

    /**
     * useEffect
     */
    useEffect( () => setIconKeys( _.keys( ALL_ICONS ) ), [] );

    return(
        <DialogBackDrop open={open} onClick={onClose}>
            <Dialog onClick={(event: any) => { event.stopPropagation(), event.stopPropagation() }}>
                <div className="flex items-center flex-wrap text-black">
                    {
                        _.map( iconKeys, ( iconKey: any ) => {
                            return (
                                <div className="flex items-center flex-col mb-2" style={{ width: "80px" }}>
                                    <BCIcon name={ALL_ICONS[iconKey]} fill={'black'} />
                                    <div className="text-xs font-semibold">{ ALL_ICONS[iconKey] }</div>
                                </div>
                            )
                        } )
                    }
                </div>
                <div className="flex items-center justify-end">
                    <BCButton variant="outlined" text="Close" width="60px" height="30px" onClick={onClose} />
                </div>
            </Dialog>
        </DialogBackDrop>
    );
}

export default IconsDialog;