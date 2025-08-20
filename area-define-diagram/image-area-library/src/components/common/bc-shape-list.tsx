// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import _ from 'lodash';

import { SHAPE } from '../shapes/constant';
import { ALL_ICONS, BCIcon } from './bc-icon';
import BCDivider from './bc-divider';
import BCButton from './bc-button';

interface IBCShapeList {
    disabled?: boolean;
    type?: string;
    handleChange?: ( type: string ) => void;
}

const GroupButtons = styled.div`
    display: flex;
    width: fit-content;
    max-width: 200px;
    align-items: center;
`;

const IconButton = styled.button<{disabled: boolean}>`
    padding: 5px;
    border-radius: 5px;
    
    &:hover:enabled {
        background: #e8f1ff;
    }

    &.active:enabled {
        background: #b8d6ff;
    }
`;

const MenuStyle = styled.div`
    z-index: 2;
    background-color: white;
    width: 200px;
    max-height: 200px;
    text-align: left;
    position: absolute;
    padding: 10px;
    margin-top: 10px;
    transform: translateX(-42%);
    border-radius: 4px;
    box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 0px 1px, rgba(0, 0, 0, 0.15) 0px 8px 16px;
    overflow-y: auto;
`;

export const SHAPES: string[] = [ SHAPE.RECTANGLE, SHAPE.ELLIPSE, SHAPE.TEXT ];
export const ICONS: string[] = [
    SHAPE.PIN , SHAPE.CLOSE, SHAPE.LIKE , SHAPE.DISLIKE , SHAPE.SAND_CLOCK,
    SHAPE.ONE, SHAPE.TWO, SHAPE.THREE, SHAPE.FOUR, SHAPE.FIVE,
];
const MAX_SHAPE: number = 5;
const MAX_ICON: number = 5;
type IMoreButtonType = 'shape' | 'icon';

const BCShapeList = ( props: IBCShapeList ) => {

    const { type, disabled, handleChange } = props;

    /**
     * useState
     */
    const [ dspType, setDspType ] = useState<string>(SHAPE.RECTANGLE);

    /**
     * useRef
     */
    const iconsRef = useRef([]);
    const shapesRef = useRef([]);

    /**
     * useEffect
     */
    useEffect( () => setDspType( type ), [ type ] );

    /**
     * @param {string} type
     * @return {void}
     */
    const onChange = ( type: string ): void => {
        if ( disabled ) return;
        handleChange( type );
        setDspType( type );
    }

    /**
     * @param {boolean=} isShowFull
     * @return {HTMLElement}
     */
    const shapeRender = ( isShowFull?: boolean ) => {
        const shapes: string[] = isShowFull ? SHAPES : ( shapesRef.current?.length ? shapesRef.current :_.slice( SHAPES, 0, MAX_SHAPE ) );

        if ( !isShowFull ) shapesRef.current = shapes;

        if ( !_.includes( ICONS, dspType ) && !_.includes( shapes, dspType ) ) {
            shapes.unshift( dspType );
            shapes.pop();
        }

        const dspShape = ( type: string ) => {
            switch ( type ) {
                case SHAPE.RECTANGLE: return <BCIcon name={ALL_ICONS.RECTANGLE} className="w-6" />;
                case SHAPE.ELLIPSE: return <BCIcon name={ALL_ICONS.ELLIPSE} className="w-6" />;
                case SHAPE.TEXT: return <BCIcon name={ALL_ICONS.TEXT} fill={'black'} className="w-6" />
            }
        }

        return _.map( shapes, ( shape: string ) =>
            <IconButton
                disabled={disabled}
                className={`${dspType === shape ? 'active' : ''}`}
                onClick={() => onChange( shape )} >
                { dspShape( shape ) }
            </IconButton>
        ); 
    }

    /**
     * @param {boolean=} isShowFull
     * @return {HTMLElement}
     */
    const iconRender = ( isShowFull?: boolean ) => {
        const icons: string[] = isShowFull ? ICONS : ( iconsRef.current?.length ? iconsRef.current :_.slice( ICONS, 0, MAX_ICON ) );
 
        if ( !isShowFull ) iconsRef.current = icons;

        if ( !_.includes( SHAPES, dspType ) && !_.includes( icons, dspType ) ) {
            icons.unshift( dspType );
            icons.pop();
        }

        const dspIcon = ( type: string ) => {
            switch( type ) {
                case SHAPE.PIN: return <BCIcon name={ALL_ICONS.LOCATION} fill="#BE3144" className="w-6" />;
                case SHAPE.CLOSE: return <BCIcon name={ALL_ICONS.CLOSE} fill="#BE3144" className="w-6" />;
                case SHAPE.LIKE: return <BCIcon name={ALL_ICONS.LIKE} fill="#1976d2" className="w-6" />;
                case SHAPE.DISLIKE: return <BCIcon name={ALL_ICONS.DISLIKE} fill="#BE3144" className="w-6" />;
                case SHAPE.SAND_CLOCK: return <BCIcon name={ALL_ICONS.SAND_CLOCK} fill="#FFC436" className="w-6" />;
                case SHAPE.ONE: return <BCIcon name={ALL_ICONS.ONE} fill="#BE3144" className="w-6" />;
                case SHAPE.TWO: return <BCIcon name={ALL_ICONS.TWO} fill="#FFA33C" className="w-6" />;
                case SHAPE.THREE: return <BCIcon name={ALL_ICONS.THREE} fill="#FFFB73" className="w-6" />;
                case SHAPE.FOUR: return <BCIcon name={ALL_ICONS.FOUR} fill="#45FFCA" className="w-6" />;
                case SHAPE.FIVE: return <BCIcon name={ALL_ICONS.FIVE} fill="#3D30A2" className="w-6" />;
            }
        }

        return _.map( icons, ( icon: string ) =>
            <IconButton
                disabled={disabled}
                className={`${dspType === icon ? 'active' : ''}`}
                onClick={() => onChange( icon )} >
                { dspIcon( icon ) }
            </IconButton>
        ); 
    }

    /**
     * @param {IMoreButtonType} type
     * @return {HTMLElement}
     */
    const renderMoreButton = ( type: IMoreButtonType ) => {
        return (
            <BCButton
                icon={{ name: 'three-dot', fill: 'rgb(107 114 128)' }}
                disabled={disabled}
                width="30px"
                height="25px"
                color="white"
                variant="contained"
                bgColor="transparent"
                className="ml-0.5 border-dashed border-2 border-gray-500"
                menu={[<MenuStyle>{ type === 'shape' ? shapeRender( true ) : iconRender( true ) }</MenuStyle>]} />
        );


    }

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex items-center w-full h-full">
                {/* Shape */}
                <GroupButtons>
                    { shapeRender() }
                    { SHAPES?.length > MAX_SHAPE && renderMoreButton( 'shape' ) }
                </GroupButtons>
                <BCDivider color="lightgray" className="mx-2.5"/>
                {/* icon */}
                <GroupButtons>
                    { iconRender() }
                    { ICONS?.length > MAX_ICON && renderMoreButton( 'icon' ) }
                </GroupButtons>
                <BCDivider color="lightgray" className="mx-2.5"/>
            </div>
        </div>
    );

}

export default BCShapeList;