// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useState, useRef, useEffect } from "react";
import Konva from 'konva';
import { Image as Konva_Image, Transformer as Konva_Transformer } from 'react-konva';
import { useImage } from 'react-konva-utils';

import { IShape } from '.';
import BCHover, { IBCHover } from '../common/bc-hover';
import { BCIconSvg } from "../common";
import { encodeSvg } from "../helpers";

export interface IBCShapeIcon extends IShape {
    name: string;
    fill?: string;
}

const BCShapeIcon = ( props: IBCShapeIcon ) => {

    const {
        x, y, hoverMessage, isFocus, url,
        scaleX, scaleY, viewOnly, width, height,
        name, fill, type,
        onShapeActionStart, onShapeActionEnd,
        onSelectedShape, navigate, onChangePointer
    } = props;

    /**
     * useState
     */
    const [ hover, setHover ] = useState<IBCHover>();
    const [imageObj] = useImage( encodeSvg(<BCIconSvg name={name} fill={fill} />) );

    /**
     * useRef
     */
    const shapeRef = useRef<Konva.Image>();
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
        onShapeActionEnd({ type, x: x / scaleX, y: y / scaleY });
    }

    /**
     * @return {void}
     */
    const onTransformEnd = () => {
        if ( viewOnly ) return;

        const node: any = shapeRef.current;

        onShapeActionEnd({
            type,
            x: node.x() / scaleX,
            y: node.y() / scaleY,
            width: node.width() * node.scaleX() / scaleX,
            height: node.height() * node.scaleY() / scaleY,
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
            left: x * scaleX + width * scaleX / 2  - props.offsetWidth / 2,
            top: y * scaleY - props.offsetHeight - 10,
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
                        setOffsetHover={setOffsetHover}
                    />
                )
            }
            {
                viewOnly ? (
                    <Konva_Image
                        x={x * scaleX}
                        y={y * scaleY}
                        width={width * scaleX}
                        height={height * scaleY}
                        image={imageObj}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onClick={handleNavigate}
                    />
                ) : (
                    <>
                        { isFocus && ( <Konva_Transformer ref={trRef} rotateEnabled={false} /> ) }
                        <Konva_Image
                            draggable
                            ref={shapeRef}
                            x={x * scaleX}
                            y={y * scaleY}
                            width={width * scaleX}
                            height={height * scaleY}
                            image={imageObj}
                            onMouseDown={() => { onSelectedShape( props ) }}
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
export default BCShapeIcon;
