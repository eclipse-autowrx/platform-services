// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useRef } from 'react';
import styled from 'styled-components';
import { ALL_ICONS, BCIcon } from './bc-icon';

interface IBCUploadButton {
    disabled?: boolean;
    className?: string;
    height?: string;
    width?: string;
    text?: string;
    padding?: string;
    handleUploadImage?: ( event: any ) => void;
}

const ButtonStyle = styled.button<{width: string, height: string, padding: string }>`
    border-radius: 5px;
    position: relative;
    font-weight: bold;
    width: ${(props) => !props.width ? 'fit-content' : `${props.width}`};
    height: ${(props) => !props.height ? 'fit-content' : `${props.height}`};
    padding: ${(props) => !props.padding ? '0px' : `${props.padding}`};

    &.outlined {
        color: #1976d2;
    }
`;

const Upload = styled.input`
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    left: 0;
    white-space: nowrap;
    width: 1;
`;

const BCUploadButton = ( props: IBCUploadButton ) => {

    const {
        disabled, className, height,
        width, text, padding,
        handleUploadImage
    } = props;

    const openInput = () => {
        inputRef?.current && ( inputRef.current as any ).click();
    };

    const inputRef = useRef();

    return (
        <ButtonStyle
            className={`outlined ${className}`}
            height={height}
            width={width}
            padding={padding}
            disabled={disabled}
            onClick={openInput} >
            <div className="flex items-center justify-center">
                <span className="mr-1.5"><BCIcon name={ALL_ICONS.CLOUD_UPLOAD} fill="#1976d2"/> </span>
                { text }
            </div>
            <Upload
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadImage} />
        </ButtonStyle>
    );
}

export default BCUploadButton;