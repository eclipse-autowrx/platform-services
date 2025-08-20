// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect, useRef } from 'react';
import Konva from 'konva';
import { Ellipse as Konva_Ellipse, Transformer as Konva_Transformer } from "react-konva";
import { Html } from 'react-konva-utils';

import { BCHover, IBCHover } from '../common';
import { IShape } from '.';
import { SHAPE } from './constant';
import { ASPECT_RATIO } from '../draw-area/bc-draw-area';

export interface IEllipse extends IShape {
    startX?: number;
    startY?: number;
    radiusX?: number;
    radiusY?: number;
}

const BCEllipse = ( props: IEllipse ) => {

    const {
        x, y, radiusX, radiusY, width, height,
        hoverMessage, isFocus, url, viewOnly,
        scaleX, scaleY,
        onShapeActionStart, onShapeActionEnd, onSelectedShape,
        navigate, onChangePointer
    } = props

    /**
     * useState
     */
    const [ hover, setHover ] = useState<IBCHover>();

    /**
     * useRef
     */
    const shapeRef = useRef<Konva.Ellipse>();
    const trRef = useRef<Konva.Transformer>();

    /**
     * useEffect
     */
    useEffect( () => {
        if ( isFocus && trRef.current ) {
            ( trRef.current as any ).nodes([shapeRef.current]);
            ( trRef.current as any ).getLayer().batchDraw();
        }
    }, [ isFocus ] );

    /**
     * @param {any} event
     * @return {void}
     */
    const onDragEnd = ( event: any ) => {
        if ( viewOnly ) return;

        const { x, y } = event.target.attrs;
        onShapeActionEnd({ type: SHAPE.ELLIPSE, x: x / scaleX, y: y / scaleY });
    }

    /**
     * @return {void}
     */
    const onTransformEnd = () => {
        if ( viewOnly ) return;

        const node: any = shapeRef.current;
        const width: number = node.width() * node.scaleX() / scaleX;
        const height: number = node.height() * node.scaleY() / scaleY;

        onShapeActionEnd({
            type: SHAPE.ELLIPSE,
            x: node.x() / scaleX,
            y: node.y() / scaleY,
            width, height,
            radiusX: width / 2,
            radiusY: height / 2,
        });

        node.scaleX(1);
        node.scaleY(1);
    }

    /**
     * @return {void}
     */
    const onMouseEnter = () => {
        onChangePointer( viewOnly ? 'pointer' : 'grab' );
        setHover({ left: 0, top: 0, text: hoverMessage });
    }

    /**
     * @return {void}
     */
    const onMouseLeave = () => {
        onChangePointer( null );
        setHover(null);
    }

    /**
     * @return {void}
     */
    const handleNavigate = () => {
        url && navigate && navigate(url);
    }

    /**
     * @param {Object} props
     * @return {void}
     */
    const setOffsetHover = ( props: { offsetWidth: number, offsetHeight: number }) => {
        setHover({
            left: x * scaleX - props.offsetWidth / 2,
            top: y * scaleY - props.offsetHeight - radiusY * scaleY - 10,
            text: hoverMessage,
        });
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
                viewOnly ? (
                    <Html>
                        <div
                            onClick={handleNavigate}
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                            style={{
                                width: `${radiusX * scaleX * ASPECT_RATIO + 10}px`,
                                height: `${radiusY * scaleY * ASPECT_RATIO + 10}px`,
                                top: `${y * scaleY}px`,
                                left: `${x * scaleX}px`,
                                position: 'absolute',
                                transform: 'translate( -50%, -50% )'
                            }}
                        >
                            <div style={{
                                    boxShadow: '0 14px 28px rgb( 0 0 0/25% ), 0 10px 10px rgb(0 0 0/22%)',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    visibility: `${hover ? 'visible' : 'hidden'}`
                                }}>
                            </div>
                        </div>
                    </Html>
                ) : (
                    <>
                        { isFocus && ( <Konva_Transformer ref={trRef} rotateEnabled={false} /> ) }
                        <Konva_Ellipse
                            draggable
                            ref={shapeRef}
                            x={x * scaleX}
                            y={y * scaleY}
                            width={width * scaleX}
                            height={height * scaleY}
                            stroke={'black'}
                            strokeWidth={2}
                            radiusX={radiusX * scaleX}
                            radiusY={radiusY * scaleY}
                            onMouseDown={() => onSelectedShape( props ) }
                            onDragStart={onShapeActionStart}
                            onDragEnd={onDragEnd}
                            onTransformStart={onShapeActionStart}
                            onTransformEnd={onTransformEnd}
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                        />
                    </>
                )
            }
        </>
    );
}

export default BCEllipse;