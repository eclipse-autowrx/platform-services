// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import _ from 'lodash';

import { BCDrawArea, ISave } from '../draw-area';
import { IShape, IAllShape, IBCText } from '../shapes';
import { Editor } from '../editor';
import { SHAPE } from '../shapes/constant';

interface IImageAreaEdit {
    shapes?: IShape[];
    bgImage?: string;
    bgColor?: string;
    onSave?: ( data: ISave ) => void;
    handleUploadImage?: ( file: File ) => void;
}

const ImageAreaEdit = ( props: IImageAreaEdit ) => {

    const { shapes, bgImage, bgColor } = props;

    /**
     * useState
     */
    const [ shape, setShape ] = useState<IAllShape>();
    const [ left, setLeft ] = useState<boolean>();
    const [ isChanged, setChanged ] = useState<boolean>();
    const [ displayShapes, setDisplayShapes ] = useState<IShape[]>();
    const [ displayBgColor, setDisplayBgColor ] = useState<string>();

    /**
     * useEffect
     */
    useEffect( () => {
        setDisplayShapes( _.filter( shapes, ( shape: IShape ) => shape.id ) );
        onClose();
    }, [ shapes ] );
    useEffect( () => setDisplayBgColor( bgColor ), [ bgColor ] );

    /**
     * @param {string} id
     * @return {void}
     */
    const onDelete = ( id: string ) => {
        const _shapes: IShape[]  = _.reject( displayShapes, ( shape: IAllShape ) => shape.id === id );

        setDisplayShapes( _shapes );
        !isChanged && setChanged(true);
        onClose();
    };

    /**
     * @param {IAllShape} currShape
     * @return {void}
     */
    const onSaveEditor = ( currShape: IAllShape ) => {
        const index: number = _.findIndex( displayShapes, ( shape: IAllShape ) => shape.id === currShape.id );

        if ( index === -1 ) return;

        displayShapes[ index ] = _.merge( displayShapes[ index ], currShape );
        setDisplayShapes([ ...displayShapes ]);
        !isChanged && setChanged(true);
    }

    /**
     * @param {IAllShape} selectedShape
     * @return {void}
     */
    const onSelectedShape = ( selectedShape: IAllShape ) => {
        setShape( _.cloneDeep( selectedShape ) );

        if ( !selectedShape ) return;

        const container = document.getElementById('container');
        const selectedShapePos: number = selectedShape.x * ( selectedShape.scaleX || 1 ) + selectedShape.width;
        setLeft( selectedShapePos > container.clientWidth / 2 );
    }

    /**
     * @return {void}
     */
    const onClose = () => {
        setShape( null );
    }

    /**
     * @param {ISave} data
     * @return {void}
     */
    const onSave = ( data: ISave ) => {
        setChanged( false );

        data.shapes = _.filter( data.shapes, ( shape: IAllShape ) => {
            return !( !shape.width || !shape.height || shape.type === SHAPE.TEXT && _.isEmpty( ( shape as IBCText ).text ) );
        } );

        props.onSave( data );
    }

    /**
     * @param {IAllShape[]} shapes
     * @param {boolean?} notChange
     * @return {void}
     */
    const onSetDisplayShapes = ( shapes: IAllShape[], notChange?: boolean ) => {
        setDisplayShapes( shapes );
        !isChanged && !notChange && setChanged(true);
    }

    /**
     * @param {File} file
     * @return {void}
     */
    const onHandleUploadImage = ( file: File ) => {
        props.handleUploadImage( file );
        !isChanged && setChanged(true);
    }

    return (
        <div className="flex w-full h-full relative" id="container">
            <BCDrawArea
                displayShapes={displayShapes}
                bgImage={bgImage}
                displayBgColor={displayBgColor}
                selectedShape={shape}
                isChanged={isChanged}
                onSetDisplayShapes={onSetDisplayShapes}
                handleUploadImage={onHandleUploadImage}
                onSave={onSave}
                onDelete={onDelete}
                onSelectedShape={onSelectedShape} />
            {
                shape?.id && (
                    <div className={`${left ? 'left-0' : 'right-0'} border border-solid border-slate-200
                        p-2.5 absolute bg-white top-14 shadow-lg shadow-slate-700`} style={{ minWidth: '300px' }} >
                        <Editor shape={shape} onSave={onSaveEditor} onDelete={onDelete} onClose={onClose} />
                    </div>
                )
            }
        </div>
    );
}

export default ImageAreaEdit;