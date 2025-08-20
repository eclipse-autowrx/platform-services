// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect, useCallback, useRef } from "react";
import { SketchPicker } from 'react-color';
import styled from 'styled-components';

import { clickOutside } from '../helpers';
import { ALL_ICONS, BCIcon } from "./bc-icon";

interface IBCColorPicker {
    disabled?: boolean;
    isShowFillIcon?: boolean;
    hex: string;
    setHex: ( val: string ) => void;
}

const Sketch = styled.div`
    position: absolute;
    z-index: 1;
    background: white;
    box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 0px 1px, rgba(0, 0, 0, 0.15) 0px 8px 16px;
    transform: translateX(-40%);

    .sketch-picker {
        box-shadow: none!important;
        background: none!important;
    }
`;

const ButtonItem = styled.div`
    display: flex;
    align-items: center;
    padding: 8px;

    &:hover {
        background-color: rgb(248 250 252);
    }
`

const TRANSPARENT_COLOR: string = 'transparent';

const BCColorPicker = ( props: IBCColorPicker ) => {

    const { disabled, hex, isShowFillIcon, setHex } = props;
    
    /**
     * useState
     */
    const [ open, setOpen ] = useState<boolean>();
    const [ dspHex, setDspHex ] = useState<string>( TRANSPARENT_COLOR );

    /**
     * useRef
     */
    const ref = useRef();

    /**
     * useEffect
     */
    useEffect( () => setDspHex( hex ), [ hex ]);

    /**
     * @return {void}
     */
    const checkKeyPress = useCallback(({ keyCode }) => keyCode === 27 && open && setOpen(false), [ open ]); // ESC key
    
    useEffect( () => {
        window.addEventListener("keydown", checkKeyPress);
        return () => window.removeEventListener("keydown", checkKeyPress);
    }, [ checkKeyPress ] );

    /**
     * Click OutSide Component
     */
    clickOutside(ref, useCallback( () => setOpen( false ), [] ));

    /**
     * @param {any} event
     * @return {void}
     */
    const onChange = ( event: any ) => {
        setHex( event?.hex );
    }

    return (
        <>
            <div className="relative cursor-pointer">
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col" onClick={() => !disabled && setOpen( !open )}>
                        {
                            isShowFillIcon ? (
                                <>
                                    <BCIcon name={ALL_ICONS.FILL} className="w-5 m-auto mb-1"/>
                                    <div className="w-7 h-1" style={{ backgroundColor: `${dspHex === TRANSPARENT_COLOR ? 'white' : dspHex}` }}></div>
                                </>
                            ) : (
                                <div className="w-10 h-5" style={{ backgroundColor: `${dspHex === TRANSPARENT_COLOR ? 'white' : dspHex}` }}></div>
                            )
                        }
                    </div>
                </div>
                { open && (
                <Sketch ref={ref}>
                    <SketchPicker color={hex} onChange={onChange} style={{ boxShadow: 'none !important' }}/>
                    <ButtonItem className={`${dspHex === TRANSPARENT_COLOR ? 'bg-slate-300': 'bg-white'}`} onClick={() => onChange({ hex: TRANSPARENT_COLOR })}>
                        <BCIcon style={{ width: '23px' }} name={ALL_ICONS.SQUARE} fill="black" />
                        <div className="ml-1.5 text-black text-base font-semibold">No Fill</div>
                    </ButtonItem>
                </Sketch>
            ) }
            </div>
        </>
    );
}

export default BCColorPicker;