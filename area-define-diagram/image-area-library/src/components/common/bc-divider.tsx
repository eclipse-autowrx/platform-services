// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React from 'react';
import styled from 'styled-components';

interface IBCDivider {
    horizontal?: boolean;
    color?: string;
    className?: string;
    borderWidth?: string;
}

const HorizontalDivider = styled.div<{borderWidth: string, color: string}>`
    border-bottom-style: solid;
    border-bottom-width: ${(props) => props.borderWidth ? `${props.borderWidth}` : '1px' }; 
    border-bottom-color: ${(props) => props.color ? `${props.color}` : 'black' };
    width: 100%;
`;

const VerticalDivider = styled.div<{borderWidth: string, color: string}>`
    border-right-style: solid;
    border-right-width: ${(props) => props.borderWidth ? `${props.borderWidth}` : '1px' }; 
    border-right-color: ${(props) => props.color ? `${props.color}` : 'black' }; 
    height: 100%;
`;

const BCDivider = ( props: IBCDivider ) => {

    const { borderWidth, horizontal, color, className } = props;

    return ( 
        <>
            {
                !horizontal && (
                    <div className="flex flex-col h-full">
                        <VerticalDivider className={className} color={color} borderWidth={borderWidth} />
                    </div>
                )
            }
            {
                horizontal && (
                    <div className="flex flex-col w-full">
                        <HorizontalDivider className={className} color={color} borderWidth={borderWidth} />
                    </div>
                )
            }
        </>
        
    );
}
export default BCDivider;