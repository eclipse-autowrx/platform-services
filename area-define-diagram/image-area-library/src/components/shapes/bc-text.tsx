// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useState, useRef, useEffect } from 'react';
import Konva from 'konva';
import { Text as Konva_Text, Transformer as Konva_Transformer } from "react-konva";
import { Html } from 'react-konva-utils';
import _ from 'lodash';

import { IShape } from '.';
import { SHAPE } from './constant';
import BCHover, { IBCHover } from '../common/bc-hover';

export const FONT_SIZE = {
    SMALL: { label: 'Small', value: 14 },
    MEDIUM: { label: 'Medium', value: 18 },
    LARGE: { label: 'Large', value: 24 },
    EXTRA_LARGE: { label: 'Extra Large', value: 30 },
}

export interface IBCText extends IShape {
    text?: string;
    fontSize?: number;
    fill?: string;
    edit?: boolean;
}

const BCText = ( props: IBCText ) => {

    const {
        x, y, hoverMessage, isFocus, url,
        scaleX, scaleY, viewOnly, width, height,
        text, fontSize, fill, edit,
        onShapeActionStart, onShapeActionEnd,
        onSelectedShape, navigate, onChangePointer,
    } = props;

    /**
     * useState
     */
    const [ hover, setHover ] = useState<IBCHover>();
    const [ isEdit, setIsEdit ] = useState<boolean>();
    const [ dspText, setDspText ] = useState<string>();
    const [ textHeight, setTextHeight ] = useState<number>(0);

    /**
     * useRef
     */
    const shapeRef = useRef<Konva.Text>();
    const trRef = useRef<Konva.Transformer>();
    const textareaRef = useRef<HTMLTextAreaElement>();

    /**
     * useEffect
     */
    useEffect( () => setDspText( text ), [ text ] );
    useEffect( () => setIsEdit( edit ), [ edit ] );
    useEffect( () => {
        if ( isFocus && trRef.current ) {
            ( trRef.current as any ).nodes([shapeRef.current]);
            ( trRef.current as any ).getLayer().batchDraw();
            return;
        }

        !isFocus && isEdit && onKeyDownTextArea({ keyCode: 27 });
    }, [ isFocus ] );

    /**
     * @param {object}
     * @return {void}
     */
    const onKeyDownTextArea = ({ keyCode }) => {
        switch ( keyCode ) {
            case 27: // ESC
                setTextHeight( textareaRef?.current?.scrollHeight );
                onShapeActionEnd({ type: SHAPE.TEXT, text: dspText, height: getHeight(), edit: false }, true);
                setIsEdit( false );
                onMouseLeave();
                break;
        }
    }

    /**
     * @param {any} event
     * @return {void}
     */
    const onDragEnd = ( event: any ) => {
        if ( viewOnly ) return;

        const { x, y } = event.target.attrs;
        onShapeActionEnd({
            type: SHAPE.TEXT,
            x: x / scaleX,
            y: y / scaleY,
            text: dspText,
        });
    }

    /**
     * @return {void}
     */
    const onTransformEnd = () => {
        if ( viewOnly ) return;

        const node: any = shapeRef.current;

        onShapeActionEnd({
            type: SHAPE.TEXT,
            x: node.x() / scaleX,
            y: node.y() / scaleY,
            width: node.width() * node.scaleX() / scaleX,
            height: node.height() * node.scaleY() / scaleY,
            text: dspText,
        });

        node.scaleX(1);
        node.scaleY(1);
    }

    /**
     * @return {void}
     */
    const onMouseEnter = () => {
        onChangePointer( viewOnly ? 'pointer' : 'grab' );
        setHover({ left: 0, top:  0, text: hoverMessage });
    }

    /**
     * @return {void}
     */
    const onMouseLeave = () => {
        onChangePointer( null );
        setHover( null );
    }

    /**
     * @return {void}
     */
    const handleNavigate = () => {
        url && navigate && navigate( url );
    }

    /**
     * @param {Object} props
     * @return {void}
     */
    const setOffsetHover = ( props: { offsetWidth: number, offsetHeight: number }) => {
        setHover({
            left: x * scaleX + width * scaleX / 2  - props.offsetWidth / 2,
            top: y * scaleY - props.offsetHeight,
            text: hoverMessage,
        });
    }

    /**
     * @return {number}
     */
    const getHeight = (): number => {
        const scrollHeight: number = textareaRef?.current?.scrollHeight || 0;
        const res: number = scrollHeight > textHeight ? scrollHeight : textHeight;
        return height > res ? height : res;
    }

    /**
     * @return {void}
     */
    const onDblClick = () => {
        setIsEdit( true );
        onMouseLeave();
    }

    /**
     * @return {HTMLElement}
     */
    const renderKonVaText = () => {
        const commonConfig: Konva.TextConfig = {
            fill,
            fontSize,
            text: dspText,
            lineHeight: 1.5,
            x: x * scaleX,
            y: y * scaleY,
            width: width * scaleX,
            padding: 5,
            height: getHeight(),
            onMouseEnter,
            onMouseLeave,
        };

        const config: Konva.TextConfig = viewOnly ? {
            ...commonConfig,
            onClick: handleNavigate,
        } : {
            ...commonConfig,
            ref: shapeRef,
            draggable: true,
            onDragStart: onShapeActionStart,
            onDragEnd,
            onTransformStart: onShapeActionStart,
            onTransformEnd,
            onMouseDown: () => { onSelectedShape( props ) },
            onDblClick,
        };

        return <Konva_Text {...config}/>;
    }

    return (
        <>
            {
                hover?.text && (
                    <BCHover
                        top={hover?.top}
                        left={hover?.left}
                        right={hover?.right}
                        bottom={hover?.bottom}
                        text={hover?.text}
                        setOffsetHover={setOffsetHover} />
                )
            }
            {
                viewOnly
                    ? renderKonVaText()
                    : isEdit ? (
                        <Html>
                            <textarea
                                autoFocus
                                ref={textareaRef}
                                value={dspText}
                                onChange={( event: any ) => setDspText(event.target.value)}
                                onKeyDown={onKeyDownTextArea}
                                onMouseEnter={onMouseEnter}
                                onMouseLeave={onMouseLeave}
                                style={{
                                    position: 'absolute',
                                    top: `${y * scaleY}px`,
                                    left: `${x * scaleX}px`,
                                    fontSize: `${fontSize}px`,
                                    color: `${fill}`,
                                    width: `${width * scaleX}px`,
                                    height: `${getHeight()}px`,
                                    border: '1px dashed lightgrey',
                                    padding: '5px',
                                    margin: '0px',
                                    overflow: 'hidden',
                                    background: 'none',
                                    outline : 'none',
                                    resize: 'none',
                                    transformOrigin: 'left top',
                                    lineHeight: 1.5,
                                }}
                            ></textarea>
                        </Html>
                    ) : (
                        <>
                            { isFocus && ( <Konva_Transformer ref={trRef} rotateEnabled={false} /> ) }
                            { renderKonVaText() }
                        </>
                    )
            }
        </>
    );

}
export default BCText;