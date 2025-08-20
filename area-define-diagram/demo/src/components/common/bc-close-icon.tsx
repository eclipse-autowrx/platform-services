// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React from 'react';
import styled from 'styled-components';

const CloseIcon = styled.div`
    position: relative;
    width: 20px;
    height: 20px;
    opacity: 0.3;

    &:hover {
        opacity: 1;
        cursor: pointer;
    }

    &:before,
    &:after {
        position: absolute;
        content: ' ';
        height: 20px;
        width: 2px;
        background-color: #333;
    }

    &:before {
        transform: rotate(45deg);
    }

    &:after {
        transform: rotate(-45deg);
    }
`;

const BCCloseIcon = ({ onClick }) => { return ( <CloseIcon onClick={onClick} /> ) }
export default BCCloseIcon;