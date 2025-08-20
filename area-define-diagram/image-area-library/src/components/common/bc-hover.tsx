// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useRef, useEffect } from "react";
import { Html } from 'react-konva-utils';
import styled from 'styled-components';

const HoverStyle = styled.div<{
    minHeight: number, minWidth: number, maxWidth: number
}>`
    display: flex;
    align-items: center;
    background-color: #111111CC;
    color: #fff;
    text-align: center;
    padding: 5px;
    border-radius: 10px;
    min-height: ${(props) => props.minHeight ? `${props.minHeight}px` : '50px' };
    min-width: ${(props) => props.minWidth ? `${props.minWidth}px` : '150px' };
    max-width: ${(props) => props.maxWidth ? `${props.maxWidth}px` : '300px' };

    &::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: black transparent transparent transparent;
    }`;

export interface IBCHover {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    maxWidth?: number;
    minHeight?: number;
    minWidth?: number;
    text: string;
    setOffsetHover?: ( ouput: { offsetWidth: number, offsetHeight: number } ) => void; 
}

const BCHover = ( {
    top , left, right,
    bottom, maxWidth, minHeight,
    minWidth, text,
    setOffsetHover
}: IBCHover ) => {

    /**
     * useRef
     */
    const ref = useRef();

    /**
     * useEffect
     */
    useEffect( () => {
        if ( !ref.current ) return;

        const { offsetWidth, offsetHeight } = ref.current as any;

        setOffsetHover && setOffsetHover({ offsetWidth, offsetHeight });
    }, [ref.current] );

    return (
        <Html
            divProps={{
                style: {
                    position: 'absolute',
                    top: `${top}px`,
                    left: `${left}px`,
                    bottom: `${bottom}px`,
                    right: `${right}px`,
                },
            }} >
            <HoverStyle
                ref={ref}
                minWidth={minWidth}
                maxWidth={maxWidth}
                minHeight={minHeight} >
                <div className="w-full px-2 text-[12px] whitespace-pre-line text-left leading-tight">{ text }</div>
            </HoverStyle>
        </Html>
    );
}

export default BCHover;