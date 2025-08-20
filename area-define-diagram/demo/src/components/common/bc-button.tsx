// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import _ from 'lodash';

import { BCIcon, IBCIcon } from './bc-icon';
import { clickOutside } from '../helpers';

type IVariant = 'contained' | 'outlined';

interface IBCButton {
    text?: string;
    width?: string;
    height?: string;
    padding?: string;
    variant?: IVariant;
    className?: string;
    bgColor?: string;
    color?: string;
    icon?: IBCIcon;
    disabled?: boolean;
    menu?: any[];
    style?: any;
    onClick?: () => void;
}

const ButtonStyle = styled.button<{
    variant: IVariant, width: string, height: string,
    padding: string, bgColor: string, color: string
}>`
    border-radius: 5px;
    font-weight: bold;
    position: relative;
    width: ${(props) => !props.width ? 'fit-content' : `${props.width}`};
    height: ${(props) => !props.height ? 'fit-content' : `${props.height}`};
    padding: ${(props) => !props.padding ? '0px' : `${props.padding}`};

    &.contained {
        background-color: ${(props) => props?.bgColor ? props?.bgColor : '#1976d2'};
        color: ${(props) => props?.color ? props?.color : '#fff'};
    }

    &.outlined {
        background-color: ${(props) => props?.bgColor ? props?.bgColor : '#fff'};
        color: ${(props) => props?.color ? props?.color : '#1976d2'};
        border-color: ${(props) => props?.color ? props?.color : '#1976d2'};
        border-style: solid;
        border-width: 1px;
    }

    &:disabled {
        color: #fff;
        background-color: lightgray;
        border: none;
    }
`;

const List = styled.ul`
    position: absolute;
    box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 0px 1px, rgba(0, 0, 0, 0.15) 0px 8px 16px;
    z-index: 2;
    background-color: white;
    color: black;
    margin-top: 10px;
    border-radius: 4px;
`;

const ListItem = styled.li`
    &:hover {
        background-color: #1976d2;
    }
`;

const BCButton = ( props: IBCButton ) => {

    const {
        text, variant, width, height,
        padding, className, bgColor,
        color, disabled, icon,
        menu, style,
        onClick
    } = props;

    const [ open, setOpen ] = useState<boolean>();
    const ref = useRef();

    /**
     * Click OutSide Component
     */
    clickOutside(ref, useCallback( () => setOpen( false ), [] ));

    /**
     * @return {void}
     */
    const handleClick = () => {
        onClick && onClick();
        menu?.length > 0 && setOpen( !open );
    }

    return (
        <ButtonStyle
            ref={ref}
            className={`${variant || 'outlined'} ${className ? className: ''}`}
            style={style}
            disabled={disabled}
            variant={variant}
            height={height}
            width={width}
            padding={padding}
            bgColor={bgColor}
            color={color}
            onClick={handleClick} >
            <div className="flex items-center justify-center">
                { icon && <BCIcon {...icon} /> }
                { text && <div className={`${icon ? "ml-1.5" : ""} px-1 font-normal`}>{ text }</div> }
            </div>
            { open && <List> { _.map( menu, ( item ) => <ListItem> { React.cloneElement(item) } </ListItem>) } </List> }
        </ButtonStyle>
    );
}

export default BCButton;