// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React from 'react';

import ImageAreaEdit from './image-area-edit';
import ImageAreaPreview from './image-area-preview';
import { ISave } from '../draw-area';
import { IShape } from '../shapes';

type IMode = 'Edit' | 'Preview';

interface IImageArea {
    mode: IMode;
    shapes?: IShape[];
    bgImage?: string;
    bgColor?: string;
    onSave?: ( data: ISave ) => void;
    handleUploadImage?: ( file: File ) => void;
    navigate?: ( url: string ) => void;
}

const ImageArea = ( props: IImageArea ) => {

    const {
        mode, shapes, bgImage, bgColor,
        onSave, handleUploadImage, navigate
    } = props;

    const render = () => {
        switch ( mode ) {
            case 'Edit':
                return (
                    <ImageAreaEdit
                        shapes={shapes}
                        bgImage={bgImage}
                        bgColor={bgColor}
                        onSave={onSave}
                        handleUploadImage={handleUploadImage} />
            );
            case 'Preview':
                return (
                    <ImageAreaPreview
                        shapes={shapes}
                        bgColor={bgColor}
                        bgImage={bgImage}
                        navigate={navigate} />
                );
            default:
                return <div>Wrong mode</div>
        }
    };

    return (
        <div className='flex flex-column'>
            { render() }
        </div>
    );
}

export default ImageArea;